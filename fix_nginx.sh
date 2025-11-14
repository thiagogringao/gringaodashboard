#!/bin/bash
set -e

echo "--- Corrigindo configuração do Nginx ---"

# Definir o conteúdo da configuração em uma variável
NGINX_CONF="server {
    listen 80;
    server_name 72.60.250.20;

    # Servir o frontend
    location / {
        root /var/www/dashboard/frontend;
        try_files \$uri \$uri/ /index.html;
    }

    # Redirecionar para a API backend
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}"

# Escrever a configuração no arquivo
echo "$NGINX_CONF" > /etc/nginx/sites-available/dashboard

# Garantir que o link simbólico existe
ln -sf /etc/nginx/sites-available/dashboard /etc/nginx/sites-enabled/dashboard

# Testar a configuração
echo "--- Testando a configuração do Nginx ---"
nginx -t

# Reiniciar o Nginx
echo "--- Reiniciando o Nginx ---"
systemctl restart nginx

echo "--- Verificando o status do Nginx ---"
systemctl status nginx --no-pager

echo "✅ Script de correção do Nginx executado com sucesso!"