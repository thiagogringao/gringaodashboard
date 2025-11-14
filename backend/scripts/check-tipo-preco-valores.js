const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../cache/loja_fisica.db');
const db = new Database(dbPath, { readonly: true });

console.log('🔍 Verificando valores de tipo_preco...\n');

const produtos = db.prepare('SELECT codigo_interno, descricao, preco_venda, tipo_preco FROM produtos LIMIT 10').all();

produtos.forEach((p, i) => {
  console.log(`${i + 1}. ${p.codigo_interno} - ${p.descricao}`);
  console.log(`   Preço: R$ ${p.preco_venda}`);
  console.log(`   Tipo Preço: ${p.tipo_preco}`);
  console.log('');
});

// Estatísticas
const stats = db.prepare(`
  SELECT tipo_preco, COUNT(*) as total 
  FROM produtos 
  GROUP BY tipo_preco
`).all();

console.log('📊 Estatísticas:');
stats.forEach(s => {
  console.log(`   ${s.tipo_preco}: ${s.total} produtos`);
});

db.close();
