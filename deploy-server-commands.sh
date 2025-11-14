#!/bin/bash
set -e

echo '🔧 Preparando servidor...'

# Criar diretórios
mkdir -p /var/www/dashboard/backend/cache
mkdir -p /var/www/dashboard/frontend
mkdir -p /var/www/dashboard/logs
mkdir -p /var/backups/dashboard

echo '✅ Diretórios criados'

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo '📦 Instalando Node.js...'
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
fi

# Verificar se PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo '📦 Instalando PM2...'
    npm install -g pm2
fi

# Verificar se Nginx está instalado
if ! command -v nginx &> /dev/null; then
    echo '📦 Instalando Nginx...'
    apt update
    apt install -y nginx
fi

echo '✅ Dependências verificadas'

# Instalar dependências do backend
echo '📦 Instalando dependências do backend...'
cd /var/www/dashboard/backend
npm install --production

echo '✅ Dependências instaladas'

# Ajustar permissões
chmod 600 .env
chmod 755 server.js

# Criar configuração do PM2
cat > ecosystem.config.js << 'EOFPM2'
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
EOFPM2

echo '✅ PM2 configurado'

# Parar PM2 se estiver rodando
pm2 delete dashboard-backend 2>/dev/null || true

# Iniciar aplicação
echo '▶️  Iniciando aplicação...'
pm2 start ecosystem.config.js
pm2 save

# Configurar PM2 para iniciar no boot
pm2 startup systemd -u root --hp /root 2>/dev/null || true

echo '✅ Aplicação iniciada'

# Configurar Nginx
echo '🌐 Configurando Nginx...'
cat > /etc/nginx/sites-available/dashboard << 'EOFNGINX'
server {
    listen 80;
    server_name 72.60.250.20;

    access_log /var/log/nginx/dashboard-access.log;
    error_log /var/log/nginx/dashboard-error.log;

    location / {
        root /var/www/dashboard/frontend;
        try_files \ \/ /index.html;
        
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \System.Management.Automation.Internal.Host.InternalHost;
        proxy_set_header X-Real-IP \;
        proxy_set_header X-Forwarded-For \;
        proxy_set_header X-Forwarded-Proto \;
        proxy_cache_bypass \;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
}
EOFNGINX

# Ativar site
ln -sf /etc/nginx/sites-available/dashboard /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Testar e reiniciar Nginx
nginx -t
systemctl restart nginx
systemctl enable nginx

echo '✅ Nginx configurado'

# Configurar firewall
echo '🔒 Configurando firewall...'
ufw allow 22/tcp 2>/dev/null || true
ufw allow 80/tcp 2>/dev/null || true
ufw allow 443/tcp 2>/dev/null || true
ufw --force enable 2>/dev/null || true

echo '✅ Firewall configurado'

# Verificar status
echo ''
echo '📊 Status da aplicação:'
pm2 status

echo ''
echo '✅ DEPLOY CONCLUÍDO COM SUCESSO!'
echo '🌐 Acesse: http://72.60.250.20'
