/**
 * Script para verificar se o SQLite tem o campo tipoPreco
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../cache/loja_fisica.db');

console.log('🔍 Verificando estrutura do SQLite...\n');
console.log('📁 Caminho:', dbPath);
console.log('');

try {
  const db = new Database(dbPath, { readonly: true });

  // Ver estrutura da tabela
  console.log('📋 Estrutura da tabela produtos:');
  const tableInfo = db.prepare('PRAGMA table_info(produtos)').all();
  tableInfo.forEach(col => {
    console.log(`   - ${col.name} (${col.type})`);
  });

  console.log('\n📊 Testando alguns produtos:');
  const produtos = db.prepare('SELECT codigo_interno, descricao, preco_venda FROM produtos LIMIT 5').all();
  
  produtos.forEach((p, i) => {
    console.log(`\n${i + 1}. ${p.codigo_interno} - ${p.descricao}`);
    console.log(`   Preço: R$ ${p.preco_venda}`);
    console.log(`   Tem tipoPreco? ${p.hasOwnProperty('tipo_preco') ? 'SIM' : 'NÃO'}`);
  });

  db.close();
} catch (error) {
  console.error('❌ Erro:', error.message);
}
