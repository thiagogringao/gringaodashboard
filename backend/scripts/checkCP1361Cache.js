const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'cache', 'ecommerce.db');
const db = new Database(dbPath);

try {
  const produto = db.prepare('SELECT codigo, nome, total_vendas, historico_12_meses FROM produtos WHERE codigo = ?').get('CP1361');
  
  if (!produto) {
    console.log('❌ Produto CP1361 não encontrado no cache');
    process.exit(1);
  }

  console.log('📦 Produto CP1361 no cache SQLite:\n');
  console.log(`  Código: ${produto.codigo}`);
  console.log(`  Nome: ${produto.nome.substring(0, 50)}...`);
  console.log(`  Total Vendas: ${produto.total_vendas}`);
  
  const historico = JSON.parse(produto.historico_12_meses);
  console.log(`  Histórico: ${historico.length} meses\n`);
  
  console.log('📊 Meses com vendas:');
  historico.forEach(h => {
    const mesNome = new Date(h.ano, h.mes - 1).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    console.log(`  ${mesNome}: ${h.quantidade} unidades, ${h.numeroVendas} vendas, R$ ${h.precoMedio.toFixed(2)}`);
  });

  console.log('\n✅ Dados completos no cache!');
} catch (error) {
  console.error('❌ Erro:', error.message);
  process.exit(1);
} finally {
  db.close();
}

