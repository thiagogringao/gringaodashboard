const { poolEcommerce } = require('../config/database');

(async () => {
  try {
    console.log('🔍 Verificando imagens no banco de dados...\n');
    
    // Verificar colunas
    const [columns] = await poolEcommerce.query('SHOW COLUMNS FROM bling2_produtos');
    console.log('📋 Colunas da tabela bling2_produtos:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });
    
    console.log('\n📊 Estatísticas de imagens:');
    
    // Total de produtos
    const [totalCount] = await poolEcommerce.query('SELECT COUNT(*) as total FROM bling2_produtos');
    console.log(`  Total de produtos: ${totalCount[0].total}`);
    
    // Produtos com imagemURL
    const [withImage] = await poolEcommerce.query(
      "SELECT COUNT(*) as total FROM bling2_produtos WHERE imagemURL IS NOT NULL AND imagemURL != ''"
    );
    console.log(`  Produtos com imagemURL: ${withImage[0].total}`);
    
    // Verificar alguns produtos
    console.log('\n🔍 Amostra de produtos:');
    const [sample] = await poolEcommerce.query(
      'SELECT codigo, nome, imagemURL FROM bling2_produtos LIMIT 5'
    );
    
    sample.forEach(p => {
      console.log(`\n  Código: ${p.codigo}`);
      console.log(`  Nome: ${p.nome.substring(0, 50)}...`);
      console.log(`  imagemURL: ${p.imagemURL ? (p.imagemURL.substring(0, 80) + '...') : '(vazio)'}`);
    });
    
    await poolEcommerce.end();
    console.log('\n✅ Verificação concluída!');
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
})();

