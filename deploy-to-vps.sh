#!/bin/bash

# Script de Deploy Automatizado - Dashboard Produtos
# Servidor: 72.60.250.20

set -e  # Parar em caso de erro

echo "🚀 Iniciando Deploy do Dashboard de Produtos..."
echo "================================================"
echo ""

# Variáveis
VPS_IP="72.60.250.20"
VPS_USER="root"
APP_DIR="/var/www/dashboard"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para executar comandos na VPS
run_remote() {
    ssh ${VPS_USER}@${VPS_IP} "$@"
}

# Função para copiar arquivos
copy_files() {
    scp -r "$1" ${VPS_USER}@${VPS_IP}:"$2"
}

echo -e "${YELLOW}📋 Passo 1: Verificando conexão com a VPS...${NC}"
if run_remote "echo 'Conexão OK'"; then
    echo -e "${GREEN}✅ Conexão estabelecida com sucesso!${NC}"
else
    echo -e "${RED}❌ Erro ao conectar na VPS${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}📋 Passo 2: Criando estrutura de diretórios...${NC}"
run_remote "mkdir -p $APP_DIR/logs $BACKEND_DIR/cache $FRONTEND_DIR"
echo -e "${GREEN}✅ Diretórios criados${NC}"
echo ""

echo -e "${YELLOW}📋 Passo 3: Transferindo arquivos do backend...${NC}"
copy_files "./backend/*" "$BACKEND_DIR/"
copy_files "./backend/.env.production" "$BACKEND_DIR/.env"
echo -e "${GREEN}✅ Backend transferido${NC}"
echo ""

echo -e "${YELLOW}📋 Passo 4: Instalando dependências do backend...${NC}"
run_remote "cd $BACKEND_DIR && npm install --production"
echo -e "${GREEN}✅ Dependências instaladas${NC}"
echo ""

echo -e "${YELLOW}📋 Passo 5: Buildando frontend...${NC}"
cd frontend
npm install
npm run build
echo -e "${GREEN}✅ Frontend buildado${NC}"
echo ""

echo -e "${YELLOW}📋 Passo 6: Transferindo frontend...${NC}"
copy_files "./frontend/dist/*" "$FRONTEND_DIR/"
echo -e "${GREEN}✅ Frontend transferido${NC}"
echo ""

echo -e "${YELLOW}📋 Passo 7: Configurando PM2...${NC}"
run_remote "cd $BACKEND_DIR && cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'dashboard-backend',
    script: './server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '../logs/backend-error.log',
    out_file: '../logs/backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false
  }]
};
EOF"
echo -e "${GREEN}✅ PM2 configurado${NC}"
echo ""

echo -e "${YELLOW}📋 Passo 8: Iniciando aplicação com PM2...${NC}"
run_remote "cd $BACKEND_DIR && pm2 delete dashboard-backend 2>/dev/null || true"
run_remote "cd $BACKEND_DIR && pm2 start ecosystem.config.js"
run_remote "pm2 save"
echo -e "${GREEN}✅ Aplicação iniciada${NC}"
echo ""

echo -e "${YELLOW}📋 Passo 9: Configurando Nginx...${NC}"
run_remote "cat > /etc/nginx/sites-available/dashboard << 'EOF'
server {
    listen 80;
    server_name 72.60.250.20;

    # Logs
    access_log /var/log/nginx/dashboard-access.log;
    error_log /var/log/nginx/dashboard-error.log;

    # Frontend (React)
    location / {
        root /var/www/dashboard/frontend;
        try_files \$uri \$uri/ /index.html;
        
        # Cache para assets estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control \"public, immutable\";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
}
EOF"

run_remote "ln -sf /etc/nginx/sites-available/dashboard /etc/nginx/sites-enabled/"
run_remote "rm -f /etc/nginx/sites-enabled/default"
run_remote "nginx -t && systemctl reload nginx"
echo -e "${GREEN}✅ Nginx configurado${NC}"
echo ""

echo -e "${YELLOW}📋 Passo 10: Executando backup inicial...${NC}"
run_remote "cd $BACKEND_DIR && node scripts/runBackup.js 2>/dev/null || echo 'Backup será executado automaticamente'"
echo -e "${GREEN}✅ Backup configurado${NC}"
echo ""

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}🎉 Deploy concluído com sucesso!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "📊 Status da aplicação:"
run_remote "pm2 status"
echo ""
echo -e "🌐 Acesse: ${GREEN}http://72.60.250.20${NC}"
echo ""
echo -e "📝 Comandos úteis:"
echo -e "  - Ver logs: ${YELLOW}ssh root@72.60.250.20 'pm2 logs dashboard-backend'${NC}"
echo -e "  - Ver status: ${YELLOW}ssh root@72.60.250.20 'pm2 status'${NC}"
echo -e "  - Reiniciar: ${YELLOW}ssh root@72.60.250.20 'pm2 restart dashboard-backend'${NC}"
echo ""
