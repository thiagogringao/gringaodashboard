-- Tabela para cache de análise de vendas
-- Esta tabela armazena dados pré-calculados de estoque mínimo, mês pico e vendas
-- Atualizada periodicamente pelo backup service

CREATE TABLE IF NOT EXISTS analise_vendas_cache (
  codigo_produto VARCHAR(20) PRIMARY KEY,
  estoque_minimo INT DEFAULT 0,
  mes_pico VARCHAR(10),
  media_mensal DECIMAL(10,2) DEFAULT 0,
  total_vendas INT DEFAULT 0,
  imagem_base64 TEXT,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_data_atualizacao (data_atualizacao),
  INDEX idx_total_vendas (total_vendas DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comentários da tabela
ALTER TABLE analise_vendas_cache 
  COMMENT = 'Cache de análise de vendas dos últimos 12 meses - atualizado pelo backup service';

