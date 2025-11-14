const db = require('../config/cacheDatabase');

async function addAnalisePreditivaColumns() {
  console.log('🔧 Adicionando colunas de análise preditiva...');

  try {
    // Verificar quais colunas já existem
    const tableInfo = db.prepare("PRAGMA table_info(produtos);").all();
    const existingColumns = tableInfo.map(col => col.name);

    const columnsToAdd = [
      { name: 'historico_12_meses', type: 'TEXT' }, // JSON com histórico detalhado
      { name: 'analise_preditiva', type: 'TEXT' },  // JSON com análise completa
      { name: 'mes_pico_numero', type: 'INTEGER' },
      { name: 'tendencia_percentual', type: 'REAL' },
      { name: 'previsao_proximo_mes', type: 'INTEGER' },
      { name: 'risco_ruptura', type: 'TEXT' },
      { name: 'dias_estoque', type: 'INTEGER' }
    ];

    let columnsAdded = 0;
    columnsToAdd.forEach(column => {
      if (!existingColumns.includes(column.name)) {
        db.exec(`ALTER TABLE produtos ADD COLUMN ${column.name} ${column.type};`);
        console.log(`   ✅ Coluna ${column.name} adicionada`);
        columnsAdded++;
      } else {
        console.log(`   ⚠️  Coluna ${column.name} já existe`);
      }
    });

    if (columnsAdded > 0) {
      console.log(`\n✅ ${columnsAdded} coluna(s) adicionada(s) com sucesso!`);
    } else {
      console.log('\n⚠️  Todas as colunas já existem. Nenhuma alteração necessária.');
    }

    // Criar índices para otimizar buscas
    console.log('\n🔧 Criando índices...');
    
    const indices = [
      'CREATE INDEX IF NOT EXISTS idx_mes_pico ON produtos(mes_pico_numero);',
      'CREATE INDEX IF NOT EXISTS idx_risco_ruptura ON produtos(risco_ruptura);',
      'CREATE INDEX IF NOT EXISTS idx_dias_estoque ON produtos(dias_estoque);'
    ];

    indices.forEach(indexSQL => {
      db.exec(indexSQL);
    });
    console.log('   ✅ Índices criados');

    // Verificar estrutura final
    const finalTableInfo = db.prepare("PRAGMA table_info(produtos);").all();
    console.log('\n📊 Estrutura atual da tabela produtos:');
    finalTableInfo.forEach(col => console.log(`   - ${col.name} (${col.type})`));

    console.log('\n✅ Migração concluída!');
    console.log('💡 Execute o backup completo para popular os dados:\n   node scripts/backupFullToSQLite.js');

  } catch (error) {
    console.error('❌ Erro ao adicionar colunas:', error.message);
    console.error(error.stack);
  } finally {
    db.close();
  }
}

addAnalisePreditivaColumns();

