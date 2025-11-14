@echo off
echo ========================================
echo  EXECUTAR BACKUP COMPLETO
echo ========================================
echo.
echo Este script vai executar o backup completo
echo para calcular o estoque_ideal_sugerido
echo.
echo IMPORTANTE: O backend deve estar rodando!
echo.
pause

echo.
echo Executando backup completo...
echo Isso pode demorar 2-5 minutos dependendo da quantidade de produtos...
echo.

curl -X POST http://localhost:3001/api/backup/full -H "Content-Type: application/json"

echo.
echo.
echo ========================================
echo  BACKUP CONCLUIDO!
echo ========================================
echo.
echo Agora acesse: http://localhost:3000/sugestao-compras
echo.
pause
