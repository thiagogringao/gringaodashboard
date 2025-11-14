#!/bin/bash
# Script para instalar dependências no servidor VPS
# Execute este script no servidor após conectar via SSH

set -e

echo "🔧 Instalando dependências do servidor..."
echo "=========================================="
echo ""

# Atualizar sistema
echo "📦 Atualizando sistema..."
apt update && apt upgrade -y

# Instalar Node.js 18.x
echo "📦 Instalando Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verificar instalação
echo ""
echo "✅ Node.js instalado:"
node --version
npm --version

# Instalar PM2
echo ""
echo "📦 Instalando PM2..."
npm install -g pm2

# Instalar Nginx
echo ""
echo "📦 Instalando Nginx..."
apt install -y nginx

# Instalar Git
echo ""
echo "📦 Instalando Git..."
apt install -y git

# Instalar UFW (firewall)
echo ""
echo "📦 Instalando UFW..."
apt install -y ufw

# Instalar htop (monitor de recursos)
echo ""
echo "📦 Instalando htop..."
apt install -y htop

echo ""
echo "=========================================="
echo "✅ Todas as dependências foram instaladas!"
echo "=========================================="
echo ""
echo "📋 Versões instaladas:"
echo "  - Node.js: $(node --version)"
echo "  - npm: $(npm --version)"
echo "  - PM2: $(pm2 --version)"
echo "  - Nginx: $(nginx -v 2>&1)"
echo "  - Git: $(git --version)"
echo ""
