const { poolEcommerce } = require('../config/database');

(async () => {
  try {
    console.log('🔍 Verificando imagens na view vw_dprodutos...\n');
    
    // Verificar produto CP1361
    console.log('Buscando produto CP1361:');
    const [rows] = await poolEcommerce.query(
      'SELECT sku, nome, imagem FROM vw_dprodutos WHERE sku = ? LIMIT 1',
      ['CP1361']
    );
    
    if (rows.length > 0) {
      const p = rows[0];
      console.log('✅ Produto encontrado:');
      console.log('SKU:', p.sku);
      console.log('Nome:', p.nome ? p.nome.substring(0, 50) + '...' : 'N/A');
      console.log('imagem:', p.imagem || 'SEM IMAGEM');
      console.log('');
      
      if (p.imagem) {
        console.log('✅ Imagem disponível!');
        console.log('URL:', p.imagem);
      } else {
        console.log('❌ Produto sem imagem na view');
      }
    } else {
      console.log('❌ Produto não encontrado na view');
    }
    
    console.log('\n📊 Estatísticas de imagens:');
    
    // Total de produtos
    const [total] = await poolEcommerce.query('SELECT COUNT(*) as total FROM vw_dprodutos');
    console.log('Total de produtos na view:', total[0].total);
    
    // Produtos com imagem
    const [withImage] = await poolEcommerce.query(
      "SELECT COUNT(*) as total FROM vw_dprodutos WHERE imagem IS NOT NULL AND imagem != ''"
    );
    console.log('Produtos com imagem:', withImage[0].total);
    
    // Amostra de produtos com imagem
    console.log('\n📦 Amostra de produtos com imagem:');
    const [sample] = await poolEcommerce.query(
      "SELECT sku, nome, imagem FROM vw_dprodutos WHERE imagem IS NOT NULL AND imagem != '' LIMIT 5"
    );
    
    sample.forEach(p => {
      console.log(`\n  SKU: ${p.sku}`);
      console.log(`  Nome: ${p.nome.substring(0, 40)}...`);
      console.log(`  Imagem: ${p.imagem}`);
    });
    
    await poolEcommerce.end();
    console.log('\n✅ Verificação concluída!');
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
})();

