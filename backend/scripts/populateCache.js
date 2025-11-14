/**
 * Script para popular o cache SQLite com dados do backup JSON
 */

const cacheDb = require('../config/cacheDatabase');
const fs = require('fs');
const path = require('path');

async function populateCache() {
  try {
    // Ler arquivo de backup mais recente
    const backupDir = path.join(__dirname, '../backups');
    const files = fs.readdirSync(backupDir);
    const lojaFisicaFiles = files.filter(f => f.startsWith('loja_fisica_') && f.endsWith('.json'));
    
    if (lojaFisicaFiles.length === 0) {
      console.log('❌ Nenhum arquivo de backup encontrado!');
      return;
    }

    // Ordenar por data e pegar o mais recente
    lojaFisicaFiles.sort().reverse();
    const latestFile = path.join(backupDir, lojaFisicaFiles[0]);
    
    console.log(`📂 Lendo backup: ${lojaFisicaFiles[0]}`);
    const data = JSON.parse(fs.readFileSync(latestFile, 'utf8'));
    
    console.log(`📊 Total de produtos no backup: ${data.length}`);

    // Preparar statement para inserção
    const stmt = cacheDb.prepare(`
      INSERT OR REPLACE INTO analise_vendas_cache 
        (codigo_produto, estoque_minimo, mes_pico, media_mensal, total_vendas, imagem_base64, data_atualizacao)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    // Usar transação para inserir tudo de uma vez (muito mais rápido)
    const insertMany = cacheDb.transaction((produtos) => {
      for (const produto of produtos) {
        stmt.run(
          produto.codigoInterno,
          produto.estoqueMinimo || 0,
          produto.mesPico || null,
          produto.mediaMensal || 0,
          produto.totalVendas || 0,
          produto.imagemBase64 || null
        );
      }
    });

    console.log('💾 Salvando no cache SQLite...');
    insertMany(data);
    
    // Verificar quantos foram salvos
    const count = cacheDb.prepare('SELECT COUNT(*) as total FROM analise_vendas_cache').get();
    console.log(`✅ ${count.total} produtos salvos no cache SQLite!`);

    // Mostrar amostra
    const sample = cacheDb.prepare('SELECT * FROM analise_vendas_cache ORDER BY total_vendas DESC LIMIT 3').all();
    console.log('\n📋 Amostra (top 3 mais vendidos):');
    sample.forEach(p => {
      console.log(`  - ${p.codigo_produto}: ${p.total_vendas} vendas, estoque mín: ${p.estoque_minimo}, pico: ${p.mes_pico}`);
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

populateCache();

