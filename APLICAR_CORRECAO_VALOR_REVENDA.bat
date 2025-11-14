@echo off
chcp 65001 >nul
cls
echo ╔════════════════════════════════════════════════════════════╗
echo ║     🔧 APLICAR CORREÇÃO - VALOR_REVENDA                   ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 📋 O QUE SERÁ FEITO:
echo.
echo 1. ✅ Código já foi corrigido para usar VALOR_REVENDA
echo 2. 🔄 Você precisa REINICIAR o backend
echo 3. 🌐 Acessar a página para ver os valores corretos
echo.
echo ════════════════════════════════════════════════════════════
echo.
echo ⚠️  IMPORTANTE:
echo    - Pressione Ctrl+C no terminal do backend
echo    - Execute: npm start
echo    - Aguarde o backend iniciar
echo.
echo ════════════════════════════════════════════════════════════
echo.
echo 📊 APÓS REINICIAR, OS VALORES SERÃO:
echo.
echo    Produto 020934:
echo    ❌ ANTES: R$ 11,97 (VALOR_VENDA - errado)
echo    ✅ AGORA:  [VALOR_REVENDA da vw_dprodutos]
echo.
echo    Produto 020728:
echo    ❌ ANTES: R$ 23,00 (VALOR_VENDA - errado)
echo    ✅ AGORA:  [VALOR_REVENDA da vw_dprodutos]
echo.
echo ════════════════════════════════════════════════════════════
echo.
echo 🎯 PÁGINAS AFETADAS:
echo    • Catálogo Loja Física
echo    • Detalhes do Produto
echo    • Picos de Vendas
echo    • Sugestão de Compras
echo.
echo ════════════════════════════════════════════════════════════
echo.
echo 💡 DICA: Para atualizar o cache SQLite também, execute:
echo    ATUALIZAR_PRECOS_REVENDA.bat
echo.
echo ════════════════════════════════════════════════════════════
echo.
pause
