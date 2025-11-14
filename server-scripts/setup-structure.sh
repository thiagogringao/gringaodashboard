#!/bin/bash
# Script para criar estrutura de diretórios no servidor

echo "📁 Criando estrutura de diretórios..."
echo "======================================"
echo ""

# Criar diretórios principais
mkdir -p /var/www/dashboard/backend/cache
mkdir -p /var/www/dashboard/frontend
mkdir -p /var/www/dashboard/logs
mkdir -p /var/backups/dashboard

# Ajustar permissões
chmod 755 /var/www/dashboard
chmod 755 /var/www/dashboard/backend
chmod 755 /var/www/dashboard/frontend
chmod 755 /var/www/dashboard/logs
chmod 755 /var/backups/dashboard

echo "✅ Estrutura criada:"
echo ""
tree -L 2 /var/www/dashboard 2>/dev/null || ls -la /var/www/dashboard
echo ""
echo "======================================"
echo "✅ Estrutura de diretórios pronta!"
echo "======================================"
