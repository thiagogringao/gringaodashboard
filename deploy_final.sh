#!/bin/bash
set -e

echo "🚀 Iniciando o processo de atualização na VPS (Tentativa Final)..."
APP_DIR="/var/www/dashboard"
BACKUP_DIR="/var/backups/dashboard/update_$(date +%Y%m%d_%H%M%S)"

echo "⏸️  Parando a aplicação com PM2..."
pm2 stop dashboard-backend || echo "Aplicação já estava parada."

echo "💾  Criando backup..."
mkdir -p "$BACKUP_DIR"
mv "$APP_DIR/backend" "$BACKUP_DIR/" || echo "Diretório backend antigo não encontrado."
mv "$APP_DIR/frontend" "$BACKUP_DIR/" || echo "Diretório frontend antigo não encontrado."

echo "🚚  Descompactando a nova versão..."
mkdir -p "$APP_DIR/frontend"
tar -xzvf /root/backend.tar.gz -C "$APP_DIR/"
tar -xzvf /root/frontend.tar.gz -C "$APP_DIR/frontend/"

echo "🔄  Restaurando arquivos de cache, auth e .env..."
cp -r "$BACKUP_DIR/backend/cache" "$APP_DIR/backend/" \u003e /dev/null 2\u003e\u00261 || echo "Cache antigo não restaurado (não encontrado)."
cp "$BACKUP_DIR/backend/auth.db" "$APP_DIR/backend/" \u003e /dev/null 2\u003e\u00261 || echo "auth.db antigo não restaurado (não encontrado)."
if [ -f "$BACKUP_DIR/backend/.env" ]; then
    cp "$BACKUP_DIR/backend/.env" "$APP_DIR/backend/"
    echo "✅ .env restaurado."
else
    echo "⚠️  Arquivo .env antigo não encontrado."
fi

echo "📦  Instalando dependências do backend..."
cd "$APP_DIR/backend"
npm install --production

echo "▶️  Reiniciando a aplicação com PM2..."
pm2 restart dashboard-backend || pm2 start ecosystem.config.js
pm2 save

echo "🔄  Recarregando Nginx..."
nginx -t \u0026\u0026 systemctl reload nginx

echo "--------------------------------------------------"
echo "✅  Atualização concluída! Verificando o status..."
sleep 3
pm2 status
echo "---"
echo "🔍 Testando endpoint da API (externo):"
curl -fL "http://72.60.250.20/api/produtos/loja-fisica?page=1\u0026limit=2" || echo "Falha ao testar endpoint externo."
echo ""
echo "---"
echo "📋 Mostrando os últimos logs da aplicação:"
pm2 logs dashboard-backend --lines 20 --timestamp

echo "🎉 Deploy finalizado!"