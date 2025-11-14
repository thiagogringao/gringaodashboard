# 🚀 CONTINUE O DEPLOY - GUIA RÁPIDO

## ✅ O que você precisa fazer:

### **OPÇÃO 1: Usar Script Automatizado (Mais Fácil)**

#### 1. Transferir o script para o servidor

**Via WinSCP:**
- Arquivo: `DEPLOY_COMPLETO.sh`
- Destino: `/root/`

**Via SCP (PowerShell):**
```powershell
scp .\DEPLOY_COMPLETO.sh root@72.60.250.20:/root/
```

#### 2. Conectar no servidor

```powershell
ssh root@72.60.250.20
# Senha: Admingringao1211.
```

#### 3. Executar o script

```bash
chmod +x /root/DEPLOY_COMPLETO.sh
bash /root/DEPLOY_COMPLETO.sh
```

**Pronto!** O script fará tudo automaticamente.

---

### **OPÇÃO 2: Executar Comandos Manualmente**

Conecte no servidor e execute os comandos do arquivo `COMANDOS_SSH.txt` um por um.

#### Comandos Principais:

```bash
# 1. Atualizar sistema e instalar Node.js
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 2. Instalar PM2 e Nginx
npm install -g pm2
apt install -y nginx

# 3. Criar diretórios
mkdir -p /var/www/dashboard/backend/cache
mkdir -p /var/www/dashboard/frontend
mkdir -p /var/www/dashboard/logs

# 4. Instalar dependências do backend
cd /var/www/dashboard/backend
npm install --production

# 5. Criar configuração do PM2
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
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
};
EOF

# 6. Iniciar aplicação
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 7. Configurar Nginx
cat > /etc/nginx/sites-available/dashboard << 'EOF'
server {
    listen 80;
    server_name 72.60.250.20;

    location / {
        root /var/www/dashboard/frontend;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

# 8. Ativar site
ln -sf /etc/nginx/sites-available/dashboard /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

# 9. Configurar firewall
apt install -y ufw
ufw allow 22/tcp
ufw allow 80/tcp
ufw --force enable

# 10. Verificar status
pm2 status
systemctl status nginx
```

---

## 📊 Verificar se está funcionando

```bash
# Ver status do PM2
pm2 status

# Ver logs
pm2 logs dashboard-backend

# Testar backend
curl http://localhost:3001/health

# Ver logs do Nginx
tail -f /var/log/nginx/dashboard-error.log
```

---

## 🌐 Acessar Aplicação

Abra o navegador: **http://72.60.250.20**

---

## 🐛 Se algo der errado

### Backend não inicia:
```bash
pm2 logs dashboard-backend --lines 50
```

### Nginx não funciona:
```bash
nginx -t
systemctl status nginx
tail -f /var/log/nginx/dashboard-error.log
```

### Erro de conexão com banco:
```bash
# Testar conexão MySQL
mysql -h 5.161.115.232 -P 3306 -u app -p
# Senha: lnC3bz5Qy93R
```

---

## 📝 Arquivos Criados

- ✅ `COMANDOS_SSH.txt` - Lista de comandos para copiar e colar
- ✅ `DEPLOY_COMPLETO.sh` - Script automatizado completo
- ✅ `CONTINUE_DEPLOY.md` - Este guia

---

## 🎯 Resumo Rápido

1. **Transferir arquivos** (se ainda não fez):
   - Backend → `/var/www/dashboard/backend/`
   - Frontend → `/var/www/dashboard/frontend/`
   - `.env.production` → `/var/www/dashboard/backend/.env`

2. **Transferir script**:
   - `DEPLOY_COMPLETO.sh` → `/root/`

3. **Executar**:
   ```bash
   ssh root@72.60.250.20
   bash /root/DEPLOY_COMPLETO.sh
   ```

4. **Acessar**:
   - http://72.60.250.20

---

🚀 **Boa sorte com o deploy!**
