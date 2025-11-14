/**
 * Script para executar migrations no banco de dados
 * Uso: node scripts/runMigration.js <arquivo_migration.sql>
 */

const fs = require('fs').promises;
const path = require('path');
const { poolLojaFisica } = require('../config/database');

async function runMigration(migrationFile) {
  try {
    console.log(`\n=== Executando Migration: ${migrationFile} ===\n`);

    // Ler arquivo SQL
    const sqlPath = path.join(__dirname, '../migrations', migrationFile);
    const sql = await fs.readFile(sqlPath, 'utf8');

    // Dividir por statements (separados por ;)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    // Executar cada statement
    for (const statement of statements) {
      console.log(`Executando: ${statement.substring(0, 100)}...`);
      await poolLojaFisica.query(statement);
      console.log('✅ Sucesso!\n');
    }

    console.log(`✅ Migration ${migrationFile} executada com sucesso!\n`);
  } catch (error) {
    console.error(`❌ Erro ao executar migration ${migrationFile}:`, error.message);
    throw error;
  } finally {
    await poolLojaFisica.end();
  }
}

// Executar migration
const migrationFile = process.argv[2] || '001_create_analise_vendas_cache.sql';
runMigration(migrationFile)
  .then(() => {
    console.log('✅ Processo concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro:', error);
    process.exit(1);
  });

