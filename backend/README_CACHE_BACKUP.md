# Sistema de Cache Redis e Backup Incremental

Este documento descreve o sistema de cache Redis e backup incremental implementado na aplicação.

## 📋 Índice

- [Cache Redis](#cache-redis)
- [Backup Incremental](#backup-incremental)
- [Configuração](#configuração)
- [Uso](#uso)

---

## 🚀 Cache Redis

### Descrição

O sistema de cache Redis melhora significativamente a performance da aplicação armazenando respostas de requisições frequentes em memória.

### Funcionalidades

- **Cache automático**: Todas as rotas GET são automaticamente cacheadas
- **TTL configurável**: Tempo de vida do cache pode ser definido por rota
- **Fallback gracioso**: Se Redis não estiver disponível, a aplicação continua funcionando normalmente
- **Invalidação**: Funções para invalidar cache quando necessário

### Configuração de TTL por Rota

- **Listagem de produtos**: 5 minutos (300 segundos)
- **Detalhes do produto**: 10 minutos (600 segundos)

### Como Funciona

1. Quando uma requisição GET chega, o middleware verifica se há cache
2. Se encontrar (Cache HIT), retorna imediatamente sem consultar o banco
3. Se não encontrar (Cache MISS), executa a query e salva o resultado no cache
4. Próximas requisições idênticas retornam do cache

---

## 💾 Backup Incremental

### Descrição

Sistema de backup incremental que sincroniza dados dos bancos de dados para melhorar performance e reduzir carga nos servidores remotos.

### Funcionalidades

- **Backup incremental**: Apenas produtos novos/atualizados são sincronizados
- **Agendamento automático**: Backups executados automaticamente em intervalos configurados
- **Armazenamento local**: Backups salvos em arquivos JSON
- **Cache no Redis**: Dados também são armazenados no Redis para acesso rápido

### Agendamento

- **Backup incremental**: Diariamente às 3h da manhã

### Estrutura de Arquivos

```
backend/
  backups/
    ecommerce_2025-01-15.json
    loja_fisica_2025-01-15.json
    last_sync.json
```

---

## ⚙️ Configuração

### Variáveis de Ambiente

Adicione ao arquivo `.env`:

```env
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Backup
RUN_INITIAL_BACKUP=false      # Executar backup ao iniciar servidor
ENABLE_BACKUP_SCHEDULER=true  # Habilitar agendamento automático
```

### Instalação do Redis

#### Windows

1. Baixe o Redis para Windows: https://github.com/microsoftarchive/redis/releases
2. Execute `redis-server.exe`
3. Ou use Docker: `docker run -d -p 6379:6379 redis`

#### Linux/Mac

```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# Mac (Homebrew)
brew install redis
brew services start redis
```

### Instalação de Dependências

```bash
cd backend
npm install
```

---

## 📖 Uso

### Cache Redis

O cache é aplicado automaticamente nas rotas. Não é necessário fazer nada além de ter o Redis rodando.

#### Invalidar Cache Manualmente

```javascript
const { invalidateCache } = require('./middleware/cache');

// Invalidar cache de produtos e-commerce
await invalidateCache('cache:/api/produtos/ecommerce*');

// Limpar todo o cache
const { clearAllCache } = require('./middleware/cache');
await clearAllCache();
```

### Backup Incremental

#### Executar Backup Manual

```bash
# Via script
node backend/scripts/runBackup.js

# Via API
curl -X POST http://localhost:3001/api/backup/run
```

#### Verificar Status do Backup

```bash
curl http://localhost:3001/api/backup/status
```

#### Resposta

```json
{
  "success": true,
  "lastSync": {
    "ecommerce": "2025-01-15T10:30:00.000Z",
    "lojaFisica": "2025-01-15T10:30:00.000Z"
  }
}
```

---

## 🔍 Monitoramento

### Logs de Cache

O servidor exibe logs quando há cache HIT ou MISS:

```
Cache HIT: cache:/api/produtos/ecommerce?page=1&limit=20
Cache MISS: cache:/api/produtos/loja-fisica?page=1&limit=20
```

### Logs de Backup

```
Backup incremental e-commerce desde: 2025-01-15T10:00:00.000Z
Backup e-commerce: 150 produtos processados
Backup loja física: 200 produtos processados
```

---

## 🛠️ Troubleshooting

### Redis não está conectando

1. Verifique se o Redis está rodando: `redis-cli ping` (deve retornar `PONG`)
2. Verifique as credenciais no `.env`
3. A aplicação continuará funcionando sem Redis (sem cache)

### Backup não está executando

1. Verifique se `ENABLE_BACKUP_SCHEDULER=true` no `.env`
2. Verifique os logs do servidor para erros
3. Execute backup manual para testar: `node backend/scripts/runBackup.js`

### Cache não está funcionando

1. Verifique se Redis está rodando e acessível
2. Verifique os logs para mensagens de erro
3. O cache é opcional - a aplicação funciona sem ele

---

## 📊 Performance

### Benefícios Esperados

- **Redução de carga no banco**: Até 80% menos queries com cache ativo
- **Tempo de resposta**: Respostas do cache em < 10ms vs 100-500ms do banco
- **Backup incremental**: Reduz tempo de sincronização de horas para minutos

### Métricas

- Cache HIT rate: Monitorado nos logs
- Tempo de backup: Logado em cada execução
- Produtos sincronizados: Exibido após cada backup

---

## 🔐 Segurança

- Redis não deve ser exposto publicamente
- Use senha para Redis em produção (`REDIS_PASSWORD`)
- Backups contêm dados sensíveis - proteger diretório `backups/`
- Adicionar `backups/` ao `.gitignore`

---

## 📝 Próximos Passos

- [ ] Implementar cache de segundo nível (memória local)
- [ ] Adicionar métricas de performance
- [ ] Implementar compressão de backups
- [ ] Adicionar notificações de backup
- [ ] Dashboard de monitoramento

