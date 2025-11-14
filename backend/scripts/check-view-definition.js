const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '5.161.115.232',
  port: 3306,
  user: 'app',
  password: 'lnC3bz5Qy93R',
  database: 'loja_fisica',
  waitForConnections: true,
  connectionLimit: 10
});

async function verificar() {
  console.log('🔍 Verificando definição da vw_dprodutos...\n');

  try {
    const [rows] = await pool.query(`
      SHOW CREATE VIEW vw_dprodutos
    `);
    
    console.log('📋 Definição da VIEW:');
    console.log(rows[0]['Create View']);
    console.log('\n');

    // Verificar se produto 020934 existe na tabela produtos
    console.log('📦 Verificando se 020934 existe na tabela produtos:');
    const [produto] = await pool.query(`
      SELECT CODIGO_INTERNO, DESCRICAO 
      FROM produtos 
      WHERE CODIGO_INTERNO = '020934'
    `);
    console.log(produto.length > 0 ? '✅ Existe!' : '❌ NÃO existe!');
    if (produto.length > 0) {
      console.log('   Descrição:', produto[0].DESCRICAO);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

verificar();
