/**
 * Controller para endpoints de filtros (fornecedores e categorias)
 */

const cacheDb = require('../config/cacheDatabase');
const mysqlPool = require('../config/database');

/**
 * Buscar lista de fornecedores únicos
 */
const getFornecedores = async (req, res) => {
  try {
    console.log('[Filtros] 📋 Buscando fornecedores...');

    // Buscar do SQLite
    const stmt = cacheDb.prepare(`
      SELECT DISTINCT fornecedor
      FROM produtos
      WHERE fornecedor IS NOT NULL AND fornecedor != ''
      ORDER BY fornecedor ASC
    `);
    const fornecedores = stmt.all();

    console.log(`[SQLite] ✅ ${fornecedores.length} fornecedores encontrados`);
    
    return res.json({
      success: true,
      data: fornecedores.map(f => f.fornecedor),
      source: 'cache'
    });

  } catch (error) {
    console.error('[Filtros] ❌ Erro ao buscar fornecedores:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar fornecedores',
      error: error.message
    });
  }
};

/**
 * Buscar lista de categorias únicas
 */
const getCategorias = async (req, res) => {
  try {
    console.log('[Filtros] 📋 Buscando categorias...');

    // Lista fixa de categorias disponíveis (ordem alfabética)
    const categoriasDisponiveis = [
      'Anel',
      'Argola',
      'Brinco',
      'Colar',
      'Conjunto',
      'Escapulário',
      'Gargantilha',
      'Piercing',
      'Pingente',
      'Pulseira',
      'Terço',
      'Tornozeleira',
      'Outro'
    ];

    console.log(`[Categorias] ✅ ${categoriasDisponiveis.length} categorias disponíveis`);
    
    return res.json({
      success: true,
      data: categoriasDisponiveis,
      source: 'fixed'
    });

  } catch (error) {
    console.error('[Filtros] ❌ Erro ao buscar categorias:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar categorias',
      error: error.message
    });
  }
};

module.exports = {
  getFornecedores,
  getCategorias
};
