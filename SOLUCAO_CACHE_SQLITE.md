# 🎯 Solução: Cache SQLite para Análise de Vendas

## 📋 Resumo

Criamos um banco de dados **SQLite local** para armazenar os dados pré-calculados de análise de vendas (estoque mínimo, mês pico, média mensal, etc.), pois não temos permissão para criar tabelas no MySQL da loja física.

## ✅ O que foi implementado

### 1. Banco de Dados SQLite Local
- **Arquivo**: `backend/config/cacheDatabase.js`
- **Localização**: `backend/cache/analise_vendas.db`
- **Tabela**: `analise_vendas_cache`

### 2. Scripts Utilitários

#### Popular Cache
```bash
cd backend
node scripts/populateCache.js
```
Este script lê o arquivo de backup JSON mais recente e popula o cache SQLite.

#### Testar Cache
```bash
cd backend
node scripts/testCache.js
```
Testa inserção e leitura no cache SQLite.

### 3. Integração com Backend

- **backupService**: Salva dados no SQLite durante o backup
- **lojaFisicaController**: Busca dados do SQLite (muito mais rápido que MySQL)

## 🚀 Como Usar

### Passo 1: Executar Backup
```bash
curl -X POST http://localhost:3001/api/backup/run
```

### Passo 2: Popular Cache (se necessário)
```bash
cd backend
node scripts/populateCache.js
```

### Passo 3: Verificar
```bash
# Verificar total de produtos no cache
cd backend
node -e "const db = require('./config/cacheDatabase'); console.log(db.prepare('SELECT COUNT(*) as total FROM analise_vendas_cache').get());"
```

## 📊 Estrutura da Tabela

```sql
CREATE TABLE analise_vendas_cache (
  codigo_produto TEXT PRIMARY KEY,
  estoque_minimo INTEGER DEFAULT 0,
  mes_pico TEXT,
  media_mensal REAL DEFAULT 0,
  total_vendas INTEGER DEFAULT 0,
  imagem_base64 TEXT,
  data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Configuração

O cache SQLite é inicializado automaticamente quando o backend inicia. Não é necessária configuração adicional.

### Performance

- **SQLite**: ~1-5ms por consulta
- **MySQL remoto**: ~20-30 segundos (com timeouts)

## 📝 Notas Importantes

1. **Atualização do Cache**: Execute o backup regularmente para manter os dados atualizados
2. **Tamanho do Arquivo**: O arquivo `.db` cresce conforme mais produtos são adicionados
3. **Backup**: O arquivo SQLite está em `backend/cache/` e deve ser incluído nos backups do sistema

## 🐛 Troubleshooting

### Cache vazio após backup?
Execute manualmente:
```bash
cd backend
node scripts/populateCache.js
```

### Dados não aparecem na API?
1. Verifique se o cache tem dados:
```bash
cd backend
node -e "const db = require('./config/cacheDatabase'); console.log(db.prepare('SELECT COUNT(*) as total FROM analise_vendas_cache').get());"
```

2. Reinicie o backend:
```bash
# Parar processos Node
Get-Process node | Stop-Process -Force

# Iniciar backend
cd backend
npm start
```

### Performance ainda lenta?
O problema pode estar na query inicial do MySQL (busca do produto). O cache SQLite só é consultado APÓS a busca do produto no MySQL.

## 🎯 Próximos Passos

1. **Otimizar query inicial do MySQL** para reduzir o tempo de resposta
2. **Implementar cache de produtos** (não apenas análise de vendas)
3. **Criar job automático** para popular o cache após cada backup
4. **Adicionar índices** no SQLite para queries mais complexas

## 📚 Arquivos Relacionados

- `backend/config/cacheDatabase.js` - Configuração do SQLite
- `backend/services/backupService.js` - Salva dados no cache
- `backend/controllers/lojaFisicaController.js` - Busca dados do cache
- `backend/scripts/populateCache.js` - Popular cache manualmente
- `backend/scripts/testCache.js` - Testar cache

