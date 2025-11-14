# 🚀 Deploy Rápido - Dashboard Produtos

## 📋 Informações da VPS

```
IP: 72.60.250.20
Usuário: root
Senha: Admingringao1211.
```

---

## ⚡ Deploy em 5 Passos

### **Passo 1: Build do Frontend (no seu computador)**

```powershell
cd C:\Users\thiag\Desktop\dashboardPRODUTOS\frontend
npm run build
```

### **Passo 2: Conectar na VPS**

```powershell
ssh root@72.60.250.20
# Senha: Admingringao1211.
```

### **Passo 3: Setup Inicial (apenas primeira vez)**

```bash
# Baixar script de setup
curl -o setup-vps.sh https://raw.githubusercontent.com/seu-repo/setup-vps.sh

# Ou criar manualmente
nano setup-vps.sh
# Cole o conteúdo do arquivo deploy-scripts/setup-vps.sh

# Executar setup
chmod +x setup-vps.sh
./setup-vps.sh
```

### **Passo 4: Transferir Arquivos (do seu computador)**

**Opção A: Via SCP (PowerShell)**

```powershell
# Backend
scp -r C:\Users\thiag\Desktop\dashboardPRODUTOS\backend root@72.60.250.20:/var/www/dashboard/

# Frontend (build)
scp -r C:\Users\thiag\Desktop\dashboardPRODUTOS\frontend\build root@72.60.250.20:/var/www/dashboard/frontend/
```

**Opção B: Via Script Automatizado**

```powershell
cd C:\Users\thiag\Desktop\dashboardPRODUTOS
.\deploy-scripts\deploy-from-windows.ps1 -Full
```

### **Passo 5: Configurar e Iniciar (na VPS)**

```bash
# Ir para o diretório
cd /var/www/dashboard/backend

# Instalar dependências
npm install --production

# Criar .env
nano .env
```

**Conteúdo do .env:**

```env
PORT=3001

# MySQL - Loja Física
DB_HOST_LOJA=localhost
DB_USER_LOJA=seu_usuario
DB_PASSWORD_LOJA=sua_senha
DB_NAME_LOJA=seu_banco

# MySQL - E-commerce
DB_HOST_ECOMMERCE=localhost
DB_USER_ECOMMERCE=seu_usuario
DB_PASSWORD_ECOMMERCE=sua_senha
DB_NAME_ECOMMERCE=db_gringao

# JWT
JWT_SECRET=seu-secret-super-seguro-producao-2024

# CORS
CORS_ORIGIN=http://72.60.250.20

# Ambiente
NODE_ENV=production
```

**Criar ecosystem.config.js:**

```bash
nano ecosystem.config.js
```

```javascript
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
    max_memory_restart: '1G'
  }]
};
```

**Iniciar aplicação:**

```bash
# Executar backups iniciais
node scripts/backupToSQLite.js
node scripts/backupEcommerceToSQLite.js

# Iniciar com PM2
pm2 start ecosystem.config.js

# Salvar configuração
pm2 save

# Ver status
pm2 status
```

---

## ✅ Verificar Deploy

### **1. Ver Status**

```bash
pm2 status
systemctl status nginx
```

### **2. Ver Logs**

```bash
# Logs do backend
pm2 logs dashboard-backend

# Logs do Nginx
tail -f /var/log/nginx/dashboard-access.log
tail -f /var/log/nginx/dashboard-error.log
```

### **3. Testar Aplicação**

```bash
# Testar API
curl http://localhost:3001/api/auth/login

# Ou abrir no navegador
http://72.60.250.20
```

---

## 🔄 Atualizar Aplicação

### **Método 1: Manual**

```bash
# Conectar na VPS
ssh root@72.60.250.20

# Parar aplicação
pm2 stop dashboard-backend

# Atualizar arquivos (via SCP do seu computador)
# Ou fazer git pull se usar repositório

# Reinstalar dependências (se necessário)
cd /var/www/dashboard/backend
npm install --production

# Reiniciar
pm2 restart dashboard-backend
```

### **Método 2: Script Automatizado**

```bash
# Na VPS
cd /var/www/dashboard
./deploy.sh
```

---

## 🐛 Troubleshooting

### **Problema: Backend não inicia**

```bash
# Ver logs
pm2 logs dashboard-backend --lines 100

# Testar manualmente
cd /var/www/dashboard/backend
node server.js
```

### **Problema: Erro de conexão MySQL**

```bash
# Verificar .env
cat /var/www/dashboard/backend/.env

# Testar conexão
mysql -h localhost -u seu_usuario -p
```

### **Problema: Frontend não carrega**

```bash
# Verificar Nginx
nginx -t
systemctl status nginx

# Ver logs
tail -f /var/log/nginx/dashboard-error.log

# Verificar arquivos
ls -la /var/www/dashboard/frontend/build
```

### **Problema: Porta 3001 em uso**

```bash
# Ver o que está usando a porta
netstat -tlnp | grep 3001

# Matar processo
kill -9 <PID>

# Ou parar PM2
pm2 stop all
pm2 delete all
```

---

## 📝 Comandos Úteis

### **PM2:**

```bash
pm2 status                    # Ver status
pm2 logs dashboard-backend    # Ver logs
pm2 restart dashboard-backend # Reiniciar
pm2 stop dashboard-backend    # Parar
pm2 start dashboard-backend   # Iniciar
pm2 monit                     # Monitor de recursos
```

### **Nginx:**

```bash
nginx -t                      # Testar configuração
systemctl reload nginx        # Recarregar
systemctl restart nginx       # Reiniciar
systemctl status nginx        # Ver status
```

### **Sistema:**

```bash
df -h                         # Espaço em disco
free -h                       # Memória
htop                          # Monitor de processos
```

---

## 🔒 Configurar SSL (Opcional)

```bash
# Instalar Certbot
apt install -y certbot python3-certbot-nginx

# Obter certificado (substitua pelo seu domínio)
certbot --nginx -d seudominio.com

# Renovação automática já está configurada
```

---

## 📞 Checklist Final

- [ ] VPS acessível via SSH
- [ ] Node.js, PM2, Nginx instalados
- [ ] Arquivos transferidos
- [ ] Arquivo .env configurado
- [ ] Dependências instaladas
- [ ] Backups executados
- [ ] PM2 rodando
- [ ] Nginx configurado
- [ ] Aplicação acessível: http://72.60.250.20
- [ ] Login funcionando
- [ ] Dados carregando

---

## 🎯 Acesso Final

**URL:** http://72.60.250.20

**Credenciais Admin:**
- Email: `admin@dashboard.com`
- Senha: `admin123`

---

## 📱 Contatos de Suporte

Em caso de problemas:

1. Ver logs: `pm2 logs dashboard-backend`
2. Ver status: `pm2 status`
3. Reiniciar: `pm2 restart dashboard-backend`
4. Verificar Nginx: `systemctl status nginx`

---

🚀 **Deploy pronto!**

