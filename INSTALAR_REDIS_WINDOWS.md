# 🚀 Instalação do Redis no Windows

## Opção 1: Docker (Recomendado - Mais Fácil)

### Passo 1: Iniciar Docker Desktop

1. Abra o **Docker Desktop** no Windows
2. Aguarde até aparecer "Docker Desktop is running" na bandeja do sistema

### Passo 2: Executar Redis

Abra o PowerShell ou CMD e execute:

```powershell
docker run -d -p 6379:6379 --name redis-cache redis:latest
```

### Passo 3: Verificar se está rodando

```powershell
docker ps
```

Deve aparecer um container chamado `redis-cache` rodando.

### Passo 4: Testar conexão

```powershell
docker exec redis-cache redis-cli ping
```

Deve retornar: `PONG`

---

## Opção 2: Instalação Nativa no Windows

### Passo 1: Baixar Redis para Windows

1. Acesse: https://github.com/microsoftarchive/redis/releases
2. Baixe a versão mais recente (ex: `Redis-x64-3.0.504.zip`)
3. Extraia o arquivo ZIP

### Passo 2: Executar Redis

1. Abra o PowerShell como Administrador
2. Navegue até a pasta extraída
3. Execute:

```powershell
.\redis-server.exe
```

### Passo 3: Testar (em outro terminal)

```powershell
.\redis-cli.exe ping
```

Deve retornar: `PONG`

### Passo 4: Adicionar ao PATH (Opcional)

Para usar `redis-server` e `redis-cli` de qualquer lugar:

1. Adicione a pasta do Redis ao PATH do Windows
2. Ou crie atalhos no desktop

---

## Opção 3: WSL2 (Windows Subsystem for Linux)

Se você tem WSL2 instalado:

```bash
# No terminal WSL
sudo apt-get update
sudo apt-get install redis-server
sudo service redis-server start

# Testar
redis-cli ping
```

---

## ✅ Verificação Final

Após instalar, teste a conexão:

```powershell
# Se usando Docker
docker exec redis-cache redis-cli ping

# Se usando instalação nativa
redis-cli ping
```

Deve retornar: `PONG`

---

## 🔄 Iniciar Redis Automaticamente

### Docker

O Docker Desktop pode iniciar automaticamente se configurado nas opções.

### Instalação Nativa

Crie um arquivo `.bat` para iniciar automaticamente:

```batch
@echo off
cd C:\caminho\para\redis
start redis-server.exe
```

Adicione ao iniciar do Windows.

---

## 🐛 Troubleshooting

### Docker não conecta

- Verifique se Docker Desktop está rodando
- Reinicie o Docker Desktop
- Verifique se a porta 6379 está livre: `netstat -ano | findstr :6379`

### Redis nativo não inicia

- Verifique se a porta 6379 está livre
- Execute como Administrador
- Verifique logs de erro

### Porta já em uso

```powershell
# Encontrar processo usando porta 6379
netstat -ano | findstr :6379

# Finalizar processo (substitua PID)
taskkill /F /PID <PID>
```

---

## 📝 Próximos Passos

Após instalar Redis:

1. Reinicie o backend: `npm run dev`
2. Verifique logs: Deve aparecer "Redis: Cliente pronto para uso"
3. Faça uma requisição e veja logs de cache

---

**Recomendação**: Use Docker (Opção 1) - é mais fácil e não polui o sistema.

