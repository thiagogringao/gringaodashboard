# Script de Deploy Manual - PowerShell
# Dashboard Produtos - VPS 72.60.250.20

$VPS_IP = "72.60.250.20"
$VPS_USER = "root"
$VPS_PASSWORD = "Admingringao1211."

Write-Host "🚀 Deploy Manual - Dashboard Produtos" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

# Função para executar comandos via SSH
function Invoke-SSHCommand {
    param($Command)
    plink -ssh -batch -pw $VPS_PASSWORD ${VPS_USER}@${VPS_IP} $Command
}

# Função para copiar arquivos via SCP
function Copy-ToVPS {
    param($Source, $Destination)
    pscp -r -pw $VPS_PASSWORD $Source ${VPS_USER}@${VPS_IP}:$Destination
}

Write-Host "📋 Passo 1: Verificando conexão..." -ForegroundColor Yellow
try {
    Invoke-SSHCommand "echo 'Conexão OK'"
    Write-Host "✅ Conexão estabelecida!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao conectar. Verifique se o PuTTY está instalado." -ForegroundColor Red
    Write-Host "   Instale: https://www.putty.org/" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

Write-Host "📋 Passo 2: Criando diretórios na VPS..." -ForegroundColor Yellow
Invoke-SSHCommand "mkdir -p /var/www/dashboard/logs /var/www/dashboard/backend/cache /var/www/dashboard/frontend"
Write-Host "✅ Diretórios criados" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Passo 3: Transferindo backend..." -ForegroundColor Yellow
Copy-ToVPS ".\backend\*" "/var/www/dashboard/backend/"
Copy-ToVPS ".\backend\.env.production" "/var/www/dashboard/backend/.env"
Write-Host "✅ Backend transferido" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Passo 4: Buildando frontend..." -ForegroundColor Yellow
Set-Location frontend
npm install
npm run build
Write-Host "✅ Frontend buildado" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Passo 5: Transferindo frontend..." -ForegroundColor Yellow
Copy-ToVPS ".\dist\*" "/var/www/dashboard/frontend/"
Set-Location ..
Write-Host "✅ Frontend transferido" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Passo 6: Instalando dependências..." -ForegroundColor Yellow
Invoke-SSHCommand "cd /var/www/dashboard/backend && npm install --production"
Write-Host "✅ Dependências instaladas" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Passo 7: Configurando PM2..." -ForegroundColor Yellow
$pm2Config = @"
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
"@
Set-Content -Path ".\ecosystem.config.js" -Value $pm2Config
Copy-ToVPS ".\ecosystem.config.js" "/var/www/dashboard/backend/"
Remove-Item ".\ecosystem.config.js"
Write-Host "✅ PM2 configurado" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Passo 8: Iniciando aplicação..." -ForegroundColor Yellow
Invoke-SSHCommand "cd /var/www/dashboard/backend && pm2 delete dashboard-backend 2>/dev/null || true"
Invoke-SSHCommand "cd /var/www/dashboard/backend && pm2 start ecosystem.config.js"
Invoke-SSHCommand "pm2 save"
Write-Host "✅ Aplicação iniciada" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Passo 9: Configurando Nginx..." -ForegroundColor Yellow
$nginxConfig = @"
server {
    listen 80;
    server_name 72.60.250.20;

    access_log /var/log/nginx/dashboard-access.log;
    error_log /var/log/nginx/dashboard-error.log;

    location / {
        root /var/www/dashboard/frontend;
        try_files `$uri `$uri/ /index.html;
        
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)`$ {
            expires 1y;
            add_header Cache-Control \"public, immutable\";
        }
    }

    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
        proxy_cache_bypass `$http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
}
"@
Set-Content -Path ".\dashboard-nginx.conf" -Value $nginxConfig
Copy-ToVPS ".\dashboard-nginx.conf" "/etc/nginx/sites-available/dashboard"
Remove-Item ".\dashboard-nginx.conf"

Invoke-SSHCommand "ln -sf /etc/nginx/sites-available/dashboard /etc/nginx/sites-enabled/"
Invoke-SSHCommand "rm -f /etc/nginx/sites-enabled/default"
Invoke-SSHCommand "nginx -t && systemctl reload nginx"
Write-Host "✅ Nginx configurado" -ForegroundColor Green
Write-Host ""

Write-Host "======================================" -ForegroundColor Green
Write-Host "🎉 Deploy concluído com sucesso!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Acesse: http://72.60.250.20" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Status:" -ForegroundColor Yellow
Invoke-SSHCommand "pm2 status"
Write-Host ""
