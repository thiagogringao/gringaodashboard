# Script para reiniciar o backend corretamente
# Uso: .\scripts\restartBackend.ps1 [-AutoStart]

param(
    [switch]$AutoStart
)

Write-Host "`n=== Reiniciando Backend ===`n" -ForegroundColor Cyan

# 1. Finalizar TODOS os processos Node.js
Write-Host "Finalizando todos os processos Node.js..." -ForegroundColor Yellow
try {
    $nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
        Write-Host "  OK $($nodeProcesses.Count) processo(s) Node.js finalizado(s)" -ForegroundColor Green
        Start-Sleep -Seconds 2
    } else {
        Write-Host "  Nenhum processo Node.js encontrado" -ForegroundColor Gray
    }
} catch {
    Write-Host "  Erro ao finalizar processos: $_" -ForegroundColor Yellow
}

# 2. Verificar se a porta 3001 esta livre
Write-Host "`nVerificando porta 3001..." -ForegroundColor Yellow
$check = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if (-not $check) {
    Write-Host "  OK Porta 3001 esta livre!" -ForegroundColor Green
} else {
    Write-Host "  Porta 3001 ainda esta em uso. Tentando liberar..." -ForegroundColor Yellow
    $processes = $check | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pid in $processes) {
        try {
            Stop-Process -Id $pid -Force
            Write-Host "  OK Processo $pid finalizado" -ForegroundColor Green
        } catch {
            Write-Host "  Erro ao finalizar processo $pid" -ForegroundColor Red
        }
    }
    Start-Sleep -Seconds 2
}

# 3. Reiniciar o backend automaticamente (se solicitado)
if ($AutoStart) {
    Write-Host "`nIniciando servidor backend..." -ForegroundColor Cyan
    Set-Location $PSScriptRoot\..
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start"
    Write-Host "  OK Servidor iniciado em nova janela!" -ForegroundColor Green
} else {
    Write-Host "`nProximos passos:" -ForegroundColor Cyan
    Write-Host "  1. Execute: npm start" -ForegroundColor White
    Write-Host "  2. Ou use: .\scripts\restartBackend.ps1 -AutoStart" -ForegroundColor White
}

Write-Host "`nScript concluido!`n" -ForegroundColor Green
