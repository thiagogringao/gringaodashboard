/**
 * Script para testar a lógica de prioridade de preços
 */

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

async function testar() {
  console.log('🔍 Testando lógica de prioridade de preços...\n');
  console.log('📋 REGRA: REVENDA → ATACADO → VAREJO → VALOR_VENDA\n');

  try {
    // Testar com produto 020934
    console.log('1️⃣ Testando produto 020934:');
    const [rows] = await pool.query(`
      SELECT
        p.CODIGO_INTERNO as codigo,
        v.VALOR_REVENDA,
        v.VALOR_ATACADO,
        v.VALOR_VAREJO,
        e.VALOR_VENDA,
        COALESCE(
          NULLIF(v.VALOR_REVENDA, 0),
          NULLIF(v.VALOR_ATACADO, 0),
          NULLIF(v.VALOR_VAREJO, 0),
          e.VALOR_VENDA,
          0
        ) as precoFinal
      FROM produtos p
      LEFT JOIN estoque e ON p.CODIGO_INTERNO = e.CODIGO_INTERNO AND e.COD_LOCAL = '001'
      LEFT JOIN vw_dprodutos v ON LPAD(p.CODIGO_INTERNO, 13, '0') = v.CODIGO_INTERNO
      WHERE p.CODIGO_INTERNO = '020934'
    `);

    if (rows.length > 0) {
      const r = rows[0];
      console.log('   Código:', r.codigo);
      console.log('   VALOR_REVENDA:', r.VALOR_REVENDA || 'NULL');
      console.log('   VALOR_ATACADO:', r.VALOR_ATACADO || 'NULL');
      console.log('   VALOR_VAREJO:', r.VALOR_VAREJO || 'NULL');
      console.log('   VALOR_VENDA (estoque):', r.VALOR_VENDA || 'NULL');
      console.log('   ✅ PREÇO FINAL:', r.precoFinal);
      
      // Determinar qual foi usado
      if (r.VALOR_REVENDA && r.VALOR_REVENDA > 0) {
        console.log('   📊 Usando: VALOR_REVENDA');
      } else if (r.VALOR_ATACADO && r.VALOR_ATACADO > 0) {
        console.log('   📊 Usando: VALOR_ATACADO');
      } else if (r.VALOR_VAREJO && r.VALOR_VAREJO > 0) {
        console.log('   📊 Usando: VALOR_VAREJO');
      } else {
        console.log('   📊 Usando: VALOR_VENDA (fallback)');
      }
    }

    // Testar com alguns produtos da view
    console.log('\n2️⃣ Testando produtos que ESTÃO na view:');
    const [rows2] = await pool.query(`
      SELECT
        p.CODIGO_INTERNO as codigo,
        p.DESCRICAO,
        v.VALOR_REVENDA,
        v.VALOR_ATACADO,
        v.VALOR_VAREJO,
        e.VALOR_VENDA,
        COALESCE(
          NULLIF(v.VALOR_REVENDA, 0),
          NULLIF(v.VALOR_ATACADO, 0),
          NULLIF(v.VALOR_VAREJO, 0),
          e.VALOR_VENDA,
          0
        ) as precoFinal
      FROM produtos p
      LEFT JOIN estoque e ON p.CODIGO_INTERNO = e.CODIGO_INTERNO AND e.COD_LOCAL = '001'
      LEFT JOIN vw_dprodutos v ON LPAD(p.CODIGO_INTERNO, 13, '0') = v.CODIGO_INTERNO
      WHERE v.CODIGO_INTERNO IS NOT NULL
      LIMIT 5
    `);

    rows2.forEach((r, i) => {
      console.log(`\n   ${i + 1}. ${r.codigo} - ${r.DESCRICAO}`);
      console.log(`      Revenda: ${r.VALOR_REVENDA || 0} | Atacado: ${r.VALOR_ATACADO || 0} | Varejo: ${r.VALOR_VAREJO || 0}`);
      console.log(`      ✅ Preço Final: R$ ${r.precoFinal}`);
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

testar();
