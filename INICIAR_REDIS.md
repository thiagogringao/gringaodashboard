# 🚀 Como Iniciar o Redis

## ⚠️ Docker Desktop não está rodando

Para usar Redis via Docker, você precisa iniciar o Docker Desktop primeiro.

---

## 📋 Passos para Iniciar Redis

### Passo 1: Iniciar Docker Desktop

1. **Abra o Docker Desktop**:
   - Procure por "Docker Desktop" no menu Iniciar do Windows
   - Ou clique no ícone do Docker na bandeja do sistema (se estiver instalado)

2. **Aguarde o Docker iniciar**:
   - Você verá uma notificação: "Docker Desktop is starting..."
   - Aguarde até aparecer: "Docker Desktop is running"
   - Isso pode levar 1-2 minutos

3. **Verifique se está rodando**:
   - O ícone da baleia do Docker na bandeja do sistema deve estar verde
   - Ou execute: `docker ps` (deve funcionar sem erro)

### Passo 2: Executar o Script

Após o Docker Desktop estar rodando, execute:

```powershell
cd backend
.\scripts\startRedis.ps1
```

### Passo 3: Verificar

O script deve mostrar:
```
✅ Redis está funcionando corretamente!
Redis rodando na porta 6379
```

---

## 🔄 Alternativa: Comando Manual

Se preferir executar manualmente:

```powershell
# Criar e iniciar container Redis
docker run -d -p 6379:6379 --name redis-cache redis:latest

# Verificar se está rodando
docker ps

# Testar conexão
docker exec redis-cache redis-cli ping
```

Deve retornar: `PONG`

---

## ✅ Após Redis estar rodando

1. **Reinicie o backend** (se estiver rodando):
   ```bash
   cd backend
   npm run dev
   ```

2. **Verifique os logs**:
   - Deve aparecer: "Redis: Cliente pronto para uso"
   - Se aparecer, o cache está ativo!

3. **Teste o cache**:
   - Faça uma requisição: `GET /api/produtos/ecommerce`
   - Primeira vez: `Cache MISS` (query no banco)
   - Segunda vez: `Cache HIT` (retorna do cache - muito mais rápido!)

---

## 🐛 Se Docker Desktop não estiver instalado

### Opção 1: Instalar Docker Desktop

1. Baixe: https://www.docker.com/products/docker-desktop
2. Instale e reinicie o computador
3. Siga os passos acima

### Opção 2: Usar Redis Nativo

Veja o arquivo `INSTALAR_REDIS_WINDOWS.md` para instalação nativa do Redis no Windows.

---

## 📝 Nota Importante

**A aplicação funciona sem Redis!**

- Se Redis não estiver disponível, a aplicação continua funcionando normalmente
- Apenas não terá cache (será um pouco mais lenta)
- Você pode instalar Redis depois se quiser

---

**Próximo passo**: Inicie o Docker Desktop e execute o script novamente! 🐳

