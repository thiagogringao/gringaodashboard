/**
 * Serviço de backup completo do MySQL para SQLite
 */

const { poolLojaFisica } = require('../config/database');
const cacheDb = require('../config/cacheDatabase');

class SQLiteBackupService {
  /**
   * Fazer backup completo de todos os produtos
   */
  async backupFullLojaFisica() {
    console.log('\n=== Iniciando Backup Completo para SQLite ===\n');
    const startTime = Date.now();

    try {
      // 1. Buscar todos os produtos com dados básicos
      console.log('📦 Buscando produtos do MySQL...');
      const [produtos] = await poolLojaFisica.query(`
        SELECT
          p.CODIGO_INTERNO as codigoInterno,
          p.CODIGO_BARRAS as codigoBarras,
          p.DESCRICAO as descricao,
          p.DESCRICAO_RESUMIDA as descricaoResumida,
          p.CODIGO_FORNECEDOR as codigoFornecedor,
          COALESCE(e.SALDO_ATUAL, 0) as estoque,
          COALESCE(
            NULLIF(v.VALOR_REVENDA, 0),
            NULLIF(v.VALOR_ATACADO, 0),
            NULLIF(v.VALOR_VAREJO, 0),
            e.VALOR_VENDA,
            0
          ) as precoVenda,
          CASE
            WHEN v.VALOR_REVENDA IS NOT NULL AND v.VALOR_REVENDA > 0 THEN 'revenda'
            WHEN v.VALOR_ATACADO IS NOT NULL AND v.VALOR_ATACADO > 0 THEN 'atacado'
            WHEN v.VALOR_VAREJO IS NOT NULL AND v.VALOR_VAREJO > 0 THEN 'varejo'
            ELSE 'estoque'
          END as tipoPreco,
          COALESCE(v.CUSTO, 0) as precoCusto,
          f.NOME as fornecedor,
          v.img as imagemBase64
        FROM produtos p
        LEFT JOIN estoque e ON p.CODIGO_INTERNO = e.CODIGO_INTERNO AND e.COD_LOCAL = '001'
        LEFT JOIN fornecedores f ON p.CODIGO_FORNECEDOR = f.CODIGO_FORNECEDOR
        LEFT JOIN vw_dprodutos v ON LPAD(p.CODIGO_INTERNO, 13, '0') = v.CODIGO_INTERNO
        ORDER BY p.CODIGO_INTERNO
      `);

      console.log(`✅ ${produtos.length} produtos encontrados`);

      // 2. Buscar análise de vendas de todos os produtos de uma vez (últimos 12 meses para análise completa)
      console.log('📊 Buscando análise de vendas (últimos 12 meses)...');
      const [vendasPorProduto] = await poolLojaFisica.query(`
        SELECT
          CODIGO_PRODUTO as codigoProduto,
          MONTH(DATA) as mes,
          YEAR(DATA) as ano,
          SUM(QUANTIDADE) as quantidade,
          COUNT(*) as numeroVendas,
          AVG(VALOR_UNITARIO) as precoMedio,
          SUM(VALOR_CUSTO_SUBT) / SUM(QUANTIDADE) as custoMedio
        FROM caixas_venda
        WHERE DATA >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY CODIGO_PRODUTO, YEAR(DATA), MONTH(DATA)
        ORDER BY CODIGO_PRODUTO, ano DESC, mes DESC
      `);

      // Organizar vendas por produto
      const vendasMap = {};
      vendasPorProduto.forEach(venda => {
        if (!vendasMap[venda.codigoProduto]) {
          vendasMap[venda.codigoProduto] = [];
        }
        vendasMap[venda.codigoProduto].push(venda);
      });

      console.log(`✅ Análise de vendas para ${Object.keys(vendasMap).length} produtos`);

      // 3. Processar e salvar no SQLite
      console.log('💾 Salvando no SQLite...');
      
      const insertStmt = cacheDb.prepare(`
        INSERT OR REPLACE INTO produtos (
          codigo_interno, codigo_barras, descricao, descricao_resumida,
          codigo_fornecedor, estoque, preco_venda, preco_custo, margem, tipo_preco, fornecedor, imagem_base64,
          estoque_minimo, mes_pico, media_mensal, total_vendas, vendas_mensais,
          historico_12_meses, analise_preditiva, mes_pico_numero,
          tendencia_percentual, previsao_proximo_mes, risco_ruptura, dias_estoque,
          estoque_ideal_sugerido,
          data_atualizacao
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `);

      // Usar transação para inserir tudo de uma vez (muito mais rápido)
      const insertMany = cacheDb.transaction((produtos) => {
        for (const produto of produtos) {
          // Calcular análise de vendas (6 meses) e preditiva (12 meses)
          const vendasMensais = vendasMap[produto.codigoInterno] || [];
          const analise = this.calcularAnaliseVendas(vendasMensais);
          const analisePreditiva = this.calcularAnalisePreditiva(vendasMensais, produto);

          // Processar imagem
          let imagemBase64 = null;
          if (produto.imagemBase64) {
            if (produto.imagemBase64.startsWith('data:')) {
              imagemBase64 = produto.imagemBase64;
            } else if (produto.imagemBase64.startsWith('http://') || produto.imagemBase64.startsWith('https://')) {
              imagemBase64 = produto.imagemBase64;
            } else {
              imagemBase64 = `data:image/jpeg;base64,${produto.imagemBase64}`;
            }
          }

          // Usar preço de custo da vw_dprodutos (mais confiável) ou calcular da média de vendas
          const precoCusto = parseFloat(produto.precoCusto) || (
            vendasMensais.length > 0
              ? vendasMensais.reduce((acc, v) => acc + parseFloat(v.custoMedio || 0), 0) / vendasMensais.length
              : 0
          );
          
          const margem = produto.precoVenda > 0 && precoCusto > 0
            ? parseFloat(((produto.precoVenda - precoCusto) / produto.precoVenda * 100).toFixed(2))
            : 0;

          insertStmt.run(
            produto.codigoInterno,
            produto.codigoBarras,
            produto.descricao,
            produto.descricaoResumida,
            produto.codigoFornecedor,
            produto.estoque,
            produto.precoVenda,
            parseFloat(precoCusto.toFixed(2)),
            margem,
            produto.tipoPreco || 'estoque',
            produto.fornecedor,
            imagemBase64,
            analise.estoqueMinimo,
            analise.mesPico,
            analise.mediaMensal,
            analise.totalVendas,
            JSON.stringify(analise.vendasMensais || []),
            // Novos campos de análise preditiva
            JSON.stringify(analisePreditiva.historicoCompleto || []),
            JSON.stringify(analisePreditiva.analise || {}),
            analisePreditiva.mesPicoNumero || null,
            analisePreditiva.tendenciaPercentual || 0,
            analisePreditiva.previsaoProximoMes || 0,
            analisePreditiva.riscoRuptura || 'sem_dados',
            analisePreditiva.diasEstoque || 0,
            analisePreditiva.estoqueIdealSugerido || 0
          );
        }
      });

      insertMany(produtos);

      // 4. Salvar metadados do backup
      const metaStmt = cacheDb.prepare(`
        INSERT OR REPLACE INTO backup_metadata (chave, valor, data_atualizacao)
        VALUES (?, ?, datetime('now'))
      `);

      metaStmt.run('ultima_sincronizacao', new Date().toISOString());
      metaStmt.run('total_produtos', produtos.length.toString());

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`\n✅ Backup completo finalizado em ${elapsed}s`);
      console.log(`📊 Total: ${produtos.length} produtos salvos no SQLite\n`);

      return {
        success: true,
        total: produtos.length,
        tempo: elapsed
      };

    } catch (error) {
      console.error('❌ Erro no backup completo:', error);
      throw error;
    }
  }

  /**
   * Calcular análise de vendas para um produto
   */
  calcularAnaliseVendas(vendasMensais) {
    if (!vendasMensais || vendasMensais.length === 0) {
      return {
        estoqueMinimo: 0,
        mesPico: null,
        mediaMensal: 0,
        totalVendas: 0
      };
    }

    const totalVendas = vendasMensais.reduce((acc, venda) => acc + parseFloat(venda.quantidade || 0), 0);
    const mediaMensal = totalVendas / vendasMensais.length;

    const vendaMaxima = vendasMensais.reduce((max, venda) =>
      parseFloat(venda.quantidade) > parseFloat(max.quantidade) ? venda : max
    , vendasMensais[0]);

    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const mesPico = vendaMaxima ? meses[vendaMaxima.mes - 1] : null;

    const estoqueMinimo = Math.ceil(mediaMensal * 1.5);

    // Formatar vendas mensais (últimos 6 meses)
    const vendasFormatadas = vendasMensais.slice(0, 6).map(venda => ({
      mes: meses[venda.mes - 1],
      ano: venda.ano,
      quantidade: Math.round(parseFloat(venda.quantidade || 0))
    }));

    return {
      estoqueMinimo,
      mesPico,
      mediaMensal: parseFloat(mediaMensal.toFixed(2)),
      totalVendas: parseInt(totalVendas),
      vendasMensais: vendasFormatadas
    };
  }

  /**
   * Calcular análise preditiva completa (12 meses)
   */
  calcularAnalisePreditiva(historico, produto) {
    if (!historico || historico.length === 0) {
      return {
        historicoCompleto: [],
        analise: {
          status: 'sem_dados',
          mensagem: 'Sem histórico de vendas',
          recomendacoes: []
        },
        mesPicoNumero: null,
        tendenciaPercentual: 0,
        previsaoProximoMes: 0,
        riscoRuptura: 'sem_dados',
        diasEstoque: 0
      };
    }

    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    // Formatar histórico completo (12 meses) com custos
    const historicoCompleto = historico.map((v, index) => {
      const custoAtual = parseFloat(v.custoMedio || 0);
      const custoAnterior = index < historico.length - 1 
        ? parseFloat(historico[index + 1].custoMedio || 0) 
        : custoAtual;
      
      return {
        mes: v.mes,
        ano: v.ano,
        quantidade: parseInt(v.quantidade),
        numeroVendas: parseInt(v.numeroVendas || 0),
        precoMedio: parseFloat(v.precoMedio || 0),
        custoMedio: custoAtual,
        custoAlterado: custoAnterior > 0 && Math.abs(custoAtual - custoAnterior) > 0.01 // Variação > 1 centavo
      };
    });

    // Identificar mês de pico
    const mesPico = historico.reduce((max, venda) =>
      venda.quantidade > (max.quantidade || 0) ? venda : max
    , {});

    const nomeMesPico = meses[mesPico.mes - 1];
    const datasComemorativas = {
      1: ['Ano Novo', 'Férias'], 2: ['Carnaval', 'Volta às Aulas'],
      3: ['Outono', 'Páscoa (possível)'], 4: ['Páscoa', 'Dia das Mães (preparação)'],
      5: ['Dia das Mães', 'Dia dos Namorados (preparação)'], 6: ['Dia dos Namorados', 'Festas Juninas', 'Inverno'],
      7: ['Férias de Inverno', 'Liquidações'], 8: ['Dia dos Pais'],
      9: ['Primavera', 'Dia das Crianças (preparação)'], 10: ['Dia das Crianças', 'Halloween', 'Black Friday (preparação)'],
      11: ['Black Friday', 'Natal (preparação)'], 12: ['Natal', 'Ano Novo', 'Férias', 'Verão']
    };

    const motivosPico = datasComemorativas[mesPico.mes] || ['Sazonalidade'];

    // Calcular tendência
    const ultimos3Meses = historico.slice(0, 3);
    const anteriores3Meses = historico.slice(3, 6);
    
    const mediaUltimos = ultimos3Meses.reduce((acc, v) => acc + parseFloat(v.quantidade || 0), 0) / (ultimos3Meses.length || 1);
    const mediaAnteriores = anteriores3Meses.reduce((acc, v) => acc + parseFloat(v.quantidade || 0), 0) / (anteriores3Meses.length || 1);
    
    const tendencia = mediaAnteriores > 0 
      ? ((mediaUltimos - mediaAnteriores) / mediaAnteriores * 100)
      : 0;

    // Previsão próximo mês
    const previsaoProximoMes = Math.round(mediaUltimos * (parseFloat(tendencia) > 0 ? 1.1 : 0.9));

    // Análise de risco de ruptura
    const estoqueAtual = parseInt(produto.estoque) || 0;
    const totalVendas = historico.reduce((acc, v) => acc + parseFloat(v.quantidade || 0), 0);
    const mediaMensal = totalVendas / historico.length;
    const diasParaRuptura = mediaMensal > 0 ? Math.round((estoqueAtual / mediaMensal) * 30) : 999;

    let riscoRuptura = 'baixo';
    if (diasParaRuptura < 7) riscoRuptura = 'critico';
    else if (diasParaRuptura < 15) riscoRuptura = 'alto';
    else if (diasParaRuptura < 30) riscoRuptura = 'medio';

    // Gerar recomendações
    const recomendacoes = [];

    if (riscoRuptura === 'critico') {
      recomendacoes.push({
        tipo: 'urgente',
        icone: '🚨',
        titulo: 'Risco Crítico de Ruptura',
        mensagem: `Estoque durará apenas ${diasParaRuptura} dias. Reposição urgente necessária!`
      });
    } else if (riscoRuptura === 'alto') {
      recomendacoes.push({
        tipo: 'alerta',
        icone: '⚠️',
        titulo: 'Estoque Baixo',
        mensagem: `Estoque durará ${diasParaRuptura} dias. Programe reposição em breve.`
      });
    }

    if (parseFloat(tendencia) > 20) {
      recomendacoes.push({
        tipo: 'oportunidade',
        icone: '📈',
        titulo: 'Tendência de Crescimento',
        mensagem: `Vendas aumentaram ${tendencia.toFixed(1)}% nos últimos 3 meses. Considere aumentar o estoque.`
      });
    } else if (parseFloat(tendencia) < -20) {
      recomendacoes.push({
        tipo: 'atencao',
        icone: '📉',
        titulo: 'Queda nas Vendas',
        mensagem: `Vendas caíram ${Math.abs(tendencia).toFixed(1)}% nos últimos 3 meses. Reveja estratégia.`
      });
    }

    // Recomendação baseada no mês de pico
    const mesAtual = new Date().getMonth() + 1;
    const proximosMeses = [mesAtual, mesAtual === 12 ? 1 : mesAtual + 1, mesAtual === 11 ? 1 : mesAtual + 2];
    
    if (proximosMeses.includes(mesPico.mes)) {
      recomendacoes.push({
        tipo: 'sazonalidade',
        icone: '📅',
        titulo: `Período de Pico se Aproxima (${nomeMesPico})`,
        mensagem: `Prepare estoque! ${motivosPico.join(', ')} impulsionam as vendas neste período.`
      });
    }

    // Análise de preço
    if (historico.length > 1) {
      const precoAtual = parseFloat(produto.precoVenda) || 0;
      const precoMedioVendas = parseFloat(historico[0].precoMedio) || precoAtual;
      const variacaoPreco = precoMedioVendas > 0 ? ((precoAtual - precoMedioVendas) / precoMedioVendas * 100) : 0;

      if (Math.abs(variacaoPreco) > 10) {
        recomendacoes.push({
          tipo: 'info',
          icone: '💰',
          titulo: 'Variação de Preço Detectada',
          mensagem: `Preço ${variacaoPreco > 0 ? 'aumentou' : 'diminuiu'} ${Math.abs(variacaoPreco).toFixed(1)}% recentemente.`
        });
      }
    }

    // Cálculo de estoque ideal sugerido
    // 1) Consumo médio recente (últimos até 6 meses com vendas > 0)
    const mesesComVendas = historico
      .filter(v => parseFloat(v.quantidade || 0) > 0)
      .slice(0, 6);

    const consumoMedioRecente = mesesComVendas.length > 0
      ? mesesComVendas.reduce((acc, v) => acc + parseFloat(v.quantidade || 0), 0) / mesesComVendas.length
      : mediaMensal;

    // 2) Fator por risco de ruptura
    let fatorRisco = 1.5;
    if (riscoRuptura === 'medio') fatorRisco = 2.0;
    if (riscoRuptura === 'alto') fatorRisco = 2.5;
    if (riscoRuptura === 'critico') fatorRisco = 2.5;

    let estoqueIdeal = consumoMedioRecente * fatorRisco;

    // 3) Ajuste por sazonalidade (se estamos próximos do mês de pico)
    const mesAtualNum = new Date().getMonth() + 1;
    const diffMeses = Math.min(
      (12 + mesPico.mes - mesAtualNum) % 12,
      (12 + mesAtualNum - mesPico.mes) % 12
    );

    if (diffMeses <= 2) {
      estoqueIdeal *= 1.2;
    }

    const estoqueIdealSugerido = Math.max(0, Math.round(estoqueIdeal));

    const analise = {
      status: 'completo',
      mesPico: {
        nome: nomeMesPico,
        quantidade: parseInt(mesPico.quantidade) || 0,
        motivosPossiveis: motivosPico
      },
      tendencia: {
        percentual: parseFloat(tendencia.toFixed(1)),
        direcao: parseFloat(tendencia) > 5 ? 'crescimento' : (parseFloat(tendencia) < -5 ? 'queda' : 'estavel'),
        descricao: parseFloat(tendencia) > 5 
          ? `Crescimento de ${tendencia.toFixed(1)}%`
          : (parseFloat(tendencia) < -5 ? `Queda de ${Math.abs(tendencia).toFixed(1)}%` : 'Estável')
      },
      previsao: {
        proximoMes: previsaoProximoMes,
        confianca: historico.length >= 6 ? 'alta' : 'media'
      },
      ruptura: {
        risco: riscoRuptura,
        diasEstoque: diasParaRuptura,
        mensagem: diasParaRuptura < 30 
          ? `Estoque crítico: durará ${diasParaRuptura} dias`
          : `Estoque adequado para ${diasParaRuptura} dias`
      },
      recomendacoes
    };

    return {
      historicoCompleto,
      analise,
      mesPicoNumero: mesPico.mes,
      tendenciaPercentual: parseFloat(tendencia.toFixed(2)),
      previsaoProximoMes,
      riscoRuptura,
      diasEstoque: diasParaRuptura,
      estoqueIdealSugerido
    };
  }

  /**
   * Obter estatísticas do backup
   */
  getBackupStats() {
    const totalProdutos = cacheDb.prepare('SELECT COUNT(*) as total FROM produtos').get();
    const ultimaSync = cacheDb.prepare("SELECT valor FROM backup_metadata WHERE chave = 'ultima_sincronizacao'").get();
    const comVendas = cacheDb.prepare('SELECT COUNT(*) as total FROM produtos WHERE total_vendas > 0').get();
    const comImagem = cacheDb.prepare('SELECT COUNT(*) as total FROM produtos WHERE imagem_base64 IS NOT NULL').get();

    return {
      totalProdutos: totalProdutos.total,
      ultimaSincronizacao: ultimaSync?.valor || 'Nunca',
      produtosComVendas: comVendas.total,
      produtosComImagem: comImagem.total
    };
  }
}

module.exports = new SQLiteBackupService();

