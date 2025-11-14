@echo off
chcp 65001 >nul
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║   🔄 ATUALIZAR BANCO COM CAMPO TIPO_PRECO                ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo 📋 Este script irá:
echo    1. Deletar o cache SQLite antigo
echo    2. Reiniciar o backend (cria nova estrutura)
echo    3. Executar backup completo com tipo_preco
echo.
pause
echo.

echo 🗑️  Deletando cache antigo...
cd backend
if exist "cache\loja_fisica.db" (
    del /F /Q "cache\loja_fisica.db"
    echo ✅ Cache deletado!
) else (
    echo ⚠️  Cache não encontrado (já foi deletado?)
)
echo.

echo 🔄 Matando processos Node.js...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo ✅ Processos finalizados!
echo.

echo 🚀 Iniciando backend...
start /B cmd /c "npm start"
echo ⏳ Aguardando backend inicializar (10 segundos)...
timeout /t 10 /nobreak >nul
echo ✅ Backend iniciado!
echo.

echo 📦 Executando backup completo...
echo ⏳ Isso pode levar alguns minutos...
cd ..
curl -X POST http://localhost:3001/api/backup/loja-fisica/completo
echo.
echo.

echo ╔═══════════════════════════════════════════════════════════╗
echo ║   ✅ ATUALIZAÇÃO CONCLUÍDA!                               ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo 🎯 O que foi feito:
echo    ✅ Cache antigo deletado
echo    ✅ Nova estrutura criada com campo tipo_preco
echo    ✅ Backup completo executado
echo.
echo 🚀 Agora você pode testar:
echo    http://localhost:3000/loja-fisica
echo.
echo 💡 Passe o mouse sobre os preços para ver a origem!
echo.
pause
