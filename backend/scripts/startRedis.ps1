# Script PowerShell para iniciar Redis via Docker
# Uso: .\scripts\startRedis.ps1

Write-Host "Verificando Docker..." -ForegroundColor Cyan

# Verificar se Docker está rodando
Write-Host "Verificando se Docker Desktop está rodando..." -ForegroundColor Cyan
try {
    $dockerCheck = docker ps 2>&1
    if ($LASTEXITCODE -ne 0 -or $dockerCheck -match "error during connect") {
        throw "Docker não está acessível"
    }
    Write-Host "✅ Docker está rodando!" -ForegroundColor Green
} catch {
    Write-Host "" -ForegroundColor Red
    Write-Host "❌ ERRO: Docker Desktop não está rodando!" -ForegroundColor Red
    Write-Host "" -ForegroundColor Yellow
    Write-Host "Por favor:" -ForegroundColor Yellow
    Write-Host "1. Abra o Docker Desktop no Windows" -ForegroundColor Yellow
    Write-Host "2. Aguarde até aparecer 'Docker Desktop is running'" -ForegroundColor Yellow
    Write-Host "3. Execute este script novamente" -ForegroundColor Yellow
    Write-Host "" -ForegroundColor Yellow
    Write-Host "OU use Redis nativo (veja INSTALAR_REDIS_WINDOWS.md)" -ForegroundColor Cyan
    Write-Host "" -ForegroundColor Yellow
    exit 1
}

# Verificar se container já existe
$containerExists = docker ps -a --filter "name=redis-cache" --format "{{.Names}}"

if ($containerExists -eq "redis-cache") {
    Write-Host "Container redis-cache já existe. Verificando status..." -ForegroundColor Cyan
    
    $isRunning = docker ps --filter "name=redis-cache" --format "{{.Names}}"
    
    if ($isRunning -eq "redis-cache") {
        Write-Host "Redis já está rodando!" -ForegroundColor Green
    } else {
        Write-Host "Iniciando container existente..." -ForegroundColor Yellow
        docker start redis-cache
        Start-Sleep -Seconds 2
    }
} else {
    Write-Host "Criando e iniciando container Redis..." -ForegroundColor Yellow
    docker run -d -p 6379:6379 --name redis-cache redis:latest
    Start-Sleep -Seconds 3
}

# Testar conexão
Write-Host "Testando conexão Redis..." -ForegroundColor Cyan
$result = docker exec redis-cache redis-cli ping 2>&1

if ($result -eq "PONG") {
    Write-Host "✅ Redis está funcionando corretamente!" -ForegroundColor Green
    Write-Host "Redis rodando na porta 6379" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao conectar ao Redis" -ForegroundColor Red
    Write-Host "Resultado: $result" -ForegroundColor Yellow
    exit 1
}

