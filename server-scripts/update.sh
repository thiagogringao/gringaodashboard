#!/bin/bash
# Script para atualizar a aplicação

echo "🔄 Atualizando Dashboard de Produtos"
echo "====================================="
echo ""

APP_DIR="/var/www/dashboard"
BACKEND_DIR="$APP_DIR/backend"

# Fazer backup antes de atualizar
echo "💾 Fazendo backup antes da atualização..."
/var/www/dashboard/backup.sh > /dev/null 2>&1
echo "✅ Backup concluído"
echo ""

# Parar aplicação
echo "⏸️  Parando aplicação..."
pm2 stop dashboard-backend
echo "✅ Aplicação parada"
echo ""

# Atualizar dependências do backend
echo "📦 Atualizando dependências do backend..."
cd $BACKEND_DIR
npm install --production
echo "✅ Dependências atualizadas"
echo ""

# Reiniciar aplicação
echo "▶️  Reiniciando aplicação..."
pm2 restart dashboard-backend
echo "✅ Aplicação reiniciada"
echo ""

# Recarregar Nginx
echo "🔄 Recarregando Nginx..."
systemctl reload nginx
echo "✅ Nginx recarregado"
echo ""

# Aguardar alguns segundos
echo "⏳ Aguardando aplicação inicializar..."
sleep 5

# Verificar status
echo ""
echo "📊 Status da aplicação:"
pm2 status dashboard-backend

echo ""
echo "====================================="
echo "✅ Atualização concluída!"
echo "====================================="
echo ""
echo "💡 Comandos úteis:"
echo "  - Ver logs: pm2 logs dashboard-backend"
echo "  - Ver status: pm2 status"
echo "  - Verificar saúde: curl http://localhost:3001/health"
echo ""
