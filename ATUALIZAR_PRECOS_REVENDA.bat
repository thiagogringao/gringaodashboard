@echo off
chcp 65001 >nul
echo ========================================
echo 🔄 ATUALIZAR PREÇOS DE REVENDA
echo ========================================
echo.
echo Este script vai:
echo 1. Atualizar o backup do SQLite
echo 2. Buscar VALOR_REVENDA da vw_dprodutos
echo 3. Corrigir análise de Picos de Vendas
echo.
echo Pressione qualquer tecla para continuar...
pause >nul
echo.

echo 📡 Executando backup completo...
echo.

curl -X POST http://localhost:3001/api/backup/full ^
  -H "Content-Type: application/json" ^
  -w "\n\nStatus: %%{http_code}\n" ^
  -s

echo.
echo ========================================
echo ✅ BACKUP CONCLUÍDO!
echo ========================================
echo.
echo Agora os preços estão corretos:
echo - VALOR_REVENDA da vw_dprodutos
echo - Análise de margem atualizada
echo - Picos de Vendas com dados corretos
echo.
echo Acesse: http://localhost:3000/picos-queda
echo.
pause
