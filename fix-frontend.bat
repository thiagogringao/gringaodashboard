@echo off
chcp 65001 >nul
echo ========================================
echo  🔧 CORRIGINDO FRONTEND
echo ========================================
echo.

echo [1/4] 🗑️  Limpando cache e node_modules...
cd frontend
rmdir /s /q node_modules 2>nul
rmdir /s /q .vite 2>nul
rmdir /s /q dist 2>nul
del /f /q package-lock.json 2>nul
echo ✅ Cache limpo

echo.
echo [2/4] 📦 Instalando dependências...
call npm install
if errorlevel 1 (
    echo ❌ Erro ao instalar dependências
    pause
    exit /b 1
)
echo ✅ Dependências instaladas

echo.
echo [3/4] 🔨 Verificando instalação...
call npm list @tanstack/react-query
if errorlevel 1 (
    echo ⚠️ React Query não encontrado, instalando...
    call npm install @tanstack/react-query
)

echo.
echo [4/4] 🚀 Iniciando frontend...
echo.
echo ========================================
echo  ✅ FRONTEND CORRIGIDO!
echo ========================================
echo.
echo 🌐 Acesse: http://localhost:3000/loja-fisica
echo.
echo Aguarde o Vite iniciar...
echo.

npm run dev
