/**
 * Banco de dados SQLite local - Backup completo do e-commerce
 * Mesma estrutura da loja física, adaptado para e-commerce
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Singleton para garantir uma única instância do banco
let dbInstance = null;

function getCacheEcommerceDatabase() {
  if (dbInstance) {
    return dbInstance;
  }

  // Criar diretório de cache se não existir
  const cacheDir = path.join(__dirname, '../cache');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  const dbPath = path.join(cacheDir, 'ecommerce.db');
  dbInstance = new Database(dbPath);

  // Otimizações de performance
  dbInstance.pragma('journal_mode = WAL');
  dbInstance.pragma('synchronous = NORMAL');
  dbInstance.pragma('cache_size = 10000'); // Cache de 10MB
  dbInstance.pragma('temp_store = MEMORY');

  // Criar tabela de produtos com análise preditiva
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS produtos (
      codigo TEXT PRIMARY KEY,
      nome TEXT,
      preco REAL DEFAULT 0,
      preco_custo REAL DEFAULT 0,
      estoque INTEGER DEFAULT 0,
      tipo TEXT,
      situacao TEXT,
      formato TEXT,
      imagem_url TEXT,
      
      -- Análise de vendas
      estoque_minimo INTEGER DEFAULT 0,
      mes_pico TEXT,
      media_mensal REAL DEFAULT 0,
      total_vendas INTEGER DEFAULT 0,
      vendas_mensais TEXT,
      
      -- Histórico e análise preditiva
      historico_12_meses TEXT,
      analise_preditiva TEXT,
      mes_pico_numero INTEGER,
      tendencia_percentual REAL,
      previsao_proximo_mes INTEGER,
      risco_ruptura TEXT,
      dias_estoque INTEGER,
      
      data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_total_vendas ON produtos(total_vendas DESC);
    CREATE INDEX IF NOT EXISTS idx_data_atualizacao ON produtos(data_atualizacao);
    CREATE INDEX IF NOT EXISTS idx_nome ON produtos(nome);
    CREATE INDEX IF NOT EXISTS idx_mes_pico ON produtos(mes_pico_numero);
    CREATE INDEX IF NOT EXISTS idx_risco_ruptura ON produtos(risco_ruptura);
    CREATE INDEX IF NOT EXISTS idx_dias_estoque ON produtos(dias_estoque);

    -- Tabela de metadados do backup
    CREATE TABLE IF NOT EXISTS backup_metadata (
      chave TEXT PRIMARY KEY,
      valor TEXT,
      data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Full-text search para busca rápida
    CREATE VIRTUAL TABLE IF NOT EXISTS produtos_fts USING fts5(
      codigo,
      nome,
      content=produtos,
      content_rowid=rowid
    );

    -- Triggers para manter FTS sincronizado
    CREATE TRIGGER IF NOT EXISTS produtos_ai AFTER INSERT ON produtos BEGIN
      INSERT INTO produtos_fts(rowid, codigo, nome)
      VALUES (new.rowid, new.codigo, new.nome);
    END;

    CREATE TRIGGER IF NOT EXISTS produtos_ad AFTER DELETE ON produtos BEGIN
      DELETE FROM produtos_fts WHERE rowid = old.rowid;
    END;

    CREATE TRIGGER IF NOT EXISTS produtos_au AFTER UPDATE ON produtos BEGIN
      UPDATE produtos_fts SET 
        codigo = new.codigo,
        nome = new.nome
      WHERE rowid = new.rowid;
    END;
  `);

  console.log(`✅ Cache SQLite E-commerce inicializado: ${dbPath}`);

  return dbInstance;
}

module.exports = getCacheEcommerceDatabase();

