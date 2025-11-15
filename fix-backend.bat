@echo off
chcp 65001 >nul
echo ========================================
echo  🔧 CORRIGINDO BACKEND
echo ========================================
echo.

echo [1/5] ⏹️  Parando processos node...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/5] 🗑️  Limpando cache SQLite...
cd backend\cache
del /F /Q *.db *.db-shm *.db-wal >nul 2>&1
cd ..\..
echo ✅ Cache limpo

echo.
echo [3/5] 📦 Executando backup Loja Física...
cd backend
call node scripts\backupFullToSQLite.js
if errorlevel 1 (
    echo ❌ Erro no backup Loja Física
    pause
    exit /b 1
)

echo.
echo [4/5] 🛒 Executando backup E-commerce...
call node scripts\backupEcommerceToSQLite.js
if errorlevel 1 (
    echo ❌ Erro no backup E-commerce
    pause
    exit /b 1
)

echo.
echo [5/5] 🚀 Iniciando backend...
echo.
echo ========================================
echo  ✅ BACKEND CORRIGIDO!
echo ========================================
echo.
echo 🌐 Acesse: http://localhost:3000/login
echo 👤 Email: admin@dashboard.com
echo 🔑 Senha: admin123
echo.
echo Aguarde o backend iniciar...
echo.

npm run dev
