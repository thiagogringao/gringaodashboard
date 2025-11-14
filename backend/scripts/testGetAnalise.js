const backupService = require('../services/backupService');

async function test() {
  try {
    const codigos = ['025521', '025528'];
    const analise = await backupService.getAnaliseVendasFromBackup(codigos);
    
    console.log('Resultado da função getAnaliseVendasFromBackup:');
    console.log(JSON.stringify(analise, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error('Erro:', err);
    process.exit(1);
  }
}

test();

