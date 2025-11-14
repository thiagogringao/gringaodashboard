const redis = require('../config/redis');

async function limpar() {
  try {
    await redis.del('backup:loja-fisica:index');
    await redis.del('backup:loja-fisica:products');
    await redis.del('backup:ecommerce:products');
    
    console.log('✅ Redis limpo com sucesso!');
    console.log('Execute o backup novamente: node scripts/runBackup.js');
    
    process.exit(0);
  } catch (err) {
    console.error('Erro:', err);
    process.exit(1);
  }
}

limpar();

