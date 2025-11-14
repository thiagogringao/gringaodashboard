# Deploy Simples - Usa SSH nativo do Windows
$VPS_IP = "72.60.250.20"
$VPS_USER = "root"
$LOCAL_PATH = "C:\Users\thiag\Desktop\dashboardPRODUTOS"

Write-Host "`n=== Deploy Dashboard - Modo Simples ===" -ForegroundColor Cyan
Write-Host ""

# 1. Criar arquivo de comandos para executar na VPS
$setupScript = @'
#!/bin/bash
echo "=== Setup VPS ==="
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs npm pm2 nginx git ufw
mkdir -p /var/www/dashboard/{backend,frontend/build,logs}
mkdir -p /var/www/dashboard/backend/cache
ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp
ufw --force enable
echo "Setup concluído!"
'@

$setupScript | Out-File -FilePath "setup-vps-temp.sh" -Encoding UTF8

Write-Host "1. Transferindo script de setup..." -ForegroundColor Yellow
scp setup-vps-temp.sh "${VPS_USER}@${VPS_IP}:/root/setup.sh"

Write-Host "2. Executando setup (pode demorar alguns minutos)..." -ForegroundColor Yellow
Write-Host "   Senha: Admingringao1211." -ForegroundColor Gray
ssh "${VPS_USER}@${VPS_IP}" "chmod +x /root/setup.sh && /root/setup.sh"

Write-Host "`n3. Configurando Nginx..." -ForegroundColor Yellow
$nginxConfig | Out-File -FilePath "nginx-config-temp" -Encoding UTF8
scp nginx-config-temp "${VPS_USER}@${VPS_IP}:/etc/nginx/sites-available/dashboard"
ssh "${VPS_USER}@${VPS_IP}" "ln -sf /etc/nginx/sites-available/dashboard /etc/nginx/sites-enabled/ && rm -f /etc/nginx/sites-enabled/default && nginx -t && systemctl restart nginx"

Write-Host "`n4. Transferindo backend..." -ForegroundColor Yellow
scp -r "$LOCAL_PATH\backend" "${VPS_USER}@${VPS_IP}:/var/www/dashboard/"

Write-Host "`n5. Transferindo frontend..." -ForegroundColor Yellow
scp -r "$LOCAL_PATH\frontend\dist\*" "${VPS_USER}@${VPS_IP}:/var/www/dashboard/frontend/build/"

Write-Host "`n6. Configurando aplicação..." -ForegroundColor Yellow
$envConfig = @"
PORT=3001
DB_HOST_LOJA=5.161.115.232
DB_PORT_LOJA=3306
DB_USER_LOJA=app
DB_PASSWORD_LOJA=lnC3bz5Qy93R
DB_NAME_LOJA=loja_fisica
DB_HOST_ECOMMERCE=5.161.115.232
DB_PORT_ECOMMERCE=3306
DB_USER_ECOMMERCE=app
DB_PASSWORD_ECOMMERCE=lnC3bz5Qy93R
DB_NAME_ECOMMERCE=db_gringao
JWT_SECRET=dashboard-producao-gringao-2024-super-secret
CORS_ORIGIN=http://72.60.250.20
NODE_ENV=production
"@

$envConfig | Out-File -FilePath ".env-temp" -Encoding UTF8
scp .env-temp "${VPS_USER}@${VPS_IP}:/var/www/dashboard/backend/.env"

Write-Host "`n7. Instalando dependências e iniciando..." -ForegroundColor Yellow
ssh "${VPS_USER}@${VPS_IP}" @"
cd /var/www/dashboard/backend
npm install --production
node scripts/backupToSQLite.js
node scripts/backupEcommerceToSQLite.js
pm2 start server.js --name dashboard-backend -i 2
pm2 save
pm2 status
"@

# Limpar arquivos temporários
Remove-Item setup-vps-temp.sh -ErrorAction SilentlyContinue
Remove-Item nginx-config-temp -ErrorAction SilentlyContinue
Remove-Item .env-temp -ErrorAction SilentlyContinue

Write-Host "`n=== Deploy Concluído! ===" -ForegroundColor Green
Write-Host "URL: http://72.60.250.20" -ForegroundColor Cyan
Write-Host "Admin: admin@dashboard.com / admin123" -ForegroundColor Yellow

Start-Process "http://72.60.250.20"

