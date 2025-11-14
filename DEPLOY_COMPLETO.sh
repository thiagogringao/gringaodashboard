#!/bin/bash
# Script de Deploy Completo - Dashboard Produtos
# Execute no servidor: bash DEPLOY_COMPLETO.sh

set -e

echo "🚀 INICIANDO DEPLOY COMPLETO"
echo "============================="
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para mensagens
msg_info() {
    echo -e "${YELLOW}$1${NC}"
}

msg_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

msg_error() {
    echo -e "${RED}❌ $1${NC}"
}

# PASSO 1: Verificar estrutura
msg_info "📋 Verificando estrutura de arquivos..."
if [ ! -d "/var/www/dashboard/backend" ]; then
    msg_error "Diretório backend não encontrado!"
    msg_info "Certifique-se de transferir os arquivos primeiro"
    exit 1
fi
msg_success "Estrutura verificada"
echo ""

# PASSO 2: Atualizar sistema
msg_info "📦 Atualizando sistema..."
apt update -qq
msg_success "Sistema atualizado"
echo ""

# PASSO 3: Instalar Node.js
msg_info "📦 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    msg_info "Instalando Node.js 18.x..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
fi
NODE_VERSION=$(node --version)
msg_success "Node.js instalado: $NODE_VERSION"
echo ""

# PASSO 4: Instalar PM2
msg_info "📦 Verificando PM2..."
if ! command -v pm2 &> /dev/null; then
    msg_info "Instalando PM2..."
    npm install -g pm2
fi
PM2_VERSION=$(pm2 --version)
msg_success "PM2 instalado: $PM2_VERSION"
echo ""

# PASSO 5: Instalar Nginx
msg_info "📦 Verificando Nginx..."
if ! command -v nginx &> /dev/null; then
    msg_info "Instalando Nginx..."
    apt install -y nginx
fi
msg_success "Nginx instalado"
echo ""

# PASSO 6: Criar diretórios
msg_info "📁 Criando diretórios..."
mkdir -p /var/www/dashboard/backend/cache
mkdir -p /var/www/dashboard/frontend
mkdir -p /var/www/dashboard/logs
mkdir -p /var/backups/dashboard
msg_success "Diretórios criados"
echo ""

# PASSO 7: Instalar dependências do backend
msg_info "📦 Instalando dependências do backend..."
cd /var/www/dashboard/backend
npm install --production --silent
msg_success "Dependências instaladas"
echo ""

# PASSO 8: Ajustar permissões
msg_info "🔒 Ajustando permissões..."
chmod 600 /var/www/dashboard/backend/.env 2>/dev/null || true
chmod 755 /var/www/dashboard/backend/server.js 2>/dev/null || true
msg_success "Permissões ajustadas"
echo ""

# PASSO 9: Criar configuração do PM2
msg_info "⚙️  Configurando PM2..."
cat > /var/www/dashboard/backend/ecosystem.config.js << 'EOFPM2'
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
EOFPM2
msg_success "PM2 configurado"
echo ""

# PASSO 10: Iniciar aplicação
msg_info "▶️  Iniciando aplicação..."
cd /var/www/dashboard/backend
pm2 delete dashboard-backend 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
msg_success "Aplicação iniciada"
echo ""

# PASSO 11: Configurar PM2 startup
msg_info "🔄 Configurando PM2 para iniciar no boot..."
pm2 startup systemd -u root --hp /root 2>/dev/null || true
msg_success "PM2 startup configurado"
echo ""

# PASSO 12: Configurar Nginx
msg_info "🌐 Configurando Nginx..."
cat > /etc/nginx/sites-available/dashboard << 'EOFNGINX'
server {
    listen 80;
    server_name 72.60.250.20;

    access_log /var/log/nginx/dashboard-access.log;
    error_log /var/log/nginx/dashboard-error.log;

    location / {
        root /var/www/dashboard/frontend;
        try_files $uri $uri/ /index.html;
        
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
}
EOFNGINX

ln -sf /etc/nginx/sites-available/dashboard /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl restart nginx
systemctl enable nginx
msg_success "Nginx configurado"
echo ""

# PASSO 13: Configurar firewall
msg_info "🔒 Configurando firewall..."
apt install -y ufw
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
msg_success "Firewall configurado"
echo ""

# PASSO 14: Verificação final
msg_info "🔍 Verificando deploy..."
echo ""

echo "📊 Status do PM2:"
pm2 status
echo ""

echo "🌐 Status do Nginx:"
systemctl status nginx --no-pager | head -n 5
echo ""

echo "🔥 Testando backend:"
sleep 2
curl -s http://localhost:3001/health || echo "Backend ainda inicializando..."
echo ""

echo "============================="
msg_success "DEPLOY CONCLUÍDO!"
echo "============================="
echo ""
echo "🌐 Acesse: http://72.60.250.20"
echo ""
echo "📊 Comandos úteis:"
echo "  - Ver logs: pm2 logs dashboard-backend"
echo "  - Ver status: pm2 status"
echo "  - Reiniciar: pm2 restart dashboard-backend"
echo "  - Logs Nginx: tail -f /var/log/nginx/dashboard-error.log"
echo ""
