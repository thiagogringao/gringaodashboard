/**
 * Script para executar backup manual
 * Uso: node scripts/runBackup.js
 */

require('dotenv').config();
const backupService = require('../services/backupService');

async function main() {
  console.log('Iniciando backup manual...');
  
  try {
    await backupService.initialize();
    const result = await backupService.runFullBackup();
    
    console.log('\n=== Resultado do Backup ===');
    console.log(JSON.stringify(result, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Erro ao executar backup:', error);
    process.exit(1);
  }
}

main();

