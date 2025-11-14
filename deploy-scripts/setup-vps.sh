#!/bin/bash

# Script de Setup Inicial da VPS - Dashboard Produtos
# Uso: ./setup-vps.sh

set -e

echo "🚀 Setup Inicial da VPS - Dashboard Produtos"
echo "=============================================="
echo ""

# Verificar se é root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Este script precisa ser executado como root"
    echo "   Use: sudo ./setup-vps.sh"
    exit 1
fi

# 1. Atualizar sistema
echo "📦 Atualizando sistema..."
apt update && apt upgrade -y

# 2. Instalar Node.js 20.x
echo "📦 Instalando Node.js 20.x..."
echo "   - Versão ANTES da instalação: $(node -v || echo 'não instalado')"

echo "   - Removendo completamente qualquer versão antiga do Node.js..."
apt-get purge -y nodejs* > /dev/null 2>&1 || true
apt-get autoremove -y --purge > /dev/null 2>&1 || true
rm -f /etc/apt/sources.list.d/nodesource.list

echo "   - Adicionando repositório NodeSource e instalando Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
echo "   - Versão DEPOIS da instalação: $(node -v || echo 'falhou')"

echo "✅ Node.js instalado:"
node --version
npm --version

# 3. Instalar PM2
echo "📦 Instalando PM2..."
npm install -g pm2

echo "✅ PM2 instalado:"
pm2 --version

# 4. Instalar Nginx
echo "📦 Instalando Nginx..."
apt install -y nginx

echo "✅ Nginx instalado:"
nginx -v

# 5. Instalar Git
echo "📦 Instalando Git..."
apt install -y git

echo "✅ Git instalado:"
git --version

# 6. Criar estrutura de diretórios
echo "📁 Criando estrutura de diretórios..."
mkdir -p /var/www/dashboard/{backend,frontend,logs}
mkdir -p /var/www/dashboard/backend/cache
mkdir -p /var/backups/dashboard

echo "✅ Diretórios criados:"
tree -L 2 /var/www/dashboard || ls -la /var/www/dashboard

# 7. Configurar PM2 para iniciar no boot
echo "🔧 Configurando PM2 para iniciar no boot..."
pm2 startup systemd -u root --hp /root
pm2 save

# 8. Configurar Firewall
echo "🔥 Configurando Firewall (UFW)..."
apt install -y ufw

# Permitir SSH
ufw allow 22/tcp

# Permitir HTTP
ufw allow 80/tcp

# Permitir HTTPS
ufw allow 443/tcp

# Habilitar firewall
ufw --force enable

echo "✅ Firewall configurado:"
ufw status

# 9. Criar arquivo de configuração do Nginx
echo "🔧 Criando configuração do Nginx..."
cat > /etc/nginx/sites-available/dashboard << 'EOF'
server {
    listen 80;
    server_name 72.60.250.20;

    # Logs
    access_log /var/log/nginx/dashboard-access.log;
    error_log /var/log/nginx/dashboard-error.log;

    # Frontend (React)
    location / {
        root /var/www/dashboard/frontend/build;
        try_files $uri $uri/ /index.html;
        
        # Cache para assets estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
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
EOF

# Habilitar site
ln -sf /etc/nginx/sites-available/dashboard /etc/nginx/sites-enabled/

# Remover site padrão
rm -f /etc/nginx/sites-enabled/default

# Testar configuração
nginx -t

# Reiniciar Nginx
systemctl restart nginx
systemctl enable nginx

echo "✅ Nginx configurado e rodando"

# 10. Criar script de deploy
echo "📝 Criando scripts auxiliares..."
cat > /var/www/dashboard/deploy.sh << 'DEPLOY_SCRIPT'
#!/bin/bash
cd /var/www/dashboard/backend
pm2 stop dashboard-backend
npm install --production
node scripts/backupToSQLite.js
node scripts/backupEcommerceToSQLite.js
pm2 restart dashboard-backend
systemctl reload nginx
echo "✅ Deploy concluído!"
pm2 status
DEPLOY_SCRIPT

chmod +x /var/www/dashboard/deploy.sh

# 11. Criar script de status
cat > /var/www/dashboard/status.sh << 'STATUS_SCRIPT'
#!/bin/bash
echo "📊 Status do Dashboard"
echo "======================"
echo ""
echo "🔧 Backend:"
pm2 status dashboard-backend
echo ""
echo "🌐 Nginx:"
systemctl status nginx --no-pager | head -n 10
echo ""
echo "💾 Espaço em Disco:"
df -h /var/www/dashboard
echo ""
echo "📈 Uso de Memória:"
free -h
STATUS_SCRIPT

chmod +x /var/www/dashboard/status.sh

# 12. Criar script de logs
cat > /var/www/dashboard/logs.sh << 'LOGS_SCRIPT'
#!/bin/bash
echo "📋 Logs do Dashboard"
echo ""
echo "Escolha:"
echo "1) Backend (PM2)"
echo "2) Nginx Access"
echo "3) Nginx Error"
echo ""
read -p "Opção: " opt

case $opt in
    1) pm2 logs dashboard-backend --lines 100 ;;
    2) tail -f /var/log/nginx/dashboard-access.log ;;
    3) tail -f /var/log/nginx/dashboard-error.log ;;
    *) echo "Opção inválida" ;;
esac
LOGS_SCRIPT

chmod +x /var/www/dashboard/logs.sh

echo ""
echo "=============================================="
echo "✅ Setup da VPS concluído com sucesso!"
echo "=============================================="
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1. Transferir arquivos da aplicação:"
echo "   scp -r backend root@72.60.250.20:/var/www/dashboard/"
echo "   scp -r frontend/build root@72.60.250.20:/var/www/dashboard/frontend/"
echo ""
echo "2. Configurar arquivo .env:"
echo "   nano /var/www/dashboard/backend/.env"
echo ""
echo "3. Iniciar aplicação:"
echo "   cd /var/www/dashboard/backend"
echo "   pm2 start ecosystem.config.js"
echo "   pm2 save"
echo ""
echo "4. Verificar status:"
echo "   /var/www/dashboard/status.sh"
echo ""
echo "📦 Ferramentas instaladas:"
echo "  - Node.js: $(node --version)"
echo "  - NPM: $(npm --version)"
echo "  - PM2: $(pm2 --version)"
echo "  - Nginx: $(nginx -v 2>&1)"
echo "  - Git: $(git --version)"
echo ""
echo "🔥 Firewall:"
ufw status
echo ""
echo "🌐 Acesso:"
echo "  http://72.60.250.20"
echo ""

