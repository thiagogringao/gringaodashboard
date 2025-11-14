# Script de Deploy do Windows para VPS
# Uso: .\deploy-from-windows.ps1

param(
    [switch]$SetupOnly,
    [switch]$TransferOnly,
    [switch]$Full,
    [switch]$TestSetup
)

$VPS_IP = "72.60.250.20"
$VPS_USER = "root"
$VPS_PASSWORD = "Admingringao1211."
$LOCAL_PATH = "C:\Users\thiag\Desktop\dashboardPRODUTOS"
$REMOTE_PATH = "/var/www/dashboard"

Write-Host "`n=== Deploy Dashboard para VPS ===" -ForegroundColor Cyan
Write-Host "VPS: $VPS_IP" -ForegroundColor Gray
Write-Host ""

# Verificando se plink e pscp estão disponíveis
if (-not (Get-Command plink -ErrorAction SilentlyContinue) -or -not (Get-Command pscp -ErrorAction SilentlyContinue)) {
    Write-Host "ERRO: plink ou pscp não encontrados. Instale o PuTTY e adicione ao PATH do sistema." -ForegroundColor Red
    return
}

# Função para executar comando SSH
function Invoke-SSHCommand {
    param($Command)
    
    Write-Host "Executando: $Command" -ForegroundColor Gray
    try {
        ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 -i "$HOME\.ssh\id_rsa" ${VPS_USER}@${VPS_IP} $Command
    } catch {
        Write-Host "ERRO ao executar comando SSH: $_" -ForegroundColor Red
    }
}

# Teste do Setup
if ($TestSetup) {
    Write-Host "`n--- MODO DE TESTE: SETUP DA VPS ---" -ForegroundColor Magenta
    Write-Host "`nTransferindo script de setup..."
    try {
        scp -o StrictHostKeyChecking=no -o ConnectTimeout=10 -i "$HOME\.ssh\id_rsa" "$PSScriptRoot\setup-vps.sh" ${VPS_USER}@${VPS_IP}:/root/setup-vps.sh
    } catch {
        Write-Host "ERRO ao transferir script de setup: $_" -ForegroundColor Red
    }
    
    Write-Host "`nExecutando setup na VPS..."
    Invoke-SSHCommand "chmod +x /root/setup-vps.sh && /root/setup-vps.sh > /root/setup-log.txt 2>&1"
    
    Write-Host "`n--- TESTE CONCLUÍDO ---" -ForegroundColor Magenta
    return
}

# 1. Setup inicial da VPS
if ($SetupOnly -or $Full) {
    Write-Host "`n1. Setup Inicial da VPS" -ForegroundColor Yellow
    Write-Host "========================" -ForegroundColor Yellow
    
    Write-Host "`nTransferindo script de setup..."
    try {
        & "C:\Program Files\PuTTY\pscp.exe" -pw $VPS_PASSWORD deploy-scripts/setup-vps.sh ${VPS_USER}@${VPS_IP}:/root/
    } catch {
        Write-Host "ERRO ao transferir script de setup: $_" -ForegroundColor Red
    }
    
    Write-Host "`nExecutando setup na VPS..."
    Invoke-SSHCommand "chmod +x /root/setup-vps.sh && /root/setup-vps.sh"
    
    Write-Host "`nOK Setup concluído!" -ForegroundColor Green
}

# 2. Build do Frontend
if ($TransferOnly -or $Full) {
    Write-Host "`n2. Build do Frontend" -ForegroundColor Yellow
    Write-Host "====================" -ForegroundColor Yellow
    
    $buildPath = "$LOCAL_PATH\frontend\build"
    
    if (-not (Test-Path $buildPath)) {
        Write-Host "`nFazendo build do frontend..."
        Push-Location "$LOCAL_PATH\frontend"
        npm run build
        Pop-Location
    } else {
        Write-Host "`nBuild já existe. Use 'npm run build' para rebuildar se necessário."
    }
}

# 3. Transferir arquivos
if ($TransferOnly -or $Full) {
    Write-Host "`n3. Transferindo Arquivos" -ForegroundColor Yellow
    Write-Host "========================" -ForegroundColor Yellow
    
    # Backend
    Write-Host "`nTransferindo backend..."
    try {
        scp -r -o StrictHostKeyChecking=no -o ConnectTimeout=10 -i "C:\Users\thiag\.ssh\id_rsa" --exclude='node_modules' "$LOCAL_PATH\backend" ${VPS_USER}@${VPS_IP}:$REMOTE_PATH/
    } catch {
        Write-Host "ERRO ao transferir backend: $_" -ForegroundColor Red
    }
    
    # Frontend (dist)
    Write-Host "`nTransferindo frontend (dist)..."
    try {
        Invoke-SSHCommand "mkdir -p $REMOTE_PATH/frontend/dist"
        scp -r -o StrictHostKeyChecking=no -o ConnectTimeout=10 -i "C:\Users\thiag\.ssh\id_rsa" "$LOCAL_PATH\frontend\dist\*" ${VPS_USER}@${VPS_IP}:$REMOTE_PATH/frontend/dist/
    } catch {
        Write-Host "ERRO ao transferir frontend: $_" -ForegroundColor Red
    }
    
    # Scripts de deploy
    Write-Host "`nTransferindo scripts de deploy..."
    try {
        scp -o StrictHostKeyChecking=no -o ConnectTimeout=10 -i "C:\Users\thiag\.ssh\id_rsa" deploy-scripts/deploy.sh ${VPS_USER}@${VPS_IP}:$REMOTE_PATH/
    } catch {
        Write-Host "ERRO ao transferir scripts de deploy: $_" -ForegroundColor Red
    }
    
    Write-Host "`nOK Arquivos transferidos!" -ForegroundColor Green
}

# 4. Configurar e iniciar aplicação
if ($Full) {
    Write-Host "`n4. Configurando Aplicação" -ForegroundColor Yellow
    Write-Host "=========================" -ForegroundColor Yellow
    
    # Transferir .env.production e renomear para .env
    Write-Host "`nTransferindo e configurando .env..."
    try {
        scp -o StrictHostKeyChecking=no -o ConnectTimeout=10 -i "C:\Users\thiag\.ssh\id_rsa" "$LOCAL_PATH\backend\.env.production" ${VPS_USER}@${VPS_IP}:$REMOTE_PATH/backend/
        Invoke-SSHCommand "mv $REMOTE_PATH/backend/.env.production $REMOTE_PATH/backend/.env"
    } catch {
        Write-Host "ERRO ao configurar .env: $_" -ForegroundColor Red
    }
    
    # Transferir ecosystem.config.js
    Write-Host "`nTransferindo ecosystem.config.js..."
    try {
        scp -o StrictHostKeyChecking=no -o ConnectTimeout=10 -i "C:\Users\thiag\.ssh\id_rsa" "$LOCAL_PATH\backend\ecosystem.config.js" ${VPS_USER}@${VPS_IP}:$REMOTE_PATH/backend/
    } catch {
        Write-Host "ERRO ao transferir ecosystem.config.js: $_" -ForegroundColor Red
    }
    
    Write-Host "`nInstalando dependências..."
    Invoke-SSHCommand "cd $REMOTE_PATH/backend && npm install --production"
    
    # Configurar Nginx
    Write-Host "`nConfigurando Nginx..."
    try {
        scp -o StrictHostKeyChecking=no -o ConnectTimeout=10 -i "C:\Users\thiag\.ssh\id_rsa" "$LOCAL_PATH\deploy-scripts\nginx.conf" ${VPS_USER}@${VPS_IP}:/etc/nginx/sites-available/dashboard
        Invoke-SSHCommand "ln -sf /etc/nginx/sites-available/dashboard /etc/nginx/sites-enabled/default && nginx -t && systemctl restart nginx"
    } catch {
        Write-Host "ERRO ao configurar Nginx: $_" -ForegroundColor Red
    }
    
    Write-Host "`nVerificando status..."
    Invoke-SSHCommand "pm2 status"
    
    Write-Host "`nOK Aplicação iniciada!" -ForegroundColor Green
}

# Resumo final
Write-Host "`n=== Deploy Concluído ===" -ForegroundColor Green
Write-Host ""
Write-Host "URL da aplicação: http://$VPS_IP" -ForegroundColor Cyan
Write-Host ""
Write-Host "Credenciais admin:" -ForegroundColor Yellow
Write-Host "  Email: admin@dashboard.com"
Write-Host "  Senha: admin123"
Write-Host ""
Write-Host "Comandos úteis na VPS:" -ForegroundColor Yellow
Write-Host "  pm2 status              - Ver status"
Write-Host "  pm2 logs                - Ver logs"
Write-Host "  pm2 restart all         - Reiniciar"
Write-Host "  $REMOTE_PATH/status.sh  - Status completo"
Write-Host "  $REMOTE_PATH/logs.sh    - Ver logs"
Write-Host ""
Write-Host "IMPORTANTE:" -ForegroundColor Red
Write-Host "  1. Configure o arquivo .env com as credenciais corretas do MySQL"
Write-Host "  2. Execute: ssh $VPS_USER@$VPS_IP"
Write-Host "  3. Edite: nano $REMOTE_PATH/backend/.env"
Write-Host "  4. Reinicie: pm2 restart dashboard-backend"
Write-Host ""

# Perguntar se quer abrir o navegador
$openBrowser = Read-Host "Deseja abrir o navegador? (S/N)"
if ($openBrowser -eq "S" -or $openBrowser -eq "s") {
    Start-Process "http://$VPS_IP"
}

