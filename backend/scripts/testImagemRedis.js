const redis = require('../config/redis');

async function test() {
  try {
    const indexKey = 'backup:loja-fisica:index';
    const indexData = await redis.get(indexKey);
    
    if (indexData) {
      const index = JSON.parse(indexData);
      const produto = index['025521'];
      
      console.log('Produto 025521 no Redis:');
      console.log('- Estoque Mínimo:', produto?.estoqueMinimo);
      console.log('- Mês Pico:', produto?.mesPico);
      console.log('- Tem Imagem:', !!produto?.imagemBase64);
      if (produto?.imagemBase64) {
        console.log('- Tipo Imagem:', produto.imagemBase64.startsWith('http') ? 'URL' : 'Base64');
        console.log('- Imagem (primeiros 100 chars):', produto.imagemBase64.substring(0, 100));
      }
    } else {
      console.log('Nenhum dado no Redis');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Erro:', err);
    process.exit(1);
  }
}

test();

