const redis = require('../config/redis');

async function debug() {
  try {
    const indexKey = 'backup:loja-fisica:index';
    const indexData = await redis.get(indexKey);
    
    if (indexData) {
      const index = JSON.parse(indexData);
      const totalProdutos = Object.keys(index).length;
      const comImagem = Object.values(index).filter(p => p.imagemBase64).length;
      
      console.log('Total de produtos no Redis:', totalProdutos);
      console.log('Produtos com imagem:', comImagem);
      console.log('Tamanho dos dados:', (indexData.length / 1024 / 1024).toFixed(2), 'MB');
      
      // Mostrar exemplo de produto com imagem
      const produtoComImagem = Object.entries(index).find(([k, v]) => v.imagemBase64);
      if (produtoComImagem) {
        console.log('\nExemplo de produto com imagem:');
        console.log('Código:', produtoComImagem[0]);
        console.log('Imagem:', produtoComImagem[1].imagemBase64.substring(0, 100));
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

debug();

