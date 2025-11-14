const cacheDb = require('../config/cacheDatabase');

// Testar inserção
const stmt = cacheDb.prepare(`
  INSERT OR REPLACE INTO analise_vendas_cache 
    (codigo_produto, estoque_minimo, mes_pico, media_mensal, total_vendas, imagem_base64, data_atualizacao)
  VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
`);

stmt.run('020934', 11535, 'Dez', 7689.92, 99969, null);
console.log('✅ Produto inserido!');

// Buscar produto
const row = cacheDb.prepare('SELECT * FROM analise_vendas_cache WHERE codigo_produto = ?').get('020934');
console.log('Produto encontrado:', JSON.stringify(row, null, 2));

// Contar total
const count = cacheDb.prepare('SELECT COUNT(*) as total FROM analise_vendas_cache').get();
console.log(`Total de produtos no cache: ${count.total}`);

process.exit(0);

