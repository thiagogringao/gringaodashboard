# 🎯 Guia Visual de Deploy - Passo a Passo

## 📋 Informações Necessárias

```
🖥️  SERVIDOR VPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IP:       72.60.250.20
Usuário:  root
Senha:    Admingringao1211.

🗄️  BANCO DE DADOS MYSQL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Host:     5.161.115.232
Port:     3306
User:     app
Senha:    lnC3bz5Qy93R
Schemas:  db_gringao (e-commerce)
          loja_fisica (loja física)
```

---

## 🚀 OPÇÃO 1: Deploy Automático (Recomendado)

### ✅ Passo 1: Preparar Frontend

```powershell
# Abrir PowerShell no diretório do projeto
cd C:\Users\thiag\Desktop\dashboardPRODUTOS\frontend

# Instalar dependências
npm install

# Fazer build
npm run build

# ✅ Deve criar a pasta 'dist' com os arquivos
```

### ✅ Passo 2: Executar Script de Deploy

```powershell
# Voltar para raiz do projeto
cd C:\Users\thiag\Desktop\dashboardPRODUTOS

# Executar deploy
.\deploy-manual.ps1
```

**O script irá:**
- ✅ Conectar no servidor
- ✅ Criar diretórios
- ✅ Transferir backend
- ✅ Transferir frontend
- ✅ Instalar dependências
- ✅ Configurar PM2
- ✅ Configurar Nginx
- ✅ Iniciar aplicação

### ✅ Passo 3: Verificar Deploy

Abra o navegador e acesse: **http://72.60.250.20**

---

## 🔧 OPÇÃO 2: Deploy Manual Passo a Passo

### 📦 FASE 1: Preparar Servidor

#### ✅ Passo 1.1: Conectar no Servidor

```powershell
# PowerShell
ssh root@72.60.250.20
# Senha: Admingringao1211.
```

#### ✅ Passo 1.2: Instalar Node.js

```bash
# Atualizar sistema
apt update && apt upgrade -y

# Instalar Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verificar
node --version  # Deve mostrar v18.x.x
npm --version
```

#### ✅ Passo 1.3: Instalar PM2

```bash
npm install -g pm2

# Verificar
pm2 --version
```

#### ✅ Passo 1.4: Instalar Nginx

```bash
apt install -y nginx

# Verificar
nginx -v
systemctl status nginx
```

#### ✅ Passo 1.5: Criar Diretórios

```bash
mkdir -p /var/www/dashboard/backend/cache
mkdir -p /var/www/dashboard/frontend
mkdir -p /var/www/dashboard/logs
mkdir -p /var/backups/dashboard

# Verificar
ls -la /var/www/dashboard/
```

---

### 📤 FASE 2: Transferir Arquivos

#### ✅ Passo 2.1: Instalar WinSCP

1. Baixe: https://winscp.net/eng/download.php
2. Instale o programa
3. Abra o WinSCP

#### ✅ Passo 2.2: Conectar no Servidor

```
No WinSCP:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
File protocol:  SFTP
Host name:      72.60.250.20
Port number:    22
User name:      root
Password:       Admingringao1211.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Clique em "Login"
```

#### ✅ Passo 2.3: Transferir Backend

```
LADO ESQUERDO (Seu PC):
C:\Users\thiag\Desktop\dashboardPRODUTOS\backend

LADO DIREITO (Servidor):
/var/www/dashboard/backend

AÇÃO:
1. Selecionar TODOS os arquivos do backend (Ctrl+A)
2. Arrastar para o lado direito
3. Aguardar transferência
```

#### ✅ Passo 2.4: Transferir .env de Produção

```
LADO ESQUERDO (Seu PC):
C:\Users\thiag\Desktop\dashboardPRODUTOS\backend\.env.production

LADO DIREITO (Servidor):
/var/www/dashboard/backend/.env

AÇÃO:
1. Selecionar arquivo .env.production
2. Arrastar para o lado direito
3. RENOMEAR para .env (remover .production)
```

#### ✅ Passo 2.5: Buildar Frontend

```powershell
# No seu PC, abrir PowerShell
cd C:\Users\thiag\Desktop\dashboardPRODUTOS\frontend

# Instalar dependências
npm install

# Fazer build
npm run build

# ✅ Deve criar pasta 'dist'
```

#### ✅ Passo 2.6: Transferir Frontend

```
LADO ESQUERDO (Seu PC):
C:\Users\thiag\Desktop\dashboardPRODUTOS\frontend\dist

LADO DIREITO (Servidor):
/var/www/dashboard/frontend

AÇÃO:
1. Entrar na pasta 'dist'
2. Selecionar TODOS os arquivos (Ctrl+A)
3. Arrastar para o lado direito
```

#### ✅ Passo 2.7: Transferir Scripts

```
LADO ESQUERDO (Seu PC):
C:\Users\thiag\Desktop\dashboardPRODUTOS\server-scripts

LADO DIREITO (Servidor):
/var/www/dashboard

AÇÃO:
1. Selecionar TODOS os arquivos .sh
2. Arrastar para o lado direito
```

---

### ⚙️ FASE 3: Configurar Aplicação

#### ✅ Passo 3.1: Conectar via SSH

```powershell
ssh root@72.60.250.20
# Senha: Admingringao1211.
```

#### ✅ Passo 3.2: Ajustar Permissões

```bash
# Permissões dos scripts
cd /var/www/dashboard
chmod +x *.sh

# Permissões do .env
chmod 600 backend/.env

# Verificar
ls -la
```

#### ✅ Passo 3.3: Instalar Dependências do Backend

```bash
cd /var/www/dashboard/backend

# Instalar
npm install --production

# Verificar
ls -la node_modules/
```

#### ✅ Passo 3.4: Verificar Configurações

```bash
# Ver .env
cat .env

# Deve mostrar:
# PORT=3001
# NODE_ENV=production
# DB_ECOMMERCE_HOST=5.161.115.232
# DB_LOJA_HOST=5.161.115.232
# etc...
```

#### ✅ Passo 3.5: Criar Configuração do PM2

```bash
cd /var/www/dashboard/backend

cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'dashboard-backend',
    script: './server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '../logs/backend-error.log',
    out_file: '../logs/backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false
  }]
};
EOF

# Verificar
cat ecosystem.config.js
```

#### ✅ Passo 3.6: Iniciar Backend com PM2

```bash
# Iniciar
pm2 start ecosystem.config.js

# Salvar configuração
pm2 save

# Configurar para iniciar no boot
pm2 startup
# ⚠️ COPIE E EXECUTE O COMANDO QUE APARECER

# Verificar status
pm2 status

# Ver logs
pm2 logs dashboard-backend --lines 20
```

**Você deve ver:**
```
┌─────┬────────────────────┬─────────┬─────────┬──────────┐
│ id  │ name               │ mode    │ status  │ cpu      │
├─────┼────────────────────┼─────────┼─────────┼──────────┤
│ 0   │ dashboard-backend  │ cluster │ online  │ 0%       │
│ 1   │ dashboard-backend  │ cluster │ online  │ 0%       │
└─────┴────────────────────┴─────────┴─────────┴──────────┘
```

#### ✅ Passo 3.7: Testar Backend

```bash
# Testar health check
curl http://localhost:3001/health

# Deve retornar:
# {"status":"ok","message":"Servidor rodando"}
```

---

### 🌐 FASE 4: Configurar Nginx

#### ✅ Passo 4.1: Criar Configuração do Nginx

```bash
cat > /etc/nginx/sites-available/dashboard << 'EOF'
server {
    listen 80;
    server_name 72.60.250.20;

    access_log /var/log/nginx/dashboard-access.log;
    error_log /var/log/nginx/dashboard-error.log;

    location / {
        root /var/www/dashboard/frontend;
        try_files $uri $uri/ /index.html;
        
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
}
EOF
```

#### ✅ Passo 4.2: Ativar Configuração

```bash
# Criar link simbólico
ln -sf /etc/nginx/sites-available/dashboard /etc/nginx/sites-enabled/

# Remover site padrão
rm -f /etc/nginx/sites-enabled/default

# Testar configuração
nginx -t

# Deve mostrar:
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

#### ✅ Passo 4.3: Reiniciar Nginx

```bash
# Reiniciar
systemctl restart nginx

# Verificar status
systemctl status nginx

# Deve mostrar:
# ● nginx.service - A high performance web server
#    Active: active (running)
```

---

### 🔒 FASE 5: Configurar Firewall

#### ✅ Passo 5.1: Configurar UFW

```bash
# Instalar UFW
apt install -y ufw

# Permitir SSH (IMPORTANTE!)
ufw allow 22/tcp

# Permitir HTTP
ufw allow 80/tcp

# Permitir HTTPS (para futuro)
ufw allow 443/tcp

# Habilitar firewall
ufw --force enable

# Verificar status
ufw status

# Deve mostrar:
# Status: active
# 22/tcp    ALLOW    Anywhere
# 80/tcp    ALLOW    Anywhere
# 443/tcp   ALLOW    Anywhere
```

---

### ✅ FASE 6: Testar Aplicação

#### ✅ Passo 6.1: Verificar Status

```bash
# Status do PM2
pm2 status

# Status do Nginx
systemctl status nginx

# Processos Node
ps aux | grep node
```

#### ✅ Passo 6.2: Testar APIs

```bash
# Health check
curl http://localhost:3001/health

# Testar API de produtos (se existir)
curl http://localhost:3001/api/produtos/estatisticas

# Testar através do Nginx
curl http://localhost/api/produtos/estatisticas
```

#### ✅ Passo 6.3: Ver Logs

```bash
# Logs do backend
pm2 logs dashboard-backend --lines 50

# Logs do Nginx
tail -f /var/log/nginx/dashboard-access.log
tail -f /var/log/nginx/dashboard-error.log
```

#### ✅ Passo 6.4: Acessar no Navegador

Abra o navegador e acesse:

```
http://72.60.250.20
```

**Você deve ver a aplicação funcionando! 🎉**

---

## 📊 Verificação Final

### ✅ Checklist de Sucesso

```
SERVIDOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Node.js instalado (v18+)
✅ PM2 instalado
✅ Nginx instalado
✅ Diretórios criados

ARQUIVOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Backend transferido
✅ .env configurado
✅ Frontend buildado e transferido
✅ Scripts transferidos

CONFIGURAÇÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Dependências instaladas
✅ PM2 configurado e rodando
✅ Nginx configurado e rodando
✅ Firewall configurado

TESTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Backend responde (curl)
✅ Nginx responde
✅ Aplicação acessível no navegador
✅ APIs funcionando
```

---

## 🎯 Comandos Úteis Pós-Deploy

### 📊 Monitoramento

```bash
# Ver status completo
/var/www/dashboard/status.sh

# Ver logs interativo
/var/www/dashboard/logs.sh

# Monitorar recursos
pm2 monit
```

### 🔄 Gerenciamento

```bash
# Reiniciar backend
pm2 restart dashboard-backend

# Reiniciar Nginx
systemctl restart nginx

# Reiniciar tudo
pm2 restart dashboard-backend && systemctl restart nginx
```

### 💾 Backup

```bash
# Fazer backup
/var/www/dashboard/backup.sh

# Ver backups
ls -lh /var/backups/dashboard/
```

### 🔄 Atualização

```bash
# Atualizar aplicação
/var/www/dashboard/update.sh
```

---

## 🐛 Problemas Comuns

### ❌ Backend não inicia

```bash
# Ver logs
pm2 logs dashboard-backend --lines 100

# Verificar porta
netstat -tlnp | grep 3001

# Testar manualmente
cd /var/www/dashboard/backend
node server.js
```

### ❌ Frontend não carrega

```bash
# Verificar Nginx
nginx -t
systemctl status nginx

# Ver logs
tail -f /var/log/nginx/dashboard-error.log

# Verificar arquivos
ls -la /var/www/dashboard/frontend/
```

### ❌ Erro de conexão com banco

```bash
# Testar conexão
mysql -h 5.161.115.232 -P 3306 -u app -p
# Senha: lnC3bz5Qy93R

# Ver logs do backend
pm2 logs dashboard-backend | grep -i mysql
```

---

## 🎉 Deploy Concluído!

**URL da Aplicação:** http://72.60.250.20

**Próximos passos:**
1. ✅ Testar todas as funcionalidades
2. ✅ Configurar backup automático
3. ✅ Configurar SSL/HTTPS
4. ✅ Monitorar logs e performance

---

## 📚 Documentação Adicional

- **[DEPLOY_README.md](./DEPLOY_README.md)** - Guia de início rápido
- **[DEPLOY_PRODUCAO.md](./DEPLOY_PRODUCAO.md)** - Guia completo
- **[COMANDOS_RAPIDOS.md](./COMANDOS_RAPIDOS.md)** - Referência de comandos
- **[TRANSFERIR_ARQUIVOS_WINDOWS.md](./TRANSFERIR_ARQUIVOS_WINDOWS.md)** - Guia de transferência

---

🚀 **Sucesso no deploy!**
