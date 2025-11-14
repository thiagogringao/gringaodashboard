/**
 * Script para adicionar colunas preco_custo e margem na tabela produtos
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../cache/loja_fisica.db');
const db = new Database(dbPath);

console.log('Adicionando colunas preco_custo e margem...\n');

try {
  // Verificar se as colunas já existem
  const tableInfo = db.prepare("PRAGMA table_info(produtos)").all();
  const colunas = tableInfo.map(col => col.name);
  
  console.log('Colunas atuais:', colunas.join(', '));
  console.log('');
  
  // Adicionar preco_custo se não existir
  if (!colunas.includes('preco_custo')) {
    console.log('Adicionando coluna preco_custo...');
    db.exec('ALTER TABLE produtos ADD COLUMN preco_custo REAL DEFAULT 0');
    console.log('✅ Coluna preco_custo adicionada');
  } else {
    console.log('✓ Coluna preco_custo já existe');
  }
  
  // Adicionar margem se não existir
  if (!colunas.includes('margem')) {
    console.log('Adicionando coluna margem...');
    db.exec('ALTER TABLE produtos ADD COLUMN margem REAL DEFAULT 0');
    console.log('✅ Coluna margem adicionada');
  } else {
    console.log('✓ Coluna margem já existe');
  }
  
  console.log('\n✅ Colunas adicionadas com sucesso!');
  console.log('\nAgora execute o backup para popular os dados:');
  console.log('  node scripts/backupToSQLite.js');
  
} catch (error) {
  console.error('❌ Erro:', error.message);
  process.exit(1);
} finally {
  db.close();
}



