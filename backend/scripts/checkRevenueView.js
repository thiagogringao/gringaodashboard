const { poolEcommerce } = require('../config/database');

async function checkRevenueView() {
  try {
    console.log('📊 Verificando dados da vw_revenue...\n');

    // Período de dados
    const [periodo] = await poolEcommerce.query(`
      SELECT 
        MIN(data) as primeira_venda,
        MAX(data) as ultima_venda,
        COUNT(DISTINCT CONCAT(YEAR(data), '-', MONTH(data))) as meses_com_vendas,
        COUNT(*) as total_registros
      FROM vw_revenue
    `);

    const p = periodo[0];
    console.log('📅 Período de dados:');
    console.log(`  Primeira venda: ${new Date(p.primeira_venda).toLocaleDateString('pt-BR')}`);
    console.log(`  Última venda: ${new Date(p.ultima_venda).toLocaleDateString('pt-BR')}`);
    console.log(`  Meses com vendas: ${p.meses_com_vendas}`);
    console.log(`  Total de registros: ${p.total_registros}`);
    console.log('');

    // Vendas por mês (últimos 12 meses)
    const [vendasMes] = await poolEcommerce.query(`
      SELECT 
        YEAR(data) as ano,
        MONTH(data) as mes,
        COUNT(*) as total_vendas,
        SUM(quantidade) as total_quantidade,
        SUM(CAST(faturamento AS DECIMAL(10,2))) as faturamento_total
      FROM vw_revenue
      WHERE data >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY YEAR(data), MONTH(data)
      ORDER BY ano DESC, mes DESC
    `);

    console.log('📈 Vendas por mês (últimos 12 meses):');
    vendasMes.forEach(v => {
      const mesNome = new Date(v.ano, v.mes - 1).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      console.log(`  ${mesNome}: ${v.total_vendas} vendas, ${v.total_quantidade} unidades, R$ ${parseFloat(v.faturamento_total).toFixed(2)}`);
    });
    console.log('');

    // Verificar produto CP1361 especificamente
    const [cp1361] = await poolEcommerce.query(`
      SELECT 
        YEAR(data) as ano,
        MONTH(data) as mes,
        SUM(quantidade) as quantidade,
        COUNT(*) as numeroVendas,
        AVG(CAST(valor AS DECIMAL(10,2))) as precoMedio,
        AVG(CAST(custo AS DECIMAL(10,2))) as custoMedio
      FROM vw_revenue
      WHERE sku = 'CP1361' AND data >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY YEAR(data), MONTH(data)
      ORDER BY ano DESC, mes DESC
    `);

    console.log('📦 Produto CP1361 (últimos 12 meses):');
    if (cp1361.length === 0) {
      console.log('  ❌ Nenhuma venda encontrada');
    } else {
      cp1361.forEach(v => {
        const mesNome = new Date(v.ano, v.mes - 1).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        console.log(`  ${mesNome}: ${v.quantidade} unidades, ${v.numeroVendas} vendas, R$ ${parseFloat(v.precoMedio).toFixed(2)}, Custo: R$ ${parseFloat(v.custoMedio).toFixed(2)}`);
      });
    }

    await poolEcommerce.end();
    console.log('\n✅ Verificação concluída!');
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

checkRevenueView();

