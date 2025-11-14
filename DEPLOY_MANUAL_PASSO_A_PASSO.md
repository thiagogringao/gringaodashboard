# 🚀 Deploy Manual - Passo a Passo

## Credenciais

**VPS:**
- IP: `72.60.250.20`
- Usuário: `root`
- Senha: `Admingringao1211.`

**MySQL:**
- Host: `5.161.115.232`
- Port: `3306`
- User: `app`
- Senha: `lnC3bz5Qy93R`
- Schemas: `db_gringao` e `loja_fisica`

---

## Passo 1: Conectar na VPS

```powershell
ssh root@72.60.250.20
# Senha: Admingringao1211.
```

---

## Passo 2: Instalar Dependências

```bash
# Atualizar sistema
apt update && apt upgrade -y

# Instalar Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verificar
node --version
npm --version

# Instalar PM2
npm install -g pm2

# Instalar Nginx
apt install -y nginx

# Instalar outras ferramentas
apt install -y git ufw

# Configurar Firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

---

## Passo 3: Criar Estrutura de Diretórios

```bash
mkdir -p /var/www/dashboard/backend
mkdir -p /var/www/dashboard/frontend/build
mkdir -p /var/www/dashboard/logs
mkdir -p /var/www/dashboard/backend/cache
mkdir -p /var/backups/dashboard
```

---

## Passo 4: Configurar Nginx

```bash
cat > /etc/nginx/sites-available/dashboard << 'EOF'
server {
    listen 80;
    server_name 72.60.250.20;

    access_log /var/log/nginx/dashboard-access.log;
    error_log /var/log/nginx/dashboard-error.log;

    location / {
        root /var/www/dashboard/frontend/build;
        try_files $uri $uri/ /index.html;
        
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    location /api/ {
        proxy_pass http://localhost:3001;
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

# Habilitar site
ln -sf /etc/nginx/sites-available/dashboard /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Testar e reiniciar
nginx -t
systemctl restart nginx
systemctl enable nginx
```

---

## Passo 5: Transferir Arquivos (do seu Windows)

**Abra OUTRO terminal PowerShell (não feche o SSH):**

```powershell
# Transferir backend
scp -r C:\Users\thiag\Desktop\dashboardPRODUTOS\backend root@72.60.250.20:/var/www/dashboard/

# Transferir frontend (build)
scp -r C:\Users\thiag\Desktop\dashboardPRODUTOS\frontend\dist root@72.60.250.20:/var/www/dashboard/frontend/build
```

---

## Passo 6: Configurar Backend (na VPS)

```bash
cd /var/www/dashboard/backend

# Criar arquivo .env
cat > .env << 'EOF'
PORT=3001

# MySQL - Loja Física
DB_HOST_LOJA=5.161.115.232
DB_PORT_LOJA=3306
DB_USER_LOJA=app
DB_PASSWORD_LOJA=lnC3bz5Qy93R
DB_NAME_LOJA=loja_fisica

# MySQL - E-commerce
DB_HOST_ECOMMERCE=5.161.115.232
DB_PORT_ECOMMERCE=3306
DB_USER_ECOMMERCE=app
DB_PASSWORD_ECOMMERCE=lnC3bz5Qy93R
DB_NAME_ECOMMERCE=db_gringao

# JWT
JWT_SECRET=dashboard-producao-gringao-2024-super-secret

# CORS
CORS_ORIGIN=http://72.60.250.20

# Ambiente
NODE_ENV=production
EOF

# Proteger .env
chmod 600 .env

# Criar ecosystem.config.js
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
```

---

## Passo 7: Instalar Dependências

```bash
cd /var/www/dashboard/backend
npm install --production
```

---

## Passo 8: Executar Backups Iniciais

```bash
cd /var/www/dashboard/backend

# Backup Loja Física
node scripts/backupToSQLite.js

# Backup E-commerce
node scripts/backupEcommerceToSQLite.js

# Verificar se foram criados
ls -lh cache/
ls -lh auth.db
```

---

## Passo 9: Iniciar Aplicação

```bash
cd /var/www/dashboard/backend

# Iniciar com PM2
pm2 start ecosystem.config.js

# Salvar configuração
pm2 save

# Configurar para iniciar no boot
pm2 startup systemd -u root --hp /root
# Copie e execute o comando que aparecer

# Ver status
pm2 status

# Ver logs
pm2 logs dashboard-backend --lines 50
```

---

## Passo 10: Verificar Deploy

```bash
# Status do PM2
pm2 status

# Status do Nginx
systemctl status nginx

# Testar API
curl http://localhost:3001/api/auth/login

# Ver logs
pm2 logs dashboard-backend --lines 20
tail -f /var/log/nginx/dashboard-access.log
```

---

## Passo 11: Abrir no Navegador

**URL:** `http://72.60.250.20`

**Credenciais Admin:**
- Email: `admin@dashboard.com`
- Senha: `admin123`

---

## Comandos Úteis

```bash
# Ver status
pm2 status
pm2 logs dashboard-backend

# Reiniciar
pm2 restart dashboard-backend

# Parar
pm2 stop dashboard-backend

# Ver logs do Nginx
tail -f /var/log/nginx/dashboard-access.log
tail -f /var/log/nginx/dashboard-error.log

# Ver uso de recursos
htop
df -h
free -h
```

---

## Troubleshooting

### Erro: Backend não inicia

```bash
# Ver logs detalhados
pm2 logs dashboard-backend --lines 100

# Testar manualmente
cd /var/www/dashboard/backend
node server.js
```

### Erro: Conexão com MySQL

```bash
# Testar conexão
mysql -h 5.161.115.232 -P 3306 -u app -p
# Senha: lnC3bz5Qy93R

# Verificar .env
cat /var/www/dashboard/backend/.env
```

### Erro: Frontend não carrega

```bash
# Verificar arquivos
ls -la /var/www/dashboard/frontend/build

# Ver logs do Nginx
tail -f /var/log/nginx/dashboard-error.log

# Testar Nginx
nginx -t
```

---

## Atualizar Aplicação

```bash
# Parar aplicação
pm2 stop dashboard-backend

# Atualizar arquivos (via SCP do Windows)

# Reinstalar dependências (se necessário)
cd /var/www/dashboard/backend
npm install --production

# Executar backups
node scripts/backupToSQLite.js
node scripts/backupEcommerceToSQLite.js

# Reiniciar
pm2 restart dashboard-backend
systemctl reload nginx
```

---

✅ **Deploy Concluído!**

