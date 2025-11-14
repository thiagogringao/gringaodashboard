/**
 * Banco de dados SQLite local - Backup completo da loja física
 * Usado porque o MySQL remoto é muito lento e não temos permissão para criar tabelas
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Singleton para garantir uma única instância do banco
let dbInstance = null;

function getCacheDatabase() {
  if (dbInstance) {
    return dbInstance;
  }

  // Criar diretório de cache se não existir
  const cacheDir = path.join(__dirname, '../cache');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  // Criar conexão com banco SQLite
  const dbPath = path.join(cacheDir, 'loja_fisica.db');
  dbInstance = new Database(dbPath);

  // Configurar para melhor performance
  dbInstance.pragma('journal_mode = WAL'); // Write-Ahead Logging
  dbInstance.pragma('synchronous = NORMAL');
  dbInstance.pragma('cache_size = 10000'); // Cache de 10MB
  dbInstance.pragma('temp_store = MEMORY');

  // Criar tabelas
  dbInstance.exec(`
    -- Tabela de produtos (dados básicos + análise de vendas)
    CREATE TABLE IF NOT EXISTS produtos (
      codigo_interno TEXT PRIMARY KEY,
      codigo_barras TEXT,
      descricao TEXT,
      descricao_resumida TEXT,
      codigo_fornecedor TEXT,
      categoria TEXT,
      estoque INTEGER DEFAULT 0,
      preco_venda REAL DEFAULT 0,
      preco_custo REAL DEFAULT 0,
      margem REAL DEFAULT 0,
      tipo_preco TEXT DEFAULT 'estoque',
      fornecedor TEXT,
      imagem_base64 TEXT,
      -- Análise de vendas
      estoque_minimo INTEGER DEFAULT 0,
      mes_pico TEXT,
      media_mensal REAL DEFAULT 0,
      total_vendas INTEGER DEFAULT 0,
      vendas_mensais TEXT, -- JSON com vendas dos últimos 6 meses
      -- Análise preditiva (12 meses)
      historico_12_meses TEXT, -- JSON com histórico completo
      analise_preditiva TEXT, -- JSON com análise completa
      mes_pico_numero INTEGER,
      tendencia_percentual REAL DEFAULT 0,
      previsao_proximo_mes INTEGER DEFAULT 0,
      risco_ruptura TEXT,
      dias_estoque INTEGER DEFAULT 0,
      estoque_ideal_sugerido INTEGER DEFAULT 0,
      -- Metadados
      data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Índices para performance
    CREATE INDEX IF NOT EXISTS idx_codigo_barras ON produtos(codigo_barras);
    CREATE INDEX IF NOT EXISTS idx_descricao ON produtos(descricao);
    CREATE INDEX IF NOT EXISTS idx_fornecedor ON produtos(codigo_fornecedor);
    CREATE INDEX IF NOT EXISTS idx_total_vendas ON produtos(total_vendas DESC);
    CREATE INDEX IF NOT EXISTS idx_data_atualizacao ON produtos(data_atualizacao);

    -- Tabela de metadados do backup
    CREATE TABLE IF NOT EXISTS backup_metadata (
      chave TEXT PRIMARY KEY,
      valor TEXT,
      data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Full-text search para busca rápida
    CREATE VIRTUAL TABLE IF NOT EXISTS produtos_fts USING fts5(
      codigo_interno,
      codigo_barras,
      descricao,
      descricao_resumida,
      content=produtos,
      content_rowid=rowid
    );

    -- Triggers para manter FTS sincronizado
    CREATE TRIGGER IF NOT EXISTS produtos_ai AFTER INSERT ON produtos BEGIN
      INSERT INTO produtos_fts(rowid, codigo_interno, codigo_barras, descricao, descricao_resumida)
      VALUES (new.rowid, new.codigo_interno, new.codigo_barras, new.descricao, new.descricao_resumida);
    END;

    CREATE TRIGGER IF NOT EXISTS produtos_ad AFTER DELETE ON produtos BEGIN
      DELETE FROM produtos_fts WHERE rowid = old.rowid;
    END;

    CREATE TRIGGER IF NOT EXISTS produtos_au AFTER UPDATE ON produtos BEGIN
      UPDATE produtos_fts SET 
        codigo_interno = new.codigo_interno,
        codigo_barras = new.codigo_barras,
        descricao = new.descricao,
        descricao_resumida = new.descricao_resumida
      WHERE rowid = new.rowid;
    END;
  `);

  console.log(`✅ Cache SQLite inicializado: ${dbPath}`);

  return dbInstance;
}

module.exports = getCacheDatabase();
