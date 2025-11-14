#!/bin/bash
# Script para verificar status da aplicação

echo "📊 Status do Dashboard de Produtos"
echo "===================================="
echo ""

# Backend (PM2)
echo "🔧 Backend (PM2):"
echo "─────────────────"
pm2 status dashboard-backend 2>/dev/null || echo "❌ Backend não está rodando"
echo ""

# Nginx
echo "🌐 Nginx:"
echo "─────────"
systemctl is-active nginx >/dev/null 2>&1 && echo "✅ Nginx está rodando" || echo "❌ Nginx não está rodando"
systemctl status nginx --no-pager | head -n 3
echo ""

# Espaço em disco
echo "💾 Espaço em Disco:"
echo "───────────────────"
df -h /var/www/dashboard | tail -n 1
echo ""

# Uso de memória
echo "📈 Uso de Memória:"
echo "──────────────────"
free -h | grep -E "Mem:|Swap:"
echo ""

# Processos Node
echo "🔥 Processos Node:"
echo "──────────────────"
ps aux | grep node | grep -v grep | wc -l | xargs echo "Processos Node ativos:"
echo ""

# Bancos SQLite
echo "🗄️  Bancos SQLite:"
echo "──────────────────"
if [ -d "/var/www/dashboard/backend/cache" ]; then
    ls -lh /var/www/dashboard/backend/cache/*.db 2>/dev/null | awk '{print $9, "-", $5}' || echo "Nenhum banco encontrado"
fi
if [ -f "/var/www/dashboard/backend/auth.db" ]; then
    ls -lh /var/www/dashboard/backend/auth.db | awk '{print $9, "-", $5}'
fi
echo ""

# Últimos logs
echo "📋 Últimos Logs (últimas 5 linhas):"
echo "────────────────────────────────────"
pm2 logs dashboard-backend --nostream --lines 5 2>/dev/null || echo "Nenhum log disponível"
echo ""

echo "===================================="
echo "✅ Status verificado!"
echo "===================================="
echo ""
echo "💡 Comandos úteis:"
echo "  - Ver logs: pm2 logs dashboard-backend"
echo "  - Reiniciar: pm2 restart dashboard-backend"
echo "  - Monitorar: pm2 monit"
echo ""
