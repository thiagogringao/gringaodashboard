/**
 * Script para verificar se estoque_ideal_sugerido está sendo calculado
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../cache/loja_fisica.db');
const db = new Database(dbPath);

console.log('🔍 Verificando dados de estoque ideal sugerido...\n');

try {
  // Total de produtos
  const totalProdutos = db.prepare('SELECT COUNT(*) as total FROM produtos').get();
  console.log(`📦 Total de produtos no SQLite: ${totalProdutos.total}`);

  // Produtos com estoque ideal > 0
  const comEstoqueIdeal = db.prepare('SELECT COUNT(*) as total FROM produtos WHERE estoque_ideal_sugerido > 0').get();
  console.log(`✅ Produtos com estoque_ideal_sugerido > 0: ${comEstoqueIdeal.total}`);

  // Produtos com estoque ideal = 0 ou NULL
  const semEstoqueIdeal = db.prepare('SELECT COUNT(*) as total FROM produtos WHERE estoque_ideal_sugerido IS NULL OR estoque_ideal_sugerido = 0').get();
  console.log(`❌ Produtos sem estoque ideal calculado: ${semEstoqueIdeal.total}`);

  // Mostrar alguns exemplos
  console.log('\n📊 Exemplos de produtos:\n');
  const exemplos = db.prepare(`
    SELECT 
      codigo_interno,
      descricao,
      estoque,
      estoque_ideal_sugerido,
      risco_ruptura,
      dias_estoque,
      total_vendas
    FROM produtos 
    ORDER BY total_vendas DESC 
    LIMIT 5
  `).all();

  exemplos.forEach((p, i) => {
    console.log(`${i + 1}. ${p.codigo_interno} - ${p.descricao?.substring(0, 40)}`);
    console.log(`   Estoque atual: ${p.estoque}`);
    console.log(`   Estoque ideal: ${p.estoque_ideal_sugerido || 'NÃO CALCULADO'}`);
    console.log(`   Risco: ${p.risco_ruptura || 'N/A'}`);
    console.log(`   Dias estoque: ${p.dias_estoque || 'N/A'}`);
    console.log(`   Total vendas: ${p.total_vendas || 0}`);
    console.log('');
  });

  // Se nenhum produto tem estoque ideal, avisar para rodar backup
  if (comEstoqueIdeal.total === 0) {
    console.log('⚠️  NENHUM produto tem estoque_ideal_sugerido calculado!');
    console.log('');
    console.log('🔄 Execute o backup completo para calcular:');
    console.log('   POST http://localhost:3001/api/backup/full');
    console.log('');
    console.log('   Ou via curl:');
    console.log('   curl -X POST http://localhost:3001/api/backup/full');
    console.log('');
  }

} catch (error) {
  console.error('❌ Erro:', error.message);
} finally {
  db.close();
}
