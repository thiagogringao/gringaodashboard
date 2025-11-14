/**
 * Script para adicionar coluna vendas_mensais na tabela produtos
 */

const cacheDb = require('../config/cacheDatabase');

console.log('🔧 Adicionando coluna vendas_mensais...\n');

try {
  // Verificar se a coluna já existe
  const tableInfo = cacheDb.prepare("PRAGMA table_info(produtos)").all();
  const columnExists = tableInfo.some(col => col.name === 'vendas_mensais');

  if (columnExists) {
    console.log('✅ Coluna vendas_mensais já existe!');
  } else {
    // Adicionar coluna
    cacheDb.exec(`
      ALTER TABLE produtos 
      ADD COLUMN vendas_mensais TEXT;
    `);
    console.log('✅ Coluna vendas_mensais adicionada com sucesso!');
  }

  console.log('\n📊 Estrutura atual da tabela produtos:');
  tableInfo.forEach(col => {
    console.log(`   - ${col.name} (${col.type})`);
  });

  console.log('\n✅ Migração concluída!');
  console.log('💡 Execute o backup completo para popular os dados:');
  console.log('   node scripts/backupFullToSQLite.js\n');

} catch (error) {
  console.error('❌ Erro na migração:', error.message);
  process.exit(1);
}

