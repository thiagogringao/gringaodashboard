#!/bin/bash
# Script de backup dos dados

BACKUP_DIR="/var/backups/dashboard"
DATE=$(date +%Y%m%d_%H%M%S)
BACKEND_DIR="/var/www/dashboard/backend"

echo "💾 Executando backup do Dashboard"
echo "=================================="
echo ""

# Criar diretório de backup
mkdir -p $BACKUP_DIR

# Backup dos bancos SQLite
echo "📦 Backup dos bancos SQLite..."
if [ -d "$BACKEND_DIR/cache" ] || [ -f "$BACKEND_DIR/auth.db" ]; then
    cd $BACKEND_DIR
    tar -czf $BACKUP_DIR/sqlite_$DATE.tar.gz cache/*.db auth.db 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ Bancos SQLite backupeados"
    else
        echo "⚠️  Nenhum banco SQLite encontrado"
    fi
else
    echo "⚠️  Diretório de bancos não encontrado"
fi

# Backup dos logs
echo ""
echo "📋 Backup dos logs..."
if [ -d "/var/www/dashboard/logs" ]; then
    tar -czf $BACKUP_DIR/logs_$DATE.tar.gz /var/www/dashboard/logs/*.log 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ Logs backupeados"
    else
        echo "⚠️  Nenhum log encontrado"
    fi
else
    echo "⚠️  Diretório de logs não encontrado"
fi

# Backup do arquivo .env
echo ""
echo "⚙️  Backup do .env..."
if [ -f "$BACKEND_DIR/.env" ]; then
    cp $BACKEND_DIR/.env $BACKUP_DIR/env_$DATE.backup
    echo "✅ Arquivo .env backupeado"
else
    echo "⚠️  Arquivo .env não encontrado"
fi

# Manter apenas últimos 7 backups
echo ""
echo "🧹 Limpando backups antigos..."
cd $BACKUP_DIR
ls -t sqlite_*.tar.gz 2>/dev/null | tail -n +8 | xargs -r rm
ls -t logs_*.tar.gz 2>/dev/null | tail -n +8 | xargs -r rm
ls -t env_*.backup 2>/dev/null | tail -n +8 | xargs -r rm
echo "✅ Backups antigos removidos (mantidos últimos 7)"

echo ""
echo "=================================="
echo "✅ Backup concluído!"
echo "=================================="
echo ""
echo "📁 Backups salvos em: $BACKUP_DIR"
echo ""
echo "📦 Arquivos de backup:"
ls -lh $BACKUP_DIR | grep $DATE
echo ""
echo "💾 Espaço usado pelos backups:"
du -sh $BACKUP_DIR
echo ""
