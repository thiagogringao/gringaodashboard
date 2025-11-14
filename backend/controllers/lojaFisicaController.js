const { poolLojaFisica } = require('../config/database');
const { sanitizeSearchString } = require('../utils/helpers');
const backupService = require('../services/backupService');
const cacheDb = require('../config/cacheDatabase');

// Função auxiliar para calcular estoque mínimo e mês de pico
const calcularAnaliseVendas = (vendasMensais) => {
  if (!vendasMensais || vendasMensais.length === 0) {
    return {
      estoqueMinimo: 0,
      mesPico: null,
      mediaMensal: 0
    };
  }

  const totalVendas = vendasMensais.reduce((total, venda) => total + parseFloat(venda.quantidade), 0);
  const mediaMensal = totalVendas / vendasMensais.length;

  // Encontrar mês de pico
  const vendaMaxima = vendasMensais.reduce((max, venda) =>
    parseFloat(venda.quantidade) > parseFloat(max.quantidade) ? venda : max
  , vendasMensais[0]);

  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const mesPico = vendaMaxima ? meses[vendaMaxima.mes - 1] : null;

  // Estoque mínimo = média mensal * 1.5 (margem de segurança)
  const estoqueMinimo = Math.ceil(mediaMensal * 1.5);

  return {
    estoqueMinimo,
    mesPico,
    mediaMensal: parseFloat(mediaMensal.toFixed(2))
  };
};

const getLojaFisicaProdutosAbaixoEstoqueIdeal = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;
    const offset = (page - 1) * limit;
    const search = (req.query.search || '').toString().trim().toLowerCase();

    const stmt = cacheDb.prepare('SELECT * FROM produtos');
    const produtos = stmt.all();
    
    console.log(`[Sugestão Compras] Total produtos no SQLite: ${produtos.length}`);

    const filtrados = produtos
      .filter((p) => {
        const ideal = typeof p.estoque_ideal_sugerido === 'number'
          ? p.estoque_ideal_sugerido
          : parseFloat(p.estoque_ideal_sugerido || 0);

        if (!ideal || ideal <= 0) return false;

        if (!search) return true;

        const codigo = (p.codigo_interno || '').toString().toLowerCase();
        const descricao = (p.descricao || '').toLowerCase();
        return codigo.includes(search) || descricao.includes(search);
      })
      .map((p) => {
        const ideal = typeof p.estoque_ideal_sugerido === 'number'
          ? p.estoque_ideal_sugerido
          : parseFloat(p.estoque_ideal_sugerido || 0);
        const estoqueAtual = typeof p.estoque === 'number'
          ? p.estoque
          : parseFloat(p.estoque || 0);

        const riscoRuptura = p.risco_ruptura || null;
        const diasEstoque = typeof p.dias_estoque === 'number'
          ? p.dias_estoque
          : parseInt(p.dias_estoque || '0', 10);

        // Nível de alerta conforme relação estoque / ideal
        let nivelAlerta = 'proximo_ideal';
        if (estoqueAtual <= 0) nivelAlerta = 'ruptura';
        else if (estoqueAtual < ideal * 0.5) nivelAlerta = 'muito_abaixo';
        else if (estoqueAtual < ideal) nivelAlerta = 'abaixo';

        const quantidadeSugerida = estoqueAtual >= ideal
          ? 0
          : Math.max(0, Math.round(ideal - estoqueAtual));

        const precoCusto = typeof p.preco_custo === 'number'
          ? p.preco_custo
          : parseFloat(p.preco_custo || 0);

        const valorTotalSugerido = precoCusto > 0
          ? parseFloat((quantidadeSugerida * precoCusto).toFixed(2))
          : 0;

        return {
          codigoInterno: p.codigo_interno,
          descricao: p.descricao,
          fornecedor: p.fornecedor || null,
          imagemBase64: p.imagem_base64 || null,
          estoqueAtual,
          estoqueIdealSugerido: ideal,
          quantidadeSugeridaCompra: quantidadeSugerida,
          precoCusto,
          categoria: p.categoria || null,
          valorTotalSugerido,
          nivelAlerta,
          riscoRuptura,
          diasEstoque
        };
      });

    const total = filtrados.length;
    const totalPages = Math.ceil(total / limit);
    const paginados = filtrados.slice(offset, offset + limit);
    
    console.log(`[Sugestão Compras] Produtos filtrados: ${total}`);
    console.log(`[Sugestão Compras] Retornando página ${page}: ${paginados.length} itens`);
    if (total > 0 && paginados.length > 0) {
      console.log(`[Sugestão Compras] Exemplo do primeiro item:`, {
        codigo: paginados[0].codigoInterno,
        estoqueAtual: paginados[0].estoqueAtual,
        estoqueIdeal: paginados[0].estoqueIdealSugerido,
        fornecedor: paginados[0].fornecedor
      });
    }

    return res.json({
      success: true,
      data: paginados,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('[SQLite] ❌ Erro em getLojaFisicaProdutosAbaixoEstoqueIdeal:', error.message);
    console.error('[SQLite] Stack:', error.stack);

    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar produtos abaixo do estoque ideal sugerido',
      error: error.message
    });
  }
};

// GET /api/produtos/loja-fisica
const getLojaFisicaProdutos = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  console.log(`[API] Buscando produtos - página ${page}, busca: "${search}"`);

  try {
    // Verificar se SQLite tem dados
    const checkStmt = cacheDb.prepare('SELECT COUNT(*) as total FROM produtos');
    const checkResult = checkStmt.get();
    
    if (!checkResult || checkResult.total === 0) {
      console.log('[SQLite] ⚠️ Cache vazio, usando MySQL...');
      return getLojaFisicaProdutosMySQL(req, res, next);
    }

    console.log(`[SQLite] Cache tem ${checkResult.total} produtos`);

    // Buscar do SQLite (SUPER RÁPIDO!)
    let produtos = [];
    let total = 0;

    if (search) {
      // Busca com LIKE
      const searchQuery = `%${search}%`;
      const countStmt = cacheDb.prepare(`
        SELECT COUNT(*) as total FROM produtos
        WHERE codigo_interno LIKE ? 
           OR codigo_barras LIKE ? 
           OR descricao LIKE ?
      `);
      total = countStmt.get(searchQuery, searchQuery, searchQuery).total;

      const stmt = cacheDb.prepare(`
        SELECT * FROM produtos
        WHERE codigo_interno LIKE ? 
           OR codigo_barras LIKE ? 
           OR descricao LIKE ?
        ORDER BY total_vendas DESC
        LIMIT ? OFFSET ?
      `);
      produtos = stmt.all(searchQuery, searchQuery, searchQuery, limit, offset);
    } else {
      // Busca sem filtro
      const countStmt = cacheDb.prepare('SELECT COUNT(*) as total FROM produtos');
      total = countStmt.get().total;

      const stmt = cacheDb.prepare(`
        SELECT * FROM produtos
        ORDER BY total_vendas DESC
        LIMIT ? OFFSET ?
      `);
      produtos = stmt.all(limit, offset);
    }

    const totalPages = Math.ceil(total / limit);

    // Formatar resposta
    const produtosFormatados = produtos.map(p => ({
      codigoInterno: p.codigo_interno,
      codigoBarras: p.codigo_barras,
      descricao: p.descricao,
      descricaoResumida: p.descricao_resumida,
      codigoFornecedor: p.codigo_fornecedor,
      estoque: p.estoque,
      precoVenda: parseFloat(p.preco_venda || 0),
      precoCusto: parseFloat(p.preco_custo || 0),
      margem: parseFloat(p.margem || 0),
      tipoPreco: p.tipo_preco || 'estoque',
      fornecedor: p.fornecedor,
      imagemBase64: p.imagem_base64,
      estoqueMinimo: p.estoque_minimo,
      mesPico: p.mes_pico,
      mediaMensal: parseFloat(p.media_mensal || 0),
      totalVendas: p.total_vendas,
      vendasMensais: p.vendas_mensais ? JSON.parse(p.vendas_mensais) : []
    }));

    console.log(`[SQLite] ✅ ${produtos.length} produtos retornados (${total} total)`);

    return res.json({
      success: true,
      data: produtosFormatados,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('[SQLite] ❌ Erro:', error.message);
    console.error('[SQLite] Stack:', error.stack);
    
    // Retornar erro amigável ao invés de tentar MySQL
    return res.status(503).json({
      success: false,
      message: 'Cache SQLite temporariamente indisponível. Execute o backup: node scripts/backupFullToSQLite.js',
      error: error.message
    });
  }
};

// Fallback: buscar do MySQL (mantém código antigo)
const getLojaFisicaProdutosMySQL = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    // Sanitizar string de busca
    const searchSanitized = sanitizeSearchString(search);

    // Query base
    let whereClause = 'WHERE 1=1';
    let queryParams = [];

    // Adicionar busca se fornecida
    if (searchSanitized) {
      whereClause += ' AND (p.CODIGO_INTERNO LIKE ? OR p.CODIGO_BARRAS LIKE ? OR p.DESCRICAO LIKE ?)';
      queryParams.push(`%${searchSanitized}%`, `%${searchSanitized}%`, `%${searchSanitized}%`);
    }

    // Query para contar total de produtos (com retry em caso de erro de conexão)
    let countResult, total, totalPages;
    try {
      const countQuery = `
        SELECT COUNT(*) as total
        FROM produtos p
        ${whereClause}
      `;
      [countResult] = await poolLojaFisica.query(countQuery, queryParams);
      total = countResult[0].total;
      totalPages = Math.ceil(total / limit);
    } catch (countError) {
      // Se falhar, tentar novamente uma vez
      console.warn('Erro ao contar produtos, tentando novamente:', countError.message);
      const countQuery = `
        SELECT COUNT(*) as total
        FROM produtos p
        ${whereClause}
      `;
      [countResult] = await poolLojaFisica.query(countQuery, queryParams);
      total = countResult[0].total;
      totalPages = Math.ceil(total / limit);
    }

    // Query com imagens e ordenação por vendas (mais vendidos primeiro)
    let rows;
    try {
      // Tentar query com imagens e ordenação por vendas (com timeout)
      const queryComImagens = `
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
          v.img as imagemBase64,
          COALESCE(SUM(cv.QUANTIDADE), 0) as totalVendas
        FROM produtos p
        LEFT JOIN estoque e ON p.CODIGO_INTERNO = e.CODIGO_INTERNO AND e.COD_LOCAL = '001'
        LEFT JOIN fornecedores f ON p.CODIGO_FORNECEDOR = f.CODIGO_FORNECEDOR
        LEFT JOIN vw_dprodutos v ON LPAD(p.CODIGO_INTERNO, 13, '0') = v.CODIGO_INTERNO
        LEFT JOIN caixas_venda cv ON p.CODIGO_INTERNO = cv.CODIGO_PRODUTO 
          AND cv.DATA >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        ${whereClause}
        GROUP BY p.CODIGO_INTERNO, p.CODIGO_BARRAS, p.DESCRICAO, p.DESCRICAO_RESUMIDA, 
                 p.CODIGO_FORNECEDOR, e.SALDO_ATUAL, v.VALOR_REVENDA, v.VALOR_ATACADO, v.VALOR_VAREJO, v.CUSTO, f.NOME, v.img
        ORDER BY totalVendas DESC, p.DESCRICAO ASC
        LIMIT ? OFFSET ?
      `;

      const queryPromise = poolLojaFisica.query(queryComImagens, [...queryParams, limit, offset]);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 12000)
      );

      [rows] = await Promise.race([queryPromise, timeoutPromise]);
    } catch (error) {
      // Se der timeout ou erro, usar query simplificada (sem imagens, mas com ordenação por vendas)
      console.warn('Query com imagens falhou, usando query simplificada:', error.message);
      try {
        const querySimplificada = `
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
            NULL as imagemBase64,
            COALESCE(SUM(cv.QUANTIDADE), 0) as totalVendas
          FROM produtos p
          LEFT JOIN estoque e ON p.CODIGO_INTERNO = e.CODIGO_INTERNO AND e.COD_LOCAL = '001'
          LEFT JOIN fornecedores f ON p.CODIGO_FORNECEDOR = f.CODIGO_FORNECEDOR
          LEFT JOIN vw_dprodutos v ON LPAD(p.CODIGO_INTERNO, 13, '0') = v.CODIGO_INTERNO
          LEFT JOIN caixas_venda cv ON p.CODIGO_INTERNO = cv.CODIGO_PRODUTO 
            AND cv.DATA >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
          ${whereClause}
          GROUP BY p.CODIGO_INTERNO, p.CODIGO_BARRAS, p.DESCRICAO, p.DESCRICAO_RESUMIDA, 
                   p.CODIGO_FORNECEDOR, e.SALDO_ATUAL, v.VALOR_REVENDA, v.VALOR_ATACADO, v.VALOR_VAREJO, v.CUSTO, f.NOME
          ORDER BY totalVendas DESC, p.DESCRICAO ASC
          LIMIT ? OFFSET ?
        `;
        [rows] = await poolLojaFisica.query(querySimplificada, [...queryParams, limit, offset]);
      } catch (error2) {
        // Se ainda falhar, usar query básica sem ordenação por vendas
        console.warn('Query simplificada falhou, usando query básica:', error2.message);
        const queryBasica = `
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
            NULL as imagemBase64
          FROM produtos p
          LEFT JOIN estoque e ON p.CODIGO_INTERNO = e.CODIGO_INTERNO AND e.COD_LOCAL = '001'
          LEFT JOIN fornecedores f ON p.CODIGO_FORNECEDOR = f.CODIGO_FORNECEDOR
          LEFT JOIN vw_dprodutos v ON LPAD(p.CODIGO_INTERNO, 13, '0') = v.CODIGO_INTERNO
          ${whereClause}
          ORDER BY p.DESCRICAO ASC
          LIMIT ? OFFSET ?
        `;
        [rows] = await poolLojaFisica.query(queryBasica, [...queryParams, limit, offset]);
      }
    }

    // Buscar análise de vendas do cache SQLite (SUPER RÁPIDO!)
    const codigosProdutos = rows.map(p => p.codigoInterno);
    let analiseVendas = {};
    
    try {
      if (codigosProdutos.length > 0) {
        const placeholders = codigosProdutos.map(() => '?').join(',');
        const stmt = cacheDb.prepare(`
          SELECT 
            codigo_produto as codigoProduto,
            estoque_minimo as estoqueMinimo,
            mes_pico as mesPico,
            media_mensal as mediaMensal,
            total_vendas as totalVendas,
            imagem_base64 as imagemBase64
          FROM analise_vendas_cache
          WHERE codigo_produto IN (${placeholders})
        `);
        
        const cacheRows = stmt.all(...codigosProdutos);
        
        // Converter array para objeto indexado por código
        cacheRows.forEach(row => {
          analiseVendas[row.codigoProduto] = {
            estoqueMinimo: row.estoqueMinimo || 0,
            mesPico: row.mesPico || null,
            mediaMensal: row.mediaMensal || 0,
            totalVendas: row.totalVendas || 0,
            imagemBase64: row.imagemBase64 || null
          };
        });
        
        console.log(`Análise de vendas do cache SQLite: ${Object.keys(analiseVendas).length} produtos encontrados de ${codigosProdutos.length} produtos buscados`);
      }
    } catch (cacheError) {
      console.error('Erro ao buscar do cache SQLite, tentando backup:', cacheError.message);
      // Fallback: buscar do Redis/arquivo
      analiseVendas = await backupService.getAnaliseVendasFromBackup(codigosProdutos);
    }

    // Processar produtos com imagens e análise de vendas do backup
    const produtosComAnalise = rows.map((produto) => {
      // Buscar análise de vendas do backup (já calculada)
      const analise = analiseVendas[produto.codigoInterno] || {
        estoqueMinimo: 0,
        mesPico: null,
        mediaMensal: 0,
        totalVendas: 0,
        imagemBase64: null
      };

      // Processar imagem (priorizar imagem da query, senão usar do backup)
      let imagemBase64 = null;
      const imagemOriginal = produto.imagemBase64 || analise.imagemBase64;
      
      if (imagemOriginal) {
        if (imagemOriginal.startsWith('data:')) {
          imagemBase64 = imagemOriginal;
        } else if (imagemOriginal.startsWith('http://') || imagemOriginal.startsWith('https://')) {
          // Se for URL, manter como está
          imagemBase64 = imagemOriginal;
        } else {
          // Se for base64 puro, adicionar prefixo
          imagemBase64 = `data:image/jpeg;base64,${imagemOriginal}`;
        }
      }

      return {
        ...produto,
        estoqueMinimo: analise.estoqueMinimo,
        mesPico: analise.mesPico,
        mediaMensal: analise.mediaMensal,
        totalVendas: analise.totalVendas || 0,
        imagemBase64: imagemBase64
      };
    });

    // Ordenar por total de vendas (mais vendidos primeiro)
    produtosComAnalise.sort((a, b) => b.totalVendas - a.totalVendas);

    res.json({
      success: true,
      data: produtosComAnalise,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Erro em getLojaFisicaProdutos:', error);
    console.error('Stack:', error.stack);
    
    // Se for erro de conexão, retornar erro mais amigável
    if (error.code === 'PROTOCOL_CONNECTION_LOST' || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({
        success: false,
        message: 'Erro de conexão com o banco de dados. Tente novamente.'
      });
    }

    // Se for timeout, retornar erro específico
    if (error.message && error.message.includes('timeout')) {
      return res.status(504).json({
        success: false,
        message: 'A consulta demorou muito para responder. Tente novamente.'
      });
    }
    
    next(error);
  }
};

// Fallback: buscar do MySQL (mantém código antigo)
const getLojaFisicaProdutoByCodigoMySQL = async (req, res, next) => {
  try {
    const { codigo } = req.params;

    const query = `
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
      WHERE p.CODIGO_INTERNO = ?
    `;

    const [rows] = await poolLojaFisica.query(query, [codigo]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }

    const produto = {
      ...rows[0],
      estoqueMinimo: 0,
      mesPico: null,
      mediaMensal: 0,
      imagemBase64: rows[0].imagemBase64
        ? (rows[0].imagemBase64.startsWith('data:')
            ? rows[0].imagemBase64
            : `data:image/jpeg;base64,${rows[0].imagemBase64}`)
        : null
    };

    res.json({
      success: true,
      data: produto
    });
  } catch (error) {
    next(error);
  }
};

const getLojaFisicaProdutosPicosQueda = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = (page - 1) * limit;
    const thresholdPercent = parseFloat(req.query.thresholdPercent) || 30;
    const minPeakQuantity = parseInt(req.query.minPeakQuantity, 10) || 30;
    const thresholdRatio = thresholdPercent / 100;
    const search = (req.query.search || '').toString().trim().toLowerCase();

    const stmt = cacheDb.prepare('SELECT * FROM produtos');
    const produtos = stmt.all();
    const resultados = [];
    const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    for (const produto of produtos) {
      if (!produto.historico_12_meses) {
        continue;
      }

      let historico;
      try {
        historico = JSON.parse(produto.historico_12_meses);
      } catch (e) {
        continue;
      }

      if (!Array.isArray(historico) || historico.length < 3) {
        continue;
      }

      const historicoOrdenado = [...historico].sort((a, b) => {
        if (a.ano === b.ano) {
          return a.mes - b.mes;
        }
        return a.ano - b.ano;
      });

      // Encontrar o pico de vendas (ignorar últimos 2 meses para ter dados de queda)
      let peakIndex = -1;
      let peakQuantidade = 0;
      const maxIndexParaPico = historicoOrdenado.length - 2; // Precisa ter pelo menos 1 mês após o pico

      for (let i = 0; i < maxIndexParaPico; i++) {
        const quantidade = parseFloat(historicoOrdenado[i].quantidade || 0);
        if (quantidade > peakQuantidade) {
          peakQuantidade = quantidade;
          peakIndex = i;
        }
      }

      // Validações básicas
      if (peakIndex === -1 || peakQuantidade < minPeakQuantity) {
        continue;
      }

      // Não considerar picos muito recentes (últimos 2 meses) - pode ser flutuação temporária
      if (peakIndex >= historicoOrdenado.length - 2) {
        continue;
      }

      // Analisar meses ANTES do pico (para detectar se foi realmente um pico ou tendência crescente)
      const before1 = peakIndex > 0 ? historicoOrdenado[peakIndex - 1] : null;
      const before2 = peakIndex > 1 ? historicoOrdenado[peakIndex - 2] : null;
      const qBefore1 = before1 ? parseFloat(before1.quantidade || 0) : 0;
      const qBefore2 = before2 ? parseFloat(before2.quantidade || 0) : 0;

      // Calcular média dos 2 meses anteriores ao pico
      const mediaAntesPico = before1 && before2 
        ? (qBefore1 + qBefore2) / 2 
        : (before1 ? qBefore1 : peakQuantidade * 0.5);

      // O pico deve ser significativamente maior que a média anterior (pelo menos 50% maior)
      const aumentoEmRelacaoAnterior = ((peakQuantidade - mediaAntesPico) / mediaAntesPico) * 100;
      if (aumentoEmRelacaoAnterior < 50) {
        continue; // Não é um pico real, apenas variação normal
      }

      // Analisar meses DEPOIS do pico
      const after1 = historicoOrdenado[peakIndex + 1];
      const after2 = historicoOrdenado[peakIndex + 2];
      const after3 = historicoOrdenado[peakIndex + 3];

      if (!after1) {
        continue; // Precisa ter pelo menos 1 mês após o pico
      }

      const q1 = parseFloat(after1.quantidade || 0);
      const q2 = after2 ? parseFloat(after2.quantidade || 0) : 0;
      const q3 = after3 ? parseFloat(after3.quantidade || 0) : 0;
      
      const limite = peakQuantidade * thresholdRatio;

      // Verificar se houve queda forte e SUSTENTADA
      const quedaForteMes1 = q1 <= limite;
      const quedaForteMes2 = after2 ? q2 <= limite : false;
      const quedaForteMes3 = after3 ? q3 <= limite : false;

      // Precisa ter queda forte em pelo menos 2 dos 3 meses seguintes
      const mesesComQuedaForte = [quedaForteMes1, quedaForteMes2, quedaForteMes3].filter(Boolean).length;
      
      if (mesesComQuedaForte < 2) {
        continue; // Não é uma queda sustentada, pode ser flutuação
      }

      // Calcular percentual médio de queda
      const vendasPosPico = [q1, q2, q3].filter(q => q > 0);
      const mediaPosPico = vendasPosPico.length > 0 
        ? vendasPosPico.reduce((a, b) => a + b, 0) / vendasPosPico.length 
        : 0;
      const percentualQueda = ((peakQuantidade - mediaPosPico) / peakQuantidade) * 100;

      // Análise de custos e preços
      const precoVendaAtual = parseFloat(produto.preco_venda || 0);
      const custoPicoMes = parseFloat(historicoOrdenado[peakIndex].custoMedio || 0);
      const custoAtual = parseFloat(produto.preco_custo || 0);
      
      // IMPORTANTE: precoMedio no histórico é a MÉDIA das vendas (inclui promoções)
      // Não é confiável para comparar com preço de tabela atual
      // Vamos usar apenas o CUSTO, que é mais estável e confiável
      
      let variacaoCustoPercent = 0;

      // Variação no CUSTO de compra (mais confiável que preço de venda)
      if (custoPicoMes > 0 && custoAtual > 0) {
        variacaoCustoPercent = ((custoAtual - custoPicoMes) / custoPicoMes) * 100;
      }

      // Análise de motivos da queda
      let motivoPrincipal = 'indefinido';
      const motivos = [];
      let pontuacaoEstoque = 0;
      let pontuacaoPreco = 0;

      const estoqueAtual = typeof produto.estoque === 'number'
        ? produto.estoque
        : parseFloat(produto.estoque || 0);

      const riscoRuptura = produto.risco_ruptura || null;
      const diasEstoque = typeof produto.dias_estoque === 'number'
        ? produto.dias_estoque
        : parseInt(produto.dias_estoque || '0', 10);

      // 1. ANÁLISE DE ESTOQUE (prioridade alta)
      if (estoqueAtual <= 0) {
        pontuacaoEstoque += 100;
        motivos.push('Produto em RUPTURA DE ESTOQUE (estoque zerado).');
      } else if (riscoRuptura === 'critico') {
        pontuacaoEstoque += 80;
        motivos.push('Risco CRÍTICO de ruptura de estoque.');
      } else if (riscoRuptura === 'alto') {
        pontuacaoEstoque += 60;
        motivos.push('Risco ALTO de ruptura de estoque.');
      } else if (diasEstoque > 0 && diasEstoque < 30) {
        pontuacaoEstoque += 40;
        motivos.push(`Estoque baixo: apenas ${diasEstoque} dias de cobertura.`);
      }

      // Verificar se houve ruptura DURANTE o período de queda
      let houveRupturaNoPeriodo = false;
      for (let i = peakIndex + 1; i < Math.min(peakIndex + 4, historicoOrdenado.length); i++) {
        const mes = historicoOrdenado[i];
        if (mes.quantidade === 0 || mes.quantidade < peakQuantidade * 0.1) {
          houveRupturaNoPeriodo = true;
          break;
        }
      }

      if (houveRupturaNoPeriodo) {
        pontuacaoEstoque += 50;
        motivos.push('Houve ruptura ou estoque muito baixo durante o período de queda.');
      }

      // 2. ANÁLISE DE CUSTO
      // Analisamos apenas o CUSTO (quanto você paga ao fornecedor)
      // O preço de venda não é confiável no histórico pois inclui promoções
      
      // Aumento SIGNIFICATIVO no custo de compra
      if (variacaoCustoPercent > 30) {
        pontuacaoPreco += 80;
        motivos.push(`💰 CUSTO DE COMPRA aumentou ${variacaoCustoPercent.toFixed(1)}% (R$ ${custoPicoMes.toFixed(2)} → R$ ${custoAtual.toFixed(2)}). Fornecedor aumentou muito o preço!`);
      } else if (variacaoCustoPercent > 20) {
        pontuacaoPreco += 60;
        motivos.push(`💰 CUSTO DE COMPRA aumentou ${variacaoCustoPercent.toFixed(1)}% (R$ ${custoPicoMes.toFixed(2)} → R$ ${custoAtual.toFixed(2)}). Fornecedor aumentou o preço.`);
      } else if (variacaoCustoPercent > 10) {
        pontuacaoPreco += 30;
        motivos.push(`💰 CUSTO DE COMPRA aumentou ${variacaoCustoPercent.toFixed(1)}% (R$ ${custoPicoMes.toFixed(2)} → R$ ${custoAtual.toFixed(2)}).`);
      } else if (variacaoCustoPercent < -15) {
        // Custo diminuiu significativamente
        motivos.push(`💰 CUSTO DE COMPRA diminuiu ${Math.abs(variacaoCustoPercent).toFixed(1)}% (R$ ${custoPicoMes.toFixed(2)} → R$ ${custoAtual.toFixed(2)}). Fornecedor baixou o preço.`);
      }
      
      // Verificar se há grande diferença entre custo e preço de venda atual
      if (custoAtual > 0 && precoVendaAtual > 0) {
        const margemAtual = ((precoVendaAtual - custoAtual) / precoVendaAtual) * 100;
        
        if (margemAtual < 20) {
          pontuacaoPreco += 40;
          motivos.push(`⚠️ Margem de lucro muito baixa (${margemAtual.toFixed(1)}%). Preço de venda pode estar pouco atrativo.`);
        } else if (margemAtual > 80) {
          pontuacaoPreco += 50;
          motivos.push(`💸 Margem de lucro muito alta (${margemAtual.toFixed(1)}%). Preço de venda pode estar afastando clientes.`);
        }
      }

      // 3. ANÁLISE DE SAZONALIDADE
      const mesPicoNumero = historicoOrdenado[peakIndex].mes;
      const mesesSazonais = [5, 6, 10, 11, 12]; // Maio (Dia das Mães), Junho (Dia dos Namorados), Out/Nov/Dez (Natal)
      
      if (mesesSazonais.includes(mesPicoNumero)) {
        motivos.push(`Pico ocorreu em ${mesesNomes[mesPicoNumero - 1]}, mês com datas comemorativas. Queda pode ser sazonal.`);
      }

      // 4. DETERMINAR MOTIVO PRINCIPAL
      if (pontuacaoEstoque >= 60) {
        motivoPrincipal = 'possivel_falta_estoque';
      } else if (pontuacaoPreco >= 50) {
        motivoPrincipal = 'possivel_variacao_preco';
      } else if (pontuacaoEstoque > 0 || pontuacaoPreco > 0) {
        motivoPrincipal = 'multiplos_fatores';
      }

      // Se não encontrou motivo claro, adicionar observação
      if (motivos.length === 0) {
        motivos.push('Queda significativa sem causa aparente. Recomenda-se investigação detalhada.');
      }

      const mesPicoItem = historicoOrdenado[peakIndex];

      resultados.push({
        codigoInterno: produto.codigo_interno,
        descricao: produto.descricao,
        imagemBase64: produto.imagem_base64 || null,
        estoqueAtual,
        precoAtual: precoVendaAtual,
        mesPico: {
          mesNumero: mesPicoItem.mes,
          mesNome: mesesNomes[mesPicoItem.mes - 1] || null,
          ano: mesPicoItem.ano,
          quantidade: parseFloat(peakQuantidade.toFixed(2))
        },
        mesesPosteriores: [
          after1 ? {
            mesNumero: after1.mes,
            mesNome: mesesNomes[after1.mes - 1] || null,
            ano: after1.ano,
            quantidade: q1,
            percentualEmRelacaoAoPico: peakQuantidade > 0
              ? parseFloat(((q1 / peakQuantidade) * 100).toFixed(1))
              : 0
          } : null,
          after2 ? {
            mesNumero: after2.mes,
            mesNome: mesesNomes[after2.mes - 1] || null,
            ano: after2.ano,
            quantidade: q2,
            percentualEmRelacaoAoPico: peakQuantidade > 0
              ? parseFloat(((q2 / peakQuantidade) * 100).toFixed(1))
              : 0
          } : null,
          after3 ? {
            mesNumero: after3.mes,
            mesNome: mesesNomes[after3.mes - 1] || null,
            ano: after3.ano,
            quantidade: q3,
            percentualEmRelacaoAoPico: peakQuantidade > 0
              ? parseFloat(((q3 / peakQuantidade) * 100).toFixed(1))
              : 0
          } : null
        ].filter(Boolean),
        motivoPrincipal,
        motivos,
        analiseDetalhada: {
          percentualQueda: parseFloat(percentualQueda.toFixed(1)),
          aumentoAntesPico: parseFloat(aumentoEmRelacaoAnterior.toFixed(1)),
          variacaoCusto: parseFloat(variacaoCustoPercent.toFixed(1)),
          margemAtual: custoAtual > 0 && precoVendaAtual > 0 
            ? parseFloat((((precoVendaAtual - custoAtual) / precoVendaAtual) * 100).toFixed(1))
            : 0,
          pontuacaoEstoque,
          pontuacaoPreco
        },
        parametros: {
          thresholdPercent,
          minPeakQuantity,
          limitePercentualPosPico: thresholdPercent
        },
        riscoRuptura: riscoRuptura || null,
        diasEstoque
      });
    }

    let filtrados = resultados;

    if (search) {
      filtrados = resultados.filter((item) => {
        const codigo = (item.codigoInterno || '').toString().toLowerCase();
        const descricao = (item.descricao || '').toLowerCase();
        return codigo.includes(search) || descricao.includes(search);
      });
    }

    const total = filtrados.length;
    const totalPages = Math.ceil(total / limit);
    const paginados = filtrados.slice(offset, offset + limit);

    return res.json({
      success: true,
      data: paginados,
      pagination: {
        page,
        limit,
        total,
        totalPages
      },
      criteria: {
        thresholdPercent,
        minPeakQuantity
      }
    });
  } catch (error) {
    console.error('[SQLite] ❌ Erro em getLojaFisicaProdutosPicosQueda:', error.message);
    console.error('[SQLite] Stack:', error.stack);

    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar produtos com pico de vendas seguido de queda',
      error: error.message
    });
  }
};

const getLojaFisicaProdutoByCodigo = async (req, res, next) => {
  const { codigo } = req.params;

  console.log(`[API] 🚀 Buscando produto ${codigo} do cache SQLite...`);

  try {
    const stmt = cacheDb.prepare('SELECT * FROM produtos WHERE codigo_interno = ?');
    const produto = stmt.get(codigo);

    if (!produto) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }

    const produtoDetalhado = {
      codigoInterno: produto.codigo_interno,
      codigoBarras: produto.codigo_barras,
      descricao: produto.descricao,
      descricaoResumida: produto.descricao_resumida,
      codigoFornecedor: produto.codigo_fornecedor,
      estoque: produto.estoque,
      precoVenda: parseFloat(produto.preco_venda || 0),
      precoCusto: parseFloat(produto.preco_custo || 0),
      margem: parseFloat(produto.margem || 0),
      tipoPreco: produto.tipo_preco || 'estoque',
      fornecedor: produto.fornecedor,
      imagemBase64: produto.imagem_base64,
      estoqueMinimo: produto.estoque_minimo,
      mesPico: produto.mes_pico,
      mediaMensal: parseFloat(produto.media_mensal || 0),
      totalVendas: produto.total_vendas,
      historicoVendas: produto.historico_12_meses
        ? JSON.parse(produto.historico_12_meses)
        : [],
      analisePreditiva: produto.analise_preditiva
        ? JSON.parse(produto.analise_preditiva)
        : { status: 'sem_dados', mensagem: 'Execute o backup para gerar análise', recomendacoes: [] },
      estoqueIdealSugerido: produto.estoque_ideal_sugerido || 0
    };

    console.log(`[SQLite] ✅ Produto encontrado do cache (super rápido!)`);

    return res.json({
      success: true,
      data: produtoDetalhado,
      cached: true
    });
  } catch (error) {
    console.error('[Erro] ❌:', error.message);
    console.error('[Stack]:', error.stack);

    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar detalhes do produto',
      error: error.message
    });
  }
};

module.exports = {
  getLojaFisicaProdutos,
  getLojaFisicaProdutoByCodigo,
  getLojaFisicaProdutosPicosQueda,
  getLojaFisicaProdutosAbaixoEstoqueIdeal
};
