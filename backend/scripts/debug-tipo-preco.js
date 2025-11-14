/**
 * Script para debugar o tipoPreco retornado
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
  console.log('🔍 Testando tipoPreco para vários produtos...\n');

  try {
    const [rows] = await pool.query(`
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
        ) as precoFinal,
        CASE
          WHEN v.VALOR_REVENDA IS NOT NULL AND v.VALOR_REVENDA > 0 THEN 'revenda'
          WHEN v.VALOR_ATACADO IS NOT NULL AND v.VALOR_ATACADO > 0 THEN 'atacado'
          WHEN v.VALOR_VAREJO IS NOT NULL AND v.VALOR_VAREJO > 0 THEN 'varejo'
          ELSE 'estoque'
        END as tipoPreco
      FROM produtos p
      LEFT JOIN estoque e ON p.CODIGO_INTERNO = e.CODIGO_INTERNO AND e.COD_LOCAL = '001'
      LEFT JOIN vw_dprodutos v ON LPAD(p.CODIGO_INTERNO, 13, '0') = v.CODIGO_INTERNO
      LIMIT 20
    `);

    console.log('📊 Resultados:\n');
    
    rows.forEach((r, i) => {
      console.log(`${i + 1}. ${r.codigo} - ${r.DESCRICAO}`);
      console.log(`   VALOR_REVENDA: ${r.VALOR_REVENDA === null ? 'NULL' : r.VALOR_REVENDA === 0 ? '0' : r.VALOR_REVENDA}`);
      console.log(`   VALOR_ATACADO: ${r.VALOR_ATACADO === null ? 'NULL' : r.VALOR_ATACADO === 0 ? '0' : r.VALOR_ATACADO}`);
      console.log(`   VALOR_VAREJO: ${r.VALOR_VAREJO === null ? 'NULL' : r.VALOR_VAREJO === 0 ? '0' : r.VALOR_VAREJO}`);
      console.log(`   VALOR_VENDA (estoque): ${r.VALOR_VENDA === null ? 'NULL' : r.VALOR_VENDA === 0 ? '0' : r.VALOR_VENDA}`);
      console.log(`   ✅ Preço Final: R$ ${r.precoFinal}`);
      console.log(`   🏷️  Tipo: ${r.tipoPreco}`);
      console.log('');
    });

    // Estatísticas
    const stats = {
      revenda: rows.filter(r => r.tipoPreco === 'revenda').length,
      atacado: rows.filter(r => r.tipoPreco === 'atacado').length,
      varejo: rows.filter(r => r.tipoPreco === 'varejo').length,
      estoque: rows.filter(r => r.tipoPreco === 'estoque').length
    };

    console.log('📈 Estatísticas:');
    console.log(`   Revenda: ${stats.revenda}`);
    console.log(`   Atacado: ${stats.atacado}`);
    console.log(`   Varejo: ${stats.varejo}`);
    console.log(`   Estoque: ${stats.estoque}`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

testar();
