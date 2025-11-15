@echo off
chcp 65001 >nul
echo ========================================
echo  🖼️  ATUALIZANDO IMAGENS E-COMMERCE
echo ========================================
echo.

echo [1/2] 🗑️  Limpando cache do e-commerce...
cd backend
del /f /q cache\ecommerce.db 2>nul
echo ✅ Cache limpo

echo.
echo [2/2] 📦 Executando backup do e-commerce...
node scripts\backupEcommerceToSQLite.js
if errorlevel 1 (
    echo ❌ Erro no backup
    pause
    exit /b 1
)

echo.
echo ========================================
echo  ✅ IMAGENS ATUALIZADAS!
echo ========================================
echo.
echo 🖼️  Agora as imagens do e-commerce devem aparecer!
echo 🔄 Recarregue a página (Ctrl + F5)
echo.
pause
