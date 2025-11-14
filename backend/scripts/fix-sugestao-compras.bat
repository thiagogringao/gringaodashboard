@echo off
echo ========================================
echo  CORRIGIR SUGESTAO DE COMPRAS
echo ========================================
echo.
echo Este script vai:
echo 1. Atualizar o schema do SQLite
echo 2. Executar backup completo
echo 3. Popular estoque_ideal_sugerido
echo.
pause

cd /d "%~dp0.."

echo.
echo [1/2] Atualizando schema do SQLite...
node scripts/migrate-sqlite-schema.js

if errorlevel 1 (
    echo.
    echo ERRO ao migrar schema!
    pause
    exit /b 1
)

echo.
echo [2/2] Executando backup completo...
echo Isso pode demorar alguns minutos...
echo.

curl -X POST http://localhost:3001/api/backup/full -H "Content-Type: application/json"

echo.
echo.
echo ========================================
echo  CONCLUIDO!
echo ========================================
echo.
echo Agora acesse: http://localhost:3000/sugestao-compras
echo.
pause
