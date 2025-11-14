#!/bin/bash
# Script para visualizar logs

echo "📋 Logs do Dashboard de Produtos"
echo "================================="
echo ""
echo "Escolha uma opção:"
echo ""
echo "1) Logs do Backend (PM2) - Tempo Real"
echo "2) Logs do Backend (PM2) - Últimas 100 linhas"
echo "3) Logs do Nginx - Access"
echo "4) Logs do Nginx - Error"
echo "5) Todos os logs (resumo)"
echo "6) Logs de erro apenas"
echo ""
read -p "Opção [1-6]: " opcao

case $opcao in
    1)
        echo ""
        echo "📋 Logs do Backend (Tempo Real) - Pressione Ctrl+C para sair"
        echo "─────────────────────────────────────────────────────────────"
        pm2 logs dashboard-backend
        ;;
    2)
        echo ""
        echo "📋 Logs do Backend (Últimas 100 linhas)"
        echo "────────────────────────────────────────"
        pm2 logs dashboard-backend --lines 100 --nostream
        ;;
    3)
        echo ""
        echo "📋 Logs do Nginx - Access (Tempo Real) - Pressione Ctrl+C para sair"
        echo "────────────────────────────────────────────────────────────────────"
        tail -f /var/log/nginx/dashboard-access.log
        ;;
    4)
        echo ""
        echo "📋 Logs do Nginx - Error (Tempo Real) - Pressione Ctrl+C para sair"
        echo "───────────────────────────────────────────────────────────────────"
        tail -f /var/log/nginx/dashboard-error.log
        ;;
    5)
        echo ""
        echo "📋 Resumo de Todos os Logs"
        echo "══════════════════════════"
        echo ""
        echo "🔧 Backend (PM2) - Últimas 20 linhas:"
        echo "─────────────────────────────────────"
        pm2 logs dashboard-backend --lines 20 --nostream
        echo ""
        echo "🌐 Nginx Access - Últimas 10 linhas:"
        echo "─────────────────────────────────────"
        tail -n 10 /var/log/nginx/dashboard-access.log
        echo ""
        echo "❌ Nginx Error - Últimas 10 linhas:"
        echo "────────────────────────────────────"
        tail -n 10 /var/log/nginx/dashboard-error.log
        ;;
    6)
        echo ""
        echo "❌ Logs de Erro"
        echo "═══════════════"
        echo ""
        echo "🔧 Backend (PM2) - Erros:"
        echo "─────────────────────────"
        pm2 logs dashboard-backend --err --lines 50 --nostream
        echo ""
        echo "🌐 Nginx - Erros:"
        echo "─────────────────"
        tail -n 20 /var/log/nginx/dashboard-error.log
        ;;
    *)
        echo ""
        echo "❌ Opção inválida"
        exit 1
        ;;
esac

echo ""
