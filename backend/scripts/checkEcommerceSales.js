const { poolEcommerce } = require('../config/database');

(async () => {
  try {
    console.log('🔍 Verificando vendas do produto CP1361...\n');
    
    // Verificar vendas dos últimos 12 meses
    console.log('Buscando vendas dos últimos 12 meses:');
    const [rows] = await poolEcommerce.query(`
      SELECT
        MONTH(data) as mes,
        YEAR(data) as ano,
        SUM(quantidade) as quantidade,
        COUNT(DISTINCT id) as numeroVendas,
        AVG(valor) as precoMedio
      FROM bling2_detalhes_pedidos
      WHERE codigo = ?
        AND data >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY YEAR(data), MONTH(data)
      ORDER BY ano DESC, mes DESC
    `, ['CP1361']);
    
    console.log('Total de meses com vendas:', rows.length);
    console.log('');
    
    if (rows.length > 0) {
      console.log('Vendas por mês:');
      rows.forEach(r => {
        const precoMedio = parseFloat(r.precoMedio) || 0;
        console.log(`  ${r.mes}/${r.ano}: ${r.quantidade} unidades, ${r.numeroVendas} vendas, R$ ${precoMedio.toFixed(2)} (preço médio)`);
      });
      
      const totalVendas = rows.reduce((sum, r) => sum + parseInt(r.quantidade), 0);
      console.log('\nTotal de vendas (12 meses):', totalVendas);
    } else {
      console.log('❌ Nenhuma venda encontrada!');
    }
    
    // Verificar se há vendas em outros períodos
    console.log('\n📊 Verificando vendas em todo o histórico:');
    const [allSales] = await poolEcommerce.query(`
      SELECT
        COUNT(*) as totalRegistros,
        SUM(quantidade) as totalQuantidade,
        MIN(data) as primeiraVenda,
        MAX(data) as ultimaVenda
      FROM bling2_detalhes_pedidos
      WHERE codigo = ?
    `, ['CP1361']);
    
    if (allSales[0].totalRegistros > 0) {
      console.log('Total de registros:', allSales[0].totalRegistros);
      console.log('Total de quantidade:', allSales[0].totalQuantidade);
      console.log('Primeira venda:', allSales[0].primeiraVenda);
      console.log('Última venda:', allSales[0].ultimaVenda);
    } else {
      console.log('❌ Nenhuma venda encontrada em todo o histórico!');
    }
    
    await poolEcommerce.end();
    console.log('\n✅ Verificação concluída!');
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
})();

