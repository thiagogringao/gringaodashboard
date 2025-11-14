/**
 * Script para testar VALOR_REVENDA da vw_dprodutos
 */

const mysql = require('mysql2/promise');

const poolLojaFisica = mysql.createPool({
  host: '5.161.115.232',
  port: 3306,
  user: 'app',
  password: 'lnC3bz5Qy93R',
  database: 'loja_fisica',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function testar() {
  console.log('🔍 Testando VALOR_REVENDA para produto 020934...\n');

  try {
    // 1. Verificar estrutura da vw_dprodutos
    console.log('1️⃣ Verificando estrutura da vw_dprodutos:');
    const [columns] = await poolLojaFisica.query(`
      DESCRIBE vw_dprodutos
    `);
    console.log('   Colunas disponíveis:');
    columns.forEach(col => {
      console.log(`   - ${col.Field} (${col.Type})`);
    });

    console.log('\n2️⃣ Verificando dados do produto 020934:');
    const [viewData] = await poolLojaFisica.query(`
      SELECT *
      FROM vw_dprodutos 
      WHERE CODIGO_INTERNO = '0000000020934'
    `);
    
    if (viewData.length > 0) {
      console.log('   ✅ Encontrado na view:');
      console.log('   Dados:', JSON.stringify(viewData[0], null, 2));
    } else {
      console.log('   ❌ NÃO encontrado na view!');
    }

    console.log('\n3️⃣ Verificando tabela estoque:');
    const [estoqueData] = await poolLojaFisica.query(`
      SELECT 
        CODIGO_INTERNO,
        VALOR_VENDA
      FROM estoque 
      WHERE CODIGO_INTERNO = '020934' AND COD_LOCAL = '001'
    `);
    
    if (estoqueData.length > 0) {
      console.log('   ✅ Encontrado no estoque:');
      console.log('   CODIGO_INTERNO:', estoqueData[0].CODIGO_INTERNO);
      console.log('   VALOR_VENDA:', estoqueData[0].VALOR_VENDA);
    } else {
      console.log('   ❌ NÃO encontrado no estoque!');
    }

    console.log('\n4️⃣ Testando query do controller (sem VALOR_CUSTO):');
    const [controllerData] = await poolLojaFisica.query(`
      SELECT
        p.CODIGO_INTERNO as codigoInterno,
        COALESCE(e.SALDO_ATUAL, 0) as estoque,
        COALESCE(v.VALOR_REVENDA, e.VALOR_VENDA, 0) as precoVenda,
        v.VALOR_REVENDA as valorRevenda,
        e.VALOR_VENDA as valorVenda
      FROM produtos p
      LEFT JOIN estoque e ON p.CODIGO_INTERNO = e.CODIGO_INTERNO AND e.COD_LOCAL = '001'
      LEFT JOIN vw_dprodutos v ON LPAD(p.CODIGO_INTERNO, 13, '0') = v.CODIGO_INTERNO
      WHERE p.CODIGO_INTERNO = '020934'
    `);

    if (controllerData.length > 0) {
      console.log('   ✅ Resultado da query do controller:');
      console.log('   codigoInterno:', controllerData[0].codigoInterno);
      console.log('   precoVenda (COALESCE):', controllerData[0].precoVenda);
      console.log('   valorRevenda (direto):', controllerData[0].valorRevenda);
      console.log('   valorVenda (direto):', controllerData[0].valorVenda);
      console.log('\n   📊 Análise:');
      if (controllerData[0].valorRevenda) {
        console.log('   ✅ VALOR_REVENDA existe na view:', controllerData[0].valorRevenda);
        console.log('   ✅ COALESCE deveria usar:', controllerData[0].valorRevenda);
        console.log('   ✅ Resultado final:', controllerData[0].precoVenda);
      } else {
        console.log('   ⚠️  VALOR_REVENDA é NULL na view');
        console.log('   ⚠️  Usando fallback VALOR_VENDA:', controllerData[0].valorVenda);
        console.log('   ⚠️  Resultado final:', controllerData[0].precoVenda);
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await poolLojaFisica.end();
  }
}

testar();
