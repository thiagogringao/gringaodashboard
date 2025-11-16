const { poolEcommerce } = require('../config/database');
const { calcularMargem, sanitizeSearchString } = require('../utils/helpers');
const cacheDb = require('../config/cacheEcommerceDatabase');

// GET /api/produtos/ecommerce - COM CACHE SQLITE E ORDENAÇÃO POR VENDAS
const getEcommerceProdutos = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  console.log(`[API E-commerce] 📦 Buscando produtos (página ${page})...`);

  try {
    // Sanitizar busca
    const searchSanitized = sanitizeSearchString(search);

    // Buscar do SQLite (SUPER RÁPIDO!)
    let whereClause = '';
    let params = [];

    if (searchSanitized) {
      whereClause = 'WHERE codigo LIKE ? OR nome LIKE ?';
      params.push(`%${searchSanitized}%`, `%${searchSanitized}%`);
    }

    // Contar total
    const countStmt = cacheDb.prepare(`SELECT COUNT(*) as total FROM produtos ${whereClause}`);
    const countResult = params.length > 0 ? countStmt.get(...params) : countStmt.get();
    const total = countResult.total;
    const totalPages = Math.ceil(total / limit);

    // Buscar produtos ORDENADOS POR VENDAS (igual loja física)
    const stmt = cacheDb.prepare(`
      SELECT * FROM produtos 
      ${whereClause}
      ORDER BY total_vendas DESC, nome ASC
      LIMIT ? OFFSET ?
    `);

    const produtos = params.length > 0 
      ? stmt.all(...params, limit, offset)
      : stmt.all(limit, offset);

    // Formatar resposta
    const produtosFormatados = produtos.map(p => {
      const preco = parseFloat(p.preco) || 0;
      const precoCusto = parseFloat(p.preco_custo) || 0;

      console.log(`[LUCRO DEBUG] Produto: ${p.codigo}, Preco Bruto: '${p.preco}', Preco Custo Bruto: '${p.preco_custo}'`); // LOG DE DEPURAÇÃO


      return {
        id: p.codigo,
        codigo: p.codigo,
        nome: p.nome,
        preco: preco,
        precoCusto: precoCusto,
        estoque: p.estoque,
        imagemURL: p.imagem_url,
        situacao: p.situacao,
        categoria: p.categoria || null,
        margem: calcularMargem(preco, precoCusto),
        lucro: preco - precoCusto,
        
        // Análise de vendas (igual loja física)
        estoqueMinimo: p.estoque_minimo,
        mesPico: p.mes_pico,
        mediaMensal: parseFloat(p.media_mensal || 0),
        totalVendas: p.total_vendas,
        vendasMensais: p.vendas_mensais ? JSON.parse(p.vendas_mensais) : []
      };
    });

    console.log(`[SQLite E-commerce] ✅ ${produtosFormatados.length} produtos encontrados`);

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
    console.error('[SQLite E-commerce] ❌ Erro:', error.message);
    console.error('[SQLite E-commerce] Stack:', error.stack);
    
    return res.status(503).json({
      success: false,
      message: 'Cache SQLite temporariamente indisponível. Execute o backup: node scripts/backupEcommerceToSQLite.js',
      error: error.message
    });
  }
};

// GET /api/produtos/ecommerce/:codigo - COM CACHE E ANÁLISE PREDITIVA
const getEcommerceProdutoByCodigo = async (req, res, next) => {
  const { codigo } = req.params;

  console.log(`[API E-commerce] 🚀 Buscando produto ${codigo} do cache SQLite...`);

  try {
    // Buscar TUDO do SQLite (análise já pré-calculada!)
    const stmt = cacheDb.prepare('SELECT * FROM produtos WHERE codigo = ?');
    const produto = stmt.get(codigo);

    if (!produto) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }

    const preco = parseFloat(produto.preco) || 0;
    const precoCusto = parseFloat(produto.preco_custo) || 0;

    // Formatar resposta com dados do cache
    const produtoDetalhado = {
      // Dados básicos
      id: produto.codigo,
      codigo: produto.codigo,
      nome: produto.nome,
      preco: preco,
      precoCusto: precoCusto,
      estoque: produto.estoque,
      tipo: produto.tipo,
      situacao: produto.situacao,
      formato: produto.formato,
      imagemURL: produto.imagem_url,
      margem: calcularMargem(preco, precoCusto),
      
      // Análise de vendas
      estoqueMinimo: produto.estoque_minimo,
      mesPico: produto.mes_pico,
      mediaMensal: parseFloat(produto.media_mensal || 0),
      totalVendas: produto.total_vendas,
      
      // Histórico detalhado (12 meses) - do cache
      historicoVendas: produto.historico_12_meses 
        ? JSON.parse(produto.historico_12_meses)
        : [],
      
      // Análise preditiva - do cache
      analisePreditiva: produto.analise_preditiva 
        ? JSON.parse(produto.analise_preditiva)
        : { status: 'sem_dados', mensagem: 'Execute o backup para gerar análise', recomendacoes: [] }
    };

    console.log(`[SQLite E-commerce] ✅ Produto encontrado do cache (super rápido!)`);

    return res.json({
      success: true,
      data: produtoDetalhado,
      cached: true
    });
  } catch (error) {
    console.error('[Erro E-commerce] ❌:', error.message);
    console.error('[Stack]:', error.stack);
    
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar detalhes do produto',
      error: error.message
    });
  }
};

/**
 * Buscar métricas gerais do e-commerce
 */
const getEcommerceMetrics = async (req, res) => {
  try {
    console.log('[E-commerce] 📊 Buscando métricas...');

    // Buscar todos os produtos para calcular métricas
    const stmt = cacheDb.prepare(`
      SELECT 
        codigo,
        preco,
        preco_custo,
        estoque,
        total_vendas
      FROM produtos
    `);
    const produtos = stmt.all();

    // 1. Capital Investido (Estoque × Preço Custo)
    const capitalInvestido = produtos.reduce((sum, p) => {
      return sum + (p.estoque * parseFloat(p.preco_custo || 0));
    }, 0);

    // 2. Produtos com Margem Negativa
    const produtosMargemNegativa = produtos.filter(p => {
      const preco = parseFloat(p.preco || 0);
      const precoCusto = parseFloat(p.preco_custo || 0);
      return preco < precoCusto && preco > 0;
    });

    const prejuizoPotencial = produtosMargemNegativa.reduce((sum, p) => {
      const lucro = (parseFloat(p.preco) - parseFloat(p.preco_custo)) * p.estoque;
      return sum + Math.abs(lucro);
    }, 0);

    // 3. Produtos Parados (sem vendas)
    const produtosParados = produtos.filter(p => {
      const totalVendas = p.total_vendas || 0;
      return totalVendas === 0;
    });

    const valorParado = produtosParados.reduce((sum, p) => {
      return sum + (p.estoque * parseFloat(p.preco_custo || 0));
    }, 0);

    // 4. Top 20 Mais Lucrativos
    const produtosComLucro = produtos
      .map(p => ({
        ...p,
        lucroTotal: (parseFloat(p.preco || 0) - parseFloat(p.preco_custo || 0)) * p.estoque
      }))
      .sort((a, b) => b.lucroTotal - a.lucroTotal);

    const top20 = produtosComLucro.slice(0, 20);
    const lucroTop20 = top20.reduce((sum, p) => sum + p.lucroTotal, 0);
    const lucroTotal = produtosComLucro.reduce((sum, p) => sum + Math.max(0, p.lucroTotal), 0);
    const percentualTop20 = lucroTotal > 0 ? ((lucroTop20 / lucroTotal) * 100).toFixed(1) : 0;

    const metrics = {
      capitalInvestido: Math.round(capitalInvestido),
      totalProdutos: produtos.length,
      produtosMargemNegativa: produtosMargemNegativa.length,
      prejuizoPotencial: Math.round(prejuizoPotencial),
      produtosParados: produtosParados.length,
      valorParado: Math.round(valorParado),
      percentualTop20: parseFloat(percentualTop20)
    };

    console.log(`[Métricas E-commerce] ✅ Calculadas:`, metrics);

    return res.json({
      success: true,
      data: metrics
    });

  } catch (error) {
    console.error('[E-commerce] ❌ Erro ao buscar métricas:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar métricas',
      error: error.message
    });
  }
};

/**
 * Buscar detalhes das métricas (produtos específicos)
 */
const getEcommerceMetricsDetails = async (req, res) => {
  try {
    const { type } = req.params;
    console.log(`[E-commerce] 📋 Buscando detalhes: ${type}`);

    // Buscar todos os produtos
    const stmt = cacheDb.prepare(`
      SELECT 
        codigo,
        nome as descricao,
        preco as precoVenda,
        preco_custo as precoCusto,
        estoque,
        total_vendas
      FROM produtos
    `);
    const produtos = stmt.all();

    let result = [];

    switch (type) {
      case 'margem-negativa':
        result = produtos
          .filter(p => {
            const preco = parseFloat(p.precoVenda || 0);
            const precoCusto = parseFloat(p.precoCusto || 0);
            return preco < precoCusto && preco > 0;
          })
          .map(p => ({
            ...p,
            prejuizo: Math.abs((parseFloat(p.precoVenda) - parseFloat(p.precoCusto)) * p.estoque)
          }))
          .sort((a, b) => b.prejuizo - a.prejuizo);
        break;

      case 'produtos-parados':
        result = produtos
          .filter(p => (p.total_vendas || 0) === 0)
          .map(p => ({
            ...p,
            valorParado: p.estoque * parseFloat(p.precoCusto || 0)
          }))
          .sort((a, b) => b.valorParado - a.valorParado)
          .slice(0, 100); // Limitar a 100 produtos
        break;

      case 'top-lucrativos':
        result = produtos
          .map(p => ({
            ...p,
            lucroTotal: (parseFloat(p.precoVenda || 0) - parseFloat(p.precoCusto || 0)) * p.estoque
          }))
          .filter(p => p.lucroTotal > 0)
          .sort((a, b) => b.lucroTotal - a.lucroTotal)
          .slice(0, 20);
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Tipo de métrica inválido'
        });
    }

    console.log(`[Métricas Detalhes E-commerce] ✅ ${result.length} produtos retornados`);

    return res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('[E-commerce] ❌ Erro ao buscar detalhes das métricas:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar detalhes das métricas',
      error: error.message
    });
  }
};

/**
 * Buscar imagem do produto
 */
const getEcommerceProdutoImagem = async (req, res) => {
  try {
    const { codigo } = req.params;
    
    // Buscar produto do cache
    const stmt = cacheDb.prepare('SELECT imagem_url FROM produtos WHERE codigo = ?');
    const produto = stmt.get(codigo);

    if (!produto || !produto.imagem_url) {
      // Retornar erro 404
      return res.status(404).json({
        success: false,
        message: 'Imagem não encontrada'
      });
    }

    // Retornar a URL da imagem como JSON
    return res.json({
      success: true,
      url: produto.imagem_url
    });

  } catch (error) {
    console.error('[E-commerce] ❌ Erro ao buscar imagem:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar imagem',
      error: error.message
    });
  }
};

module.exports = {
  getEcommerceProdutos,
  getEcommerceProdutoByCodigo,
  getEcommerceMetrics,
  getEcommerceMetricsDetails,
  getEcommerceProdutoImagem
};
