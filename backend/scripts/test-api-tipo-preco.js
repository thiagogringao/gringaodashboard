/**
 * Script para testar a API e ver se tipoPreco está sendo retornado
 */

const http = require('http');

function testarAPI() {
  console.log('🔍 Testando API /api/loja-fisica/produtos...\n');

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/loja-fisica/produtos?page=1&limit=5',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        
        console.log('📊 Status:', res.statusCode);
        console.log('📦 Total de produtos:', response.data?.length || 0);
        console.log('\n🔍 Primeiros 5 produtos:\n');

        if (response.data && response.data.length > 0) {
          response.data.slice(0, 5).forEach((produto, i) => {
            console.log(`${i + 1}. ${produto.codigoInterno} - ${produto.descricao}`);
            console.log(`   Preço: R$ ${produto.precoVenda}`);
            console.log(`   tipoPreco: ${produto.tipoPreco || 'CAMPO NÃO EXISTE!'}`);
            console.log('');
          });
        } else {
          console.log('❌ Nenhum produto retornado!');
        }

      } catch (error) {
        console.error('❌ Erro ao parsear JSON:', error.message);
        console.log('Resposta:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Erro na requisição:', error.message);
  });

  req.end();
}

testarAPI();
