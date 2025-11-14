/**
 * Script para migrar o schema do SQLite e adicionar colunas faltantes
 * Execute este script uma vez para atualizar a estrutura da tabela produtos
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../cache/loja_fisica.db');
const db = new Database(dbPath);

console.log('🔧 Iniciando migração do schema SQLite...\n');

try {
  // Verificar quais colunas existem
  const tableInfo = db.prepare("PRAGMA table_info(produtos)").all();
  const existingColumns = tableInfo.map(col => col.name);
  
  console.log('📋 Colunas existentes:', existingColumns.join(', '));
  console.log('');

  // Lista de colunas que precisam existir
  const requiredColumns = [
    { name: 'categoria', type: 'TEXT', default: null },
    { name: 'historico_12_meses', type: 'TEXT', default: null },
    { name: 'analise_preditiva', type: 'TEXT', default: null },
    { name: 'mes_pico_numero', type: 'INTEGER', default: null },
    { name: 'tendencia_percentual', type: 'REAL', default: 0 },
    { name: 'previsao_proximo_mes', type: 'INTEGER', default: 0 },
    { name: 'risco_ruptura', type: 'TEXT', default: null },
    { name: 'dias_estoque', type: 'INTEGER', default: 0 },
    { name: 'estoque_ideal_sugerido', type: 'INTEGER', default: 0 }
  ];

  let columnsAdded = 0;

  // Adicionar colunas faltantes
  for (const col of requiredColumns) {
    if (!existingColumns.includes(col.name)) {
      const defaultClause = col.default !== null ? `DEFAULT ${col.default}` : '';
      const sql = `ALTER TABLE produtos ADD COLUMN ${col.name} ${col.type} ${defaultClause}`;
      
      console.log(`➕ Adicionando coluna: ${col.name} (${col.type})`);
      db.exec(sql);
      columnsAdded++;
    }
  }

  if (columnsAdded > 0) {
    console.log(`\n✅ ${columnsAdded} colunas adicionadas com sucesso!`);
    console.log('\n🔄 Agora execute o backup completo para popular os novos campos:');
    console.log('   POST http://localhost:3001/api/backup/full\n');
  } else {
    console.log('\n✅ Todas as colunas já existem. Schema está atualizado!\n');
  }

} catch (error) {
  console.error('❌ Erro na migração:', error.message);
  console.error(error);
  process.exit(1);
} finally {
  db.close();
}
