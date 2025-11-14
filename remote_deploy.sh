#!/bin/bash
set -e

echo "🚀 Iniciando o processo de atualização na VPS..."
APP_DIR="/var/www/dashboard"
BACKUP_DIR="/var/backups/dashboard/update_$(date +%Y%m%d_%H%M%S)"

# 1. Parar a aplicação para evitar qualquer conflito durante a atualização.
echo "⏸️  Parando a aplicação com PM2..."
pm2 stop dashboard-backend || echo "Aplicação já estava parada, continuando..."

# 2. Criar um backup seguro da versão atual antes de qualquer modificação.
echo "💾  Criando backup da versão atual em: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"
# Move os diretórios atuais para a pasta de backup.
mv "$APP_DIR/backend" "$BACKUP_DIR/" || echo "Diretório backend não existia."
mv "$APP_DIR/frontend" "$BACKUP_DIR/" || echo "Diretório frontend não existia."

# 3. Instalar os novos arquivos que transferimos.
echo "🚚  Descompactando e instalando a nova versão..."
mkdir -p "$APP_DIR/frontend"
tar -xzvf /root/backend.tar.gz -C "$APP_DIR/"
tar -xzvf /root/frontend.tar.gz -C "$APP_DIR/frontend/"

# 4. Restaurar arquivos essenciais (cache, banco de autenticação e .env) do backup.
echo "🔄  Restaurando arquivos de cache, auth e .env..."
cp -r "$BACKUP_DIR/backend/cache" "$APP_DIR/backend/" 2\u003e/dev/null || echo "Cache antigo não encontrado (OK para primeira vez)."
cp "$BACKUP_DIR/backend/auth.db" "$APP_DIR/backend/" 2\u003e/dev/null || echo "auth.db antigo não encontrado (OK para primeira vez)."
if [ -f "$BACKUP_DIR/backend/.env" ]; then
    cp "$BACKUP_DIR/backend/.env" "$APP_DIR/backend/"
    echo "✅ .env restaurado."
else
    echo "⚠️  Arquivo .env antigo não encontrado. Verifique as configurações manualmente se necessário."
fi

# 5. Acessar a pasta do backend e instalar as dependências.
echo "📦  Instalando/atualizando as dependências do backend..."
cd "$APP_DIR/backend"
npm install --production

# 6. Reiniciar a aplicação com PM2 para carregar as novas funções.
echo "▶️  Reiniciando a aplicação com PM2..."
pm2 restart dashboard-backend || pm2 start ecosystem.config.js
pm2 save

# 7. Recarregar o Nginx para garantir que ele sirva os novos arquivos do frontend.
echo "🔄  Recarregando Nginx..."
nginx -t \u0026\u0026 systemctl reload nginx

# 8. Verificação final para garantir que tudo subiu corretamente.
echo "--------------------------------------------------"
echo "✅  Atualização concluída! Verificando o status..."
sleep 3
pm2 status dashboard-backend
echo "---"
echo "🔍 Testando endpoint da API (externo):"
curl -fL "http://72.60.250.20/api/produtos/loja-fisica?page=1\u0026limit=2" || echo "Falha ao testar endpoint externo."
echo ""
echo "---"
echo "📋 Mostrando os últimos logs da aplicação:"
pm2 logs dashboard-backend --lines 20 --timestamp

echo "🎉 Deploy finalizado! Verifique a aplicação no seu navegador."