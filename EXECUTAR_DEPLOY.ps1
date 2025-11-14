# Script de Deploy - Dashboard Produtos
# Servidor: 72.60.250.20

$ErrorActionPreference = "Stop"

Write-Host "🚀 INICIANDO DEPLOY DO DASHBOARD DE PRODUTOS" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

$VPS_IP = "72.60.250.20"
$VPS_USER = "root"
$VPS_PASS = "Admingringao1211."

Write-Host "📋 Informações do Deploy:" -ForegroundColor Cyan
Write-Host "  Servidor: $VPS_IP" -ForegroundColor White
Write-Host "  Usuário: $VPS_USER" -ForegroundColor White
Write-Host "  Frontend: Buildado ✓" -ForegroundColor Green
Write-Host ""

# Verificar se o build do frontend existe
if (-not (Test-Path ".\frontend\dist\index.html")) {
    Write-Host "❌ Build do frontend não encontrado!" -ForegroundColor Red
    Write-Host "   Execute: cd frontend && npm run build" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Build do frontend verificado" -ForegroundColor Green
Write-Host ""

# Criar arquivo de comandos para executar no servidor
$serverCommands = @"
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
        try_files \$uri \$uri/ /index.html;
        
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
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
"@

Set-Content -Path ".\deploy-server-commands.sh" -Value $serverCommands

Write-Host "📝 Instruções para Deploy:" -ForegroundColor Yellow
Write-Host ""
Write-Host "OPÇÃO 1 - Deploy Manual (Recomendado):" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Instale o WinSCP: https://winscp.net/" -ForegroundColor White
Write-Host ""
Write-Host "2. Conecte no servidor:" -ForegroundColor White
Write-Host "   Host: 72.60.250.20" -ForegroundColor Gray
Write-Host "   User: root" -ForegroundColor Gray
Write-Host "   Password: Admingringao1211." -ForegroundColor Gray
Write-Host ""
Write-Host "3. Transfira os arquivos:" -ForegroundColor White
Write-Host "   - backend\* → /var/www/dashboard/backend/" -ForegroundColor Gray
Write-Host "   - backend\.env.production → /var/www/dashboard/backend/.env" -ForegroundColor Gray
Write-Host "   - frontend\dist\* → /var/www/dashboard/frontend/" -ForegroundColor Gray
Write-Host "   - deploy-server-commands.sh → /root/" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Conecte via SSH (PuTTY ou PowerShell):" -ForegroundColor White
Write-Host "   ssh root@72.60.250.20" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Execute no servidor:" -ForegroundColor White
Write-Host "   chmod +x /root/deploy-server-commands.sh" -ForegroundColor Gray
Write-Host "   /root/deploy-server-commands.sh" -ForegroundColor Gray
Write-Host ""
Write-Host "6. Acesse: http://72.60.250.20" -ForegroundColor Green
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "OPÇÃO 2 - Deploy via SCP (Se tiver OpenSSH):" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Execute os comandos abaixo:" -ForegroundColor White
Write-Host ""
Write-Host "# Transferir backend" -ForegroundColor Gray
Write-Host 'scp -r .\backend\* root@72.60.250.20:/var/www/dashboard/backend/' -ForegroundColor Yellow
Write-Host ""
Write-Host "# Transferir .env" -ForegroundColor Gray
Write-Host 'scp .\backend\.env.production root@72.60.250.20:/var/www/dashboard/backend/.env' -ForegroundColor Yellow
Write-Host ""
Write-Host "# Transferir frontend" -ForegroundColor Gray
Write-Host 'scp -r .\frontend\dist\* root@72.60.250.20:/var/www/dashboard/frontend/' -ForegroundColor Yellow
Write-Host ""
Write-Host "# Transferir script" -ForegroundColor Gray
Write-Host 'scp .\deploy-server-commands.sh root@72.60.250.20:/root/' -ForegroundColor Yellow
Write-Host ""
Write-Host "# Conectar e executar" -ForegroundColor Gray
Write-Host 'ssh root@72.60.250.20' -ForegroundColor Yellow
Write-Host 'chmod +x /root/deploy-server-commands.sh' -ForegroundColor Yellow
Write-Host '/root/deploy-server-commands.sh' -ForegroundColor Yellow
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 Documentação completa em:" -ForegroundColor Cyan
Write-Host "   - INICIO_RAPIDO.md" -ForegroundColor White
Write-Host "   - GUIA_VISUAL_DEPLOY.md" -ForegroundColor White
Write-Host "   - TRANSFERIR_ARQUIVOS_WINDOWS.md" -ForegroundColor White
Write-Host ""
Write-Host "✅ Script de comandos criado: deploy-server-commands.sh" -ForegroundColor Green
Write-Host ""
