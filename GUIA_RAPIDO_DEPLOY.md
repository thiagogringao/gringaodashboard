# 🚀 GUIA RÁPIDO - DEPLOY EM 3 PASSOS

## 📋 Servidor: 72.61.40.170 | Senha: Admingringao1211.

---

## ⚡ PASSO 1: Transferir Arquivos (5 min)

### Opção A: WinSCP (Mais Fácil)

1. **Baixar WinSCP:** https://winscp.net/
2. **Conectar:**
   - Host: `72.61.40.170`
   - User: `root`
   - Password: `Admingringao1211.`
3. **Transferir:**
   - `backend\*` → `/var/www/dashboard/backend/`
   - `backend\.env.production` → `/var/www/dashboard/backend/.env` ⚠️ Renomear!
   - `frontend\dist\*` → `/var/www/dashboard/frontend/`

### Opção B: PowerShell (SCP)

```powershell
# Criar diretórios
ssh root@72.61.40.170 "mkdir -p /var/www/dashboard/backend /var/www/dashboard/frontend"

# Transferir arquivos
scp -r .\backend\* root@72.61.40.170:/var/www/dashboard/backend/
scp .\backend\.env.production root@72.61.40.170:/var/www/dashboard/backend/.env
scp -r .\frontend\dist\* root@72.61.40.170:/var/www/dashboard/frontend/
```

---

## ⚡ PASSO 2: Conectar no Servidor (1 min)

```powershell
ssh root@72.61.40.170
```
**Senha:** `Admingringao1211.`

---

## ⚡ PASSO 3: Executar Deploy (5 min)

**Cole TODO este bloco no terminal SSH:**

```bash
cat > /root/deploy.sh << 'EOFSCRIPT'
#!/bin/bash
set -e
echo "🚀 INICIANDO DEPLOY"
apt update -qq && apt upgrade -y -qq
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
fi
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
fi
mkdir -p /var/www/dashboard/backend/cache /var/www/dashboard/frontend /var/www/dashboard/logs /var/backups/dashboard
cd /var/www/dashboard/backend
npm install --production --silent
chmod 600 .env
chmod 755 server.js
cat > ecosystem.config.js << 'EOFPM2'
module.exports = {
  apps: [{
    name: 'dashboard-backend',
    script: './server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: { NODE_ENV: 'production', PORT: 3001 },
    error_file: '../logs/backend-error.log',
    out_file: '../logs/backend-out.log',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
};
EOFPM2
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true
cat > /etc/nginx/sites-available/dashboard << 'EOFNGINX'
server {
    listen 80;
    server_name 72.61.40.170;
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
EOFNGINX
ln -sf /etc/nginx/sites-available/dashboard /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx && systemctl enable nginx
apt install -y ufw -qq
ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw --force enable
sleep 3
echo "✅ DEPLOY CONCLUÍDO!"
pm2 status
echo "🌐 Acesse: http://72.61.40.170"
EOFSCRIPT

chmod +x /root/deploy.sh && bash /root/deploy.sh
```

---

## 🎉 PRONTO!

Acesse: **http://72.61.40.170**

---

## 📊 Comandos Úteis

```bash
pm2 status                      # Ver status
pm2 logs dashboard-backend      # Ver logs
pm2 restart dashboard-backend   # Reiniciar
```

---

## 🐛 Se algo der errado

```bash
# Ver logs detalhados
pm2 logs dashboard-backend --lines 100

# Verificar arquivos
ls -la /var/www/dashboard/backend/
ls -la /var/www/dashboard/frontend/

# Testar backend
curl http://localhost:3001/health

# Ver logs do Nginx
tail -f /var/log/nginx/dashboard-error.log
```

---

## ✅ Checklist

- [ ] Arquivos transferidos
- [ ] Script executado
- [ ] PM2 rodando (2 instâncias)
- [ ] Nginx rodando
- [ ] Aplicação acessível

---

🚀 **Boa sorte!**
