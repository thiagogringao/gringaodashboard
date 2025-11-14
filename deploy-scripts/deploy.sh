#!/bin/bash

# Script de Deploy Completo - Dashboard Produtos
# Uso: ./deploy.sh

set -e  # Parar em caso de erro

echo "🚀 Iniciando deploy do Dashboard Produtos..."
echo "=============================================="
echo ""

# Variáveis
APP_DIR="/var/www/dashboard"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
LOG_FILE="$APP_DIR/logs/deploy_$(date +%Y%m%d_%H%M%S).log"

# Função para log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Criar diretório de logs se não existir
mkdir -p "$APP_DIR/logs"

log "📋 Iniciando processo de deploy..."

# 1. Parar aplicação
log "⏸️  Parando aplicação..."
pm2 stop dashboard-backend || log "⚠️  Aplicação não estava rodando"

# 2. Backup dos dados atuais
log "💾 Fazendo backup dos dados..."
BACKUP_DIR="/var/backups/dashboard"
mkdir -p "$BACKUP_DIR"
DATE=$(date +%Y%m%d_%H%M%S)

if [ -d "$BACKEND_DIR/cache" ]; then
    tar -czf "$BACKUP_DIR/sqlite_$DATE.tar.gz" -C "$BACKEND_DIR" cache/*.db auth.db 2>/dev/null || log "⚠️  Nenhum banco para backup"
    log "✅ Backup criado: sqlite_$DATE.tar.gz"
fi

# 3. Atualizar código (se usar Git)
if [ -d "$APP_DIR/.git" ]; then
    log "📥 Atualizando código do repositório..."
    cd "$APP_DIR"
    git pull origin main || log "⚠️  Erro ao atualizar repositório"
else
    log "ℹ️  Não é um repositório Git, pulando atualização"
fi

# 4. Backend
log "🔧 Configurando backend..."
cd "$BACKEND_DIR"

# Instalar/atualizar dependências
log "📦 Instalando dependências do backend..."
npm install --production

# Verificar arquivo .env
if [ ! -f ".env" ]; then
    log "⚠️  Arquivo .env não encontrado! Criando template..."
    cat > .env << 'EOF'
PORT=3001
DB_HOST_LOJA=localhost
DB_USER_LOJA=seu_usuario
DB_PASSWORD_LOJA=sua_senha
DB_NAME_LOJA=seu_banco
DB_HOST_ECOMMERCE=localhost
DB_USER_ECOMMERCE=seu_usuario
DB_PASSWORD_ECOMMERCE=sua_senha
DB_NAME_ECOMMERCE=db_gringao
JWT_SECRET=seu-secret-super-seguro-aqui-2024
CORS_ORIGIN=http://72.60.250.20
NODE_ENV=production
EOF
    log "⚠️  ATENÇÃO: Configure o arquivo .env antes de continuar!"
    log "📝 Arquivo: $BACKEND_DIR/.env"
fi

# Proteger .env
chmod 600 .env

# 5. Frontend (se necessário rebuild)
if [ "$1" == "--rebuild-frontend" ]; then
    log "🎨 Rebuilding frontend..."
    cd "$FRONTEND_DIR"
    npm install
    npm run build
    log "✅ Frontend rebuild concluído"
fi

# 6. Executar backups dos dados
log "💾 Executando backup/sincronização dos dados..."
cd "$BACKEND_DIR"

if [ -f "scripts/backupToSQLite.js" ]; then
    node scripts/backupToSQLite.js >> "$LOG_FILE" 2>&1 || log "⚠️  Erro no backup Loja Física"
fi

if [ -f "scripts/backupEcommerceToSQLite.js" ]; then
    node scripts/backupEcommerceToSQLite.js >> "$LOG_FILE" 2>&1 || log "⚠️  Erro no backup E-commerce"
fi

# 7. Reiniciar aplicação
log "▶️  Reiniciando aplicação..."
cd "$BACKEND_DIR"

if [ -f "ecosystem.config.js" ]; then
    pm2 restart ecosystem.config.js
else
    log "⚠️  ecosystem.config.js não encontrado, iniciando com PM2 direto..."
    pm2 start server.js --name dashboard-backend
fi

# Salvar configuração do PM2
pm2 save

# 8. Reiniciar Nginx
log "🔄 Recarregando Nginx..."
nginx -t && systemctl reload nginx || log "⚠️  Erro ao recarregar Nginx"

# 9. Limpar backups antigos (manter últimos 7)
log "🧹 Limpando backups antigos..."
cd "$BACKUP_DIR"
ls -t sqlite_*.tar.gz 2>/dev/null | tail -n +8 | xargs -r rm
log "✅ Backups antigos removidos"

# 10. Verificar status
log "📊 Verificando status da aplicação..."
sleep 3
pm2 status dashboard-backend

echo ""
log "✅ Deploy concluído com sucesso!"
echo "=============================================="
echo ""
echo "📋 Informações:"
echo "  🌐 URL: http://72.60.250.20"
echo "  📝 Log: $LOG_FILE"
echo "  💾 Backup: $BACKUP_DIR/sqlite_$DATE.tar.gz"
echo ""
echo "📊 Status:"
pm2 list | grep dashboard-backend
echo ""
echo "🔍 Para ver logs em tempo real:"
echo "  pm2 logs dashboard-backend"
echo ""

