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
  console.log('🔍 Verificando produto 020934 na vw_dprodutos...\n');

  try {
    // Tentar diferentes formatos
    console.log('1️⃣ Tentando com LPAD (13 zeros):');
    let [rows] = await pool.query(`
      SELECT CODIGO_INTERNO, VALOR_REVENDA, VALOR_VAREJO 
      FROM vw_dprodutos 
      WHERE CODIGO_INTERNO = LPAD('020934', 13, '0')
    `);
    console.log('   Resultado:', rows.length > 0 ? rows[0] : 'NÃO ENCONTRADO');

    console.log('\n2️⃣ Tentando sem zeros:');
    [rows] = await pool.query(`
      SELECT CODIGO_INTERNO, VALOR_REVENDA, VALOR_VAREJO 
      FROM vw_dprodutos 
      WHERE CODIGO_INTERNO = '020934'
    `);
    console.log('   Resultado:', rows.length > 0 ? rows[0] : 'NÃO ENCONTRADO');

    console.log('\n3️⃣ Tentando com LIKE:');
    [rows] = await pool.query(`
      SELECT CODIGO_INTERNO, VALOR_REVENDA, VALOR_VAREJO 
      FROM vw_dprodutos 
      WHERE CODIGO_INTERNO LIKE '%020934%'
    `);
    console.log('   Resultado:', rows.length > 0 ? rows[0] : 'NÃO ENCONTRADO');

    console.log('\n4️⃣ Verificando total de produtos na view:');
    [rows] = await pool.query(`
      SELECT COUNT(*) as total FROM vw_dprodutos
    `);
    console.log('   Total de produtos na view:', rows[0].total);

    console.log('\n5️⃣ Verificando alguns produtos da view:');
    [rows] = await pool.query(`
      SELECT CODIGO_INTERNO, VALOR_REVENDA, VALOR_VAREJO 
      FROM vw_dprodutos 
      LIMIT 5
    `);
    console.log('   Exemplos:');
    rows.forEach(r => {
      console.log(`   - ${r.CODIGO_INTERNO}: Revenda=${r.VALOR_REVENDA}, Varejo=${r.VALOR_VAREJO}`);
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

verificar();
