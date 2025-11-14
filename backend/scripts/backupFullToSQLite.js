/**
 * Script para fazer backup completo do MySQL para SQLite
 */

const sqliteBackupService = require('../services/sqliteBackupService');

async function main() {
  try {
    console.log('🚀 Iniciando backup completo para SQLite...\n');
    
    const result = await sqliteBackupService.backupFullLojaFisica();
    
    if (result.success) {
      console.log('✅ Backup concluído com sucesso!');
      console.log(`📊 ${result.total} produtos salvos em ${result.tempo}s\n`);
      
      // Mostrar estatísticas
      const stats = sqliteBackupService.getBackupStats();
      console.log('📈 Estatísticas do backup:');
      console.log(`  - Total de produtos: ${stats.totalProdutos}`);
      console.log(`  - Produtos com vendas: ${stats.produtosComVendas}`);
      console.log(`  - Produtos com imagem: ${stats.produtosComImagem}`);
      console.log(`  - Última sincronização: ${stats.ultimaSincronizacao}\n`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

main();

