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

      return {
        id: p.codigo,
        codigo: p.codigo,
        nome: p.nome,
        preco: preco,
        precoCusto: precoCusto,
        estoque: p.estoque,
        imagemURL: p.imagem_url,
        situacao: p.situacao,
        margem: calcularMargem(preco, precoCusto),
        
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

module.exports = {
  getEcommerceProdutos,
  getEcommerceProdutoByCodigo
};
