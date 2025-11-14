# 🚀 Guia de Instalação - Cache Redis e Backup Incremental

## 📦 Pré-requisitos

1. **Node.js** 18+ instalado
2. **Redis** instalado e rodando (ou Docker)
3. **MySQL** acessível (já configurado)

---

## 🔧 Instalação

### Passo 1: Instalar Dependências

```bash
cd backend
npm install
```

Isso instalará:
- `redis` - Cliente Redis para Node.js
- `node-cron` - Agendador de tarefas

### Passo 2: Instalar e Configurar Redis

#### Opção A: Docker (Recomendado)

```bash
docker run -d -p 6379:6379 --name redis-cache redis
```

#### Opção B: Instalação Local

**Windows:**
1. Baixe: https://github.com/microsoftarchive/redis/releases
2. Execute `redis-server.exe`

**Linux:**
```bash
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis
```

**Mac:**
```bash
brew install redis
brew services start redis
```

### Passo 3: Configurar Variáveis de Ambiente

Edite o arquivo `backend/.env` e adicione:

```env
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Backup
RUN_INITIAL_BACKUP=false
ENABLE_BACKUP_SCHEDULER=true
```

### Passo 4: Testar Conexão Redis

```bash
redis-cli ping
```

Deve retornar: `PONG`

---

## 🎯 Uso

### Iniciar Aplicação

```bash
cd backend
npm run dev
```

Você verá:
```
Servidor rodando na porta 3001
Redis: Conectando...
Redis: Cliente pronto para uso
Agendador de backups iniciado:
  - Backup incremental: Diariamente às 3h da manhã
```

### Executar Backup Manual

```bash
# Via script
npm run backup

# Via API
curl -X POST http://localhost:3001/api/backup/run
```

### Verificar Status do Backup

```bash
curl http://localhost:3001/api/backup/status
```

---

## 📊 Como Funciona

### Cache Redis

1. **Primeira requisição**: Query no banco → Salva no Redis
2. **Próximas requisições**: Retorna do Redis (muito mais rápido)
3. **Expiração**: Cache expira após TTL configurado

### Backup Incremental

1. **Agendamento automático**: A cada 30 minutos
2. **Sincronização**: Busca produtos novos/atualizados
3. **Armazenamento**: Salva em JSON local + Redis
4. **Rastreamento**: Mantém última data de sincronização

---

## ✅ Verificação

### Testar Cache

1. Faça uma requisição: `GET /api/produtos/ecommerce?page=1`
2. Verifique logs: Deve aparecer `Cache MISS`
3. Faça a mesma requisição novamente
4. Verifique logs: Deve aparecer `Cache HIT` (muito mais rápido)

### Testar Backup

1. Execute: `npm run backup`
2. Verifique diretório: `backend/backups/`
3. Deve conter arquivos JSON com produtos

---

## 🐛 Troubleshooting

### Redis não conecta

- Verifique se Redis está rodando: `redis-cli ping`
- Verifique porta no `.env`
- A aplicação funciona sem Redis (sem cache)

### Backup não executa

- Verifique `ENABLE_BACKUP_SCHEDULER=true` no `.env`
- Execute backup manual para testar
- Verifique logs do servidor

### Cache não funciona

- Redis deve estar rodando
- Verifique logs para erros
- Cache é opcional - app funciona sem ele

---

## 📈 Performance Esperada

- **Cache HIT**: < 10ms
- **Cache MISS**: 100-500ms (query no banco)
- **Backup incremental**: 1-5 minutos
- **Redução de carga**: Até 80% menos queries

---

## 🔒 Segurança

- Não exponha Redis publicamente
- Use senha em produção
- Proteja diretório `backups/`
- Adicione `backups/` ao `.gitignore` (já feito)

---

Pronto! Seu sistema de cache e backup está configurado! 🎉

