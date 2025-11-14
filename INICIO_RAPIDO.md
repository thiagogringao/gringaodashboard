# ⚡ Início Rápido - Deploy em 5 Minutos

## 🎯 O Que Você Precisa

```
✅ Servidor VPS: 72.60.250.20 (root / Admingringao1211.)
✅ Banco MySQL: 5.161.115.232:3306 (app / lnC3bz5Qy93R)
✅ WinSCP instalado (https://winscp.net/)
✅ PowerShell ou PuTTY
```

---

## 🚀 Deploy em 3 Passos

### **PASSO 1: Preparar Frontend** (2 minutos)

```powershell
# PowerShell no Windows
cd C:\Users\thiag\Desktop\dashboardPRODUTOS\frontend
npm install
npm run build
```

### **PASSO 2: Executar Deploy** (2 minutos)

```powershell
# Voltar para raiz
cd C:\Users\thiag\Desktop\dashboardPRODUTOS

# Executar script
.\deploy-manual.ps1
```

### **PASSO 3: Acessar** (1 minuto)

Abra o navegador: **http://72.60.250.20**

---

## 🎉 Pronto!

Se funcionou, você está no ar! 🚀

---

## 🔧 Se Algo Deu Errado

### Opção A: Deploy Manual com WinSCP

1. **Instalar WinSCP:** https://winscp.net/
2. **Conectar:**
   - Host: 72.60.250.20
   - User: root
   - Password: Admingringao1211.
3. **Transferir arquivos:**
   - Backend: `backend/*` → `/var/www/dashboard/backend/`
   - .env: `backend/.env.production` → `/var/www/dashboard/backend/.env`
   - Frontend: `frontend/dist/*` → `/var/www/dashboard/frontend/`
   - Scripts: `server-scripts/*.sh` → `/var/www/dashboard/`

4. **Conectar via SSH:**
```bash
ssh root@72.60.250.20
```

5. **Executar comandos:**
```bash
# Instalar dependências do servidor
cd /var/www/dashboard
chmod +x install-dependencies.sh
./install-dependencies.sh

# Configurar aplicação
cd backend
npm install --production

# Criar configuração PM2
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

# Iniciar aplicação
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Configurar Nginx
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

ln -sf /etc/nginx/sites-available/dashboard /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

# Configurar firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw --force enable
```

6. **Testar:**
```bash
pm2 status
curl http://localhost:3001/health
```

7. **Acessar:** http://72.60.250.20

---

## 📊 Comandos Úteis

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs dashboard-backend

# Reiniciar
pm2 restart dashboard-backend

# Ver logs do Nginx
tail -f /var/log/nginx/dashboard-error.log
```

---

## 📚 Documentação Completa

Se precisar de mais detalhes, consulte:

1. **[GUIA_VISUAL_DEPLOY.md](./GUIA_VISUAL_DEPLOY.md)** - Passo a passo com detalhes
2. **[DEPLOY_PRODUCAO.md](./DEPLOY_PRODUCAO.md)** - Guia completo
3. **[COMANDOS_RAPIDOS.md](./COMANDOS_RAPIDOS.md)** - Referência de comandos
4. **[TRANSFERIR_ARQUIVOS_WINDOWS.md](./TRANSFERIR_ARQUIVOS_WINDOWS.md)** - Como transferir arquivos

---

## 🆘 Precisa de Ajuda?

### Backend não inicia
```bash
pm2 logs dashboard-backend --lines 100
```

### Frontend não carrega
```bash
nginx -t
tail -f /var/log/nginx/dashboard-error.log
```

### Erro de banco de dados
```bash
mysql -h 5.161.115.232 -P 3306 -u app -p
# Senha: lnC3bz5Qy93R
```

---

## 🎯 Checklist Rápido

- [ ] Frontend buildado (`npm run build`)
- [ ] Arquivos transferidos para o servidor
- [ ] Dependências instaladas no servidor
- [ ] PM2 rodando (`pm2 status`)
- [ ] Nginx configurado e rodando
- [ ] Firewall configurado (portas 22, 80)
- [ ] Aplicação acessível no navegador

---

## 📞 Informações de Acesso

**Aplicação:** http://72.60.250.20  
**SSH:** `ssh root@72.60.250.20`  
**Senha:** Admingringao1211.

**Banco de Dados:**
- Host: 5.161.115.232:3306
- User: app
- Senha: lnC3bz5Qy93R
- Schemas: db_gringao, loja_fisica

---

⚡ **Boa sorte com o deploy!**

Se tudo der certo, você terá sua aplicação no ar em menos de 5 minutos! 🚀
