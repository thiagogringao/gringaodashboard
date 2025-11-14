# Deploy Automático para VPS
$ErrorActionPreference = "Continue"

$VPS_IP = "72.60.250.20"
$VPS_USER = "root"
$VPS_PASSWORD = "Admingringao1211."
$LOCAL_PATH = "C:\Users\thiag\Desktop\dashboardPRODUTOS"

Write-Host "`n=== Deploy Dashboard para VPS ===" -ForegroundColor Cyan
Write-Host "VPS: $VPS_IP" -ForegroundColor Yellow
Write-Host ""

# Função para executar comando SSH usando plink
function Invoke-SSH {
    param($Command)
    
    $plink = "plink"
    if (-not (Get-Command plink -ErrorAction SilentlyContinue)) {
        Write-Host "ERRO: plink não encontrado. Instalando PuTTY..." -ForegroundColor Red
        Write-Host "Baixe PuTTY de: https://www.putty.org/" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Ou use este comando manualmente via SSH:" -ForegroundColor Yellow
        Write-Host $Command -ForegroundColor White
        return $false
    }
    
    Write-Host "Executando: $Command" -ForegroundColor Gray
    echo y | & $plink -ssh "$VPS_USER@$VPS_IP" -pw "$VPS_PASSWORD" $Command
    return $true
}

# 1. Testar conexão
Write-Host "1. Testando conexão com VPS..." -ForegroundColor Yellow
$testCmd = "echo 'Conexão OK'"
$connected = Invoke-SSH $testCmd

if (-not $connected) {
    Write-Host "`nUsando SSH nativo do Windows..." -ForegroundColor Yellow
    
    # Criar arquivo temporário com senha
    $sshPassPath = "$env:TEMP\sshpass.txt"
    $VPS_PASSWORD | Out-File -FilePath $sshPassPath -Encoding ASCII
    
    Write-Host "`nPara conectar manualmente, use:" -ForegroundColor Cyan
    Write-Host "ssh $VPS_USER@$VPS_IP" -ForegroundColor White
    Write-Host "Senha: $VPS_PASSWORD" -ForegroundColor White
    Write-Host ""
    
    # Continuar com comandos manuais
    $useManual = Read-Host "Deseja ver os comandos para executar manualmente? (S/N)"
    if ($useManual -eq "S" -or $useManual -eq "s") {
        Get-Content "COMANDOS_DEPLOY.txt"
        exit
    }
}

Write-Host "OK Conexão estabelecida!" -ForegroundColor Green
Write-Host ""

# 2. Setup inicial
Write-Host "2. Executando setup inicial da VPS..." -ForegroundColor Yellow

$setupCommands = @"
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
npm install -g pm2
apt install -y nginx
apt install -y git
mkdir -p /var/www/dashboard/{backend,frontend,logs}
mkdir -p /var/www/dashboard/backend/cache
mkdir -p /var/backups/dashboard
pm2 startup systemd -u root --hp /root
apt install -y ufw
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
"@

# Executar cada comando
$setupCommands -split "`n" | ForEach-Object {
    $cmd = $_.Trim()
    if ($cmd) {
        Write-Host "  -> $cmd" -ForegroundColor Gray
        Invoke-SSH $cmd
    }
}

Write-Host "OK Setup concluído!" -ForegroundColor Green
Write-Host ""

# 3. Configurar Nginx
Write-Host "3. Configurando Nginx..." -ForegroundColor Yellow

$nginxConfig = @'
cat > /etc/nginx/sites-available/dashboard << 'NGINX_EOF'
server {
    listen 80;
    server_name 72.60.250.20;
    access_log /var/log/nginx/dashboard-access.log;
    error_log /var/log/nginx/dashboard-error.log;
    location / {
        root /var/www/dashboard/frontend/build;
        try_files \$uri \$uri/ /index.html;
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    location /api/ {
        proxy_pass http://localhost:3001;
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
NGINX_EOF
'@

Invoke-SSH $nginxConfig
Invoke-SSH "ln -sf /etc/nginx/sites-available/dashboard /etc/nginx/sites-enabled/"
Invoke-SSH "rm -f /etc/nginx/sites-enabled/default"
Invoke-SSH "nginx -t"
Invoke-SSH "systemctl restart nginx"
Invoke-SSH "systemctl enable nginx"

Write-Host "OK Nginx configurado!" -ForegroundColor Green
Write-Host ""

Write-Host "4. Transferindo arquivos..." -ForegroundColor Yellow
Write-Host "   Isso pode levar alguns minutos..." -ForegroundColor Gray
Write-Host ""

# Usar SCP para transferir arquivos
Write-Host "   Transferindo backend..." -ForegroundColor Gray
& scp -r "$LOCAL_PATH\backend" "${VPS_USER}@${VPS_IP}:/var/www/dashboard/" 2>&1 | Out-Null

Write-Host "   Transferindo frontend..." -ForegroundColor Gray
& scp -r "$LOCAL_PATH\frontend\dist" "${VPS_USER}@${VPS_IP}:/var/www/dashboard/frontend/build" 2>&1 | Out-Null

Write-Host "OK Arquivos transferidos!" -ForegroundColor Green
Write-Host ""

# 5. Configurar backend
Write-Host "5. Configurando backend..." -ForegroundColor Yellow

$envContent = @"
cat > /var/www/dashboard/backend/.env << 'ENV_EOF'
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
ENV_EOF
"@

Invoke-SSH $envContent
Invoke-SSH "chmod 600 /var/www/dashboard/backend/.env"

$ecosystemConfig = @"
cat > /var/www/dashboard/backend/ecosystem.config.js << 'ECO_EOF'
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
ECO_EOF
"@

Invoke-SSH $ecosystemConfig

Write-Host "OK Backend configurado!" -ForegroundColor Green
Write-Host ""

# 6. Instalar dependências
Write-Host "6. Instalando dependências..." -ForegroundColor Yellow
Invoke-SSH "cd /var/www/dashboard/backend && npm install --production"

Write-Host "OK Dependências instaladas!" -ForegroundColor Green
Write-Host ""

# 7. Executar backups
Write-Host "7. Executando backups iniciais..." -ForegroundColor Yellow
Write-Host "   Isso pode levar alguns minutos..." -ForegroundColor Gray
Invoke-SSH "cd /var/www/dashboard/backend && node scripts/backupToSQLite.js"
Invoke-SSH "cd /var/www/dashboard/backend && node scripts/backupEcommerceToSQLite.js"

Write-Host "OK Backups concluídos!" -ForegroundColor Green
Write-Host ""

# 8. Iniciar aplicação
Write-Host "8. Iniciando aplicação..." -ForegroundColor Yellow
Invoke-SSH "cd /var/www/dashboard/backend && pm2 start ecosystem.config.js"
Invoke-SSH "pm2 save"

Write-Host "OK Aplicação iniciada!" -ForegroundColor Green
Write-Host ""

# 9. Verificar status
Write-Host "9. Verificando status..." -ForegroundColor Yellow
Invoke-SSH "pm2 status"

Write-Host ""
Write-Host "=== Deploy Concluído! ===" -ForegroundColor Green
Write-Host ""
Write-Host "URL: http://72.60.250.20" -ForegroundColor Cyan
Write-Host ""
Write-Host "Credenciais admin:" -ForegroundColor Yellow
Write-Host "  Email: admin@dashboard.com"
Write-Host "  Senha: admin123"
Write-Host ""

$openBrowser = Read-Host "Deseja abrir o navegador? (S/N)"
if ($openBrowser -eq "S" -or $openBrowser -eq "s") {
    Start-Process "http://72.60.250.20"
}

