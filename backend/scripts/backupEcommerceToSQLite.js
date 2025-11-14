/**
 * Script para executar backup completo do E-commerce para SQLite
 */

const backupService = require('../services/sqliteEcommerceBackupService');

async function main() {
  console.log('🚀 Iniciando backup completo do E-commerce para SQLite...\n');

  try {
    const result = await backupService.backupFullEcommerce();

    console.log('✅ Backup concluído com sucesso!');
    console.log(`📊 ${result.total} produtos salvos em ${result.tempo}s\n`);

    // Mostrar estatísticas
    const stats = backupService.getBackupStats();
    console.log('📈 Estatísticas do backup:');
    console.log(`  - Total de produtos: ${stats.totalProdutos}`);
    console.log(`  - Produtos com vendas: ${stats.produtosComVendas}`);
    console.log(`  - Última sincronização: ${stats.ultimaSincronizacao}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();

