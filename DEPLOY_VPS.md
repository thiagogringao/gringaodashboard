# 🚀 Deploy na VPS - Dashboard Produtos

## 📋 Informações da VPS

```
IP: 72.60.250.20
Usuário: root (ou especificar)
Senha: Admingringao1211.
```

---

## 🛠️ Pré-requisitos na VPS

### 1. **Node.js** (v18 ou superior)
### 2. **PM2** (gerenciador de processos)
### 3. **Nginx** (servidor web/proxy reverso)
### 4. **Git** (para clonar repositório)

---

## 📦 Estrutura de Deploy

```
/var/www/dashboard/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── cache/
│   │   ├── produtos.db
│   │   └── ecommerce.db
│   └── auth.db
├── frontend/
│   └── build/
└── logs/
```

---

## 🔧 Passo a Passo do Deploy

### **Passo 1: Conectar na VPS**

```bash
ssh root@72.60.250.20
# Senha: Admingringao1211.
```

### **Passo 2: Instalar Dependências**

```bash
# Atualizar sistema
apt update && apt upgrade -y

# Instalar Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verificar instalação
node --version
npm --version

# Instalar PM2 globalmente
npm install -g pm2

# Instalar Nginx
apt install -y nginx

# Instalar Git
apt install -y git
```

### **Passo 3: Criar Estrutura de Diretórios**

```bash
# Criar diretório principal
mkdir -p /var/www/dashboard
cd /var/www/dashboard

# Criar diretórios necessários
mkdir -p logs
mkdir -p backend/cache
```

### **Passo 4: Transferir Arquivos**

**Opção A: Via Git (Recomendado)**

```bash
cd /var/www/dashboard

# Se tiver repositório Git
git clone https://seu-repositorio.git .

# Ou criar repositório local e fazer push
```

**Opção B: Via SCP (do seu computador local)**

```bash
# Do seu computador local (Windows PowerShell):

# Transferir backend
scp -r C:\Users\thiag\Desktop\dashboardPRODUTOS\backend root@72.60.250.20:/var/www/dashboard/

# Transferir frontend (após build)
scp -r C:\Users\thiag\Desktop\dashboardPRODUTOS\frontend\build root@72.60.250.20:/var/www/dashboard/frontend/
```

### **Passo 5: Configurar Backend**

```bash
cd /var/www/dashboard/backend

# Instalar dependências
npm install --production

# Criar arquivo .env
cat > .env << 'EOF'
# Porta do servidor
PORT=3001

# Banco de dados MySQL - Loja Física
DB_HOST_LOJA=localhost
DB_USER_LOJA=seu_usuario
DB_PASSWORD_LOJA=sua_senha
DB_NAME_LOJA=seu_banco

# Banco de dados MySQL - E-commerce
DB_HOST_ECOMMERCE=localhost
DB_USER_ECOMMERCE=seu_usuario
DB_PASSWORD_ECOMMERCE=sua_senha
DB_NAME_ECOMMERCE=db_gringao

# JWT Secret
JWT_SECRET=seu-secret-super-seguro-aqui-2024-producao

# CORS
CORS_ORIGIN=http://72.60.250.20

# Ambiente
NODE_ENV=production
EOF

# Ajustar permissões
chmod 600 .env
```

### **Passo 6: Configurar Frontend**

```bash
cd /var/www/dashboard/frontend

# Se ainda não fez o build, fazer agora:
npm install
npm run build

# O build estará em /var/www/dashboard/frontend/build
```

### **Passo 7: Configurar PM2**

```bash
cd /var/www/dashboard/backend

# Criar arquivo de configuração do PM2
cat > ecosystem.config.js << 'EOF'
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
EOF

# Iniciar aplicação com PM2
pm2 start ecosystem.config.js

# Salvar configuração do PM2
pm2 save

# Configurar PM2 para iniciar no boot
pm2 startup
# Copie e execute o comando que aparecer

# Ver status
pm2 status

# Ver logs
pm2 logs dashboard-backend
```

### **Passo 8: Configurar Nginx**

```bash
# Criar configuração do Nginx
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
ln -s /etc/nginx/sites-available/dashboard /etc/nginx/sites-enabled/

# Remover site padrão
rm -f /etc/nginx/sites-enabled/default

# Testar configuração
nginx -t

# Reiniciar Nginx
systemctl restart nginx

# Habilitar Nginx no boot
systemctl enable nginx
```

### **Passo 9: Configurar Firewall**

```bash
# Instalar UFW (se não estiver instalado)
apt install -y ufw

# Permitir SSH
ufw allow 22/tcp

# Permitir HTTP
ufw allow 80/tcp

# Permitir HTTPS (para futuro)
ufw allow 443/tcp

# Habilitar firewall
ufw --force enable

# Ver status
ufw status
```

### **Passo 10: Executar Backup Inicial**

```bash
cd /var/www/dashboard/backend

# Executar backup dos dados
node scripts/backupToSQLite.js
node scripts/backupEcommerceToSQLite.js

# Verificar se os arquivos foram criados
ls -lh cache/
ls -lh auth.db
```

---

## 🔄 Scripts de Deploy Automatizado

### **Script 1: Deploy Completo (deploy.sh)**

```bash
#!/bin/bash

echo "🚀 Iniciando deploy do Dashboard..."

# Variáveis
APP_DIR="/var/www/dashboard"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"

# Parar aplicação
echo "⏸️  Parando aplicação..."
pm2 stop dashboard-backend

# Atualizar código (se usar Git)
echo "📥 Atualizando código..."
cd $APP_DIR
# git pull origin main

# Backend
echo "🔧 Atualizando backend..."
cd $BACKEND_DIR
npm install --production

# Frontend (se necessário rebuild)
# echo "🎨 Atualizando frontend..."
# cd $FRONTEND_DIR
# npm install
# npm run build

# Executar backups
echo "💾 Executando backups..."
cd $BACKEND_DIR
node scripts/backupToSQLite.js
node scripts/backupEcommerceToSQLite.js

# Reiniciar aplicação
echo "▶️  Reiniciando aplicação..."
pm2 restart dashboard-backend

# Reiniciar Nginx
echo "🔄 Reiniciando Nginx..."
systemctl reload nginx

echo "✅ Deploy concluído!"
echo "📊 Status da aplicação:"
pm2 status

echo ""
echo "🌐 Acesse: http://72.60.250.20"
```

### **Script 2: Atualizar Frontend (update-frontend.sh)**

```bash
#!/bin/bash

echo "🎨 Atualizando frontend..."

FRONTEND_DIR="/var/www/dashboard/frontend"

cd $FRONTEND_DIR
npm install
npm run build

echo "🔄 Reiniciando Nginx..."
systemctl reload nginx

echo "✅ Frontend atualizado!"
```

### **Script 3: Ver Logs (logs.sh)**

```bash
#!/bin/bash

echo "📋 Logs do Dashboard"
echo "===================="
echo ""
echo "Escolha:"
echo "1) Logs do Backend (PM2)"
echo "2) Logs do Nginx (Access)"
echo "3) Logs do Nginx (Error)"
echo "4) Todos os logs"
echo ""
read -p "Opção: " opcao

case $opcao in
    1)
        pm2 logs dashboard-backend --lines 100
        ;;
    2)
        tail -f /var/log/nginx/dashboard-access.log
        ;;
    3)
        tail -f /var/log/nginx/dashboard-error.log
        ;;
    4)
        echo "=== PM2 Logs ==="
        pm2 logs dashboard-backend --lines 50 --nostream
        echo ""
        echo "=== Nginx Access ==="
        tail -n 20 /var/log/nginx/dashboard-access.log
        echo ""
        echo "=== Nginx Error ==="
        tail -n 20 /var/log/nginx/dashboard-error.log
        ;;
    *)
        echo "Opção inválida"
        ;;
esac
```

### **Script 4: Backup dos Dados (backup.sh)**

```bash
#!/bin/bash

echo "💾 Executando backup dos dados..."

BACKEND_DIR="/var/www/dashboard/backend"
BACKUP_DIR="/var/backups/dashboard"
DATE=$(date +%Y%m%d_%H%M%S)

# Criar diretório de backup
mkdir -p $BACKUP_DIR

# Backup dos bancos SQLite
echo "📦 Backup dos bancos SQLite..."
cd $BACKEND_DIR
tar -czf $BACKUP_DIR/sqlite_$DATE.tar.gz cache/*.db auth.db

# Backup dos logs
echo "📋 Backup dos logs..."
tar -czf $BACKUP_DIR/logs_$DATE.tar.gz ../logs/*.log

# Manter apenas últimos 7 backups
echo "🧹 Limpando backups antigos..."
cd $BACKUP_DIR
ls -t sqlite_*.tar.gz | tail -n +8 | xargs -r rm
ls -t logs_*.tar.gz | tail -n +8 | xargs -r rm

echo "✅ Backup concluído!"
echo "📁 Backups salvos em: $BACKUP_DIR"
ls -lh $BACKUP_DIR
```

### **Script 5: Status da Aplicação (status.sh)**

```bash
#!/bin/bash

echo "📊 Status do Dashboard"
echo "======================"
echo ""

echo "🔧 Backend (PM2):"
pm2 status dashboard-backend
echo ""

echo "🌐 Nginx:"
systemctl status nginx --no-pager | head -n 10
echo ""

echo "💾 Espaço em Disco:"
df -h /var/www/dashboard
echo ""

echo "🗄️  Bancos SQLite:"
ls -lh /var/www/dashboard/backend/cache/*.db
ls -lh /var/www/dashboard/backend/auth.db
echo ""

echo "📈 Uso de Memória:"
free -h
echo ""

echo "🔥 Processos Node:"
ps aux | grep node | grep -v grep
```

---

## 📝 Comandos Úteis

### **PM2:**

```bash
# Ver status
pm2 status

# Ver logs em tempo real
pm2 logs dashboard-backend

# Reiniciar aplicação
pm2 restart dashboard-backend

# Parar aplicação
pm2 stop dashboard-backend

# Iniciar aplicação
pm2 start dashboard-backend

# Ver informações detalhadas
pm2 show dashboard-backend

# Monitorar recursos
pm2 monit
```

### **Nginx:**

```bash
# Testar configuração
nginx -t

# Recarregar configuração
systemctl reload nginx

# Reiniciar Nginx
systemctl restart nginx

# Ver status
systemctl status nginx

# Ver logs de acesso
tail -f /var/log/nginx/dashboard-access.log

# Ver logs de erro
tail -f /var/log/nginx/dashboard-error.log
```

### **Sistema:**

```bash
# Ver uso de recursos
htop

# Ver espaço em disco
df -h

# Ver uso de memória
free -h

# Ver processos Node
ps aux | grep node
```

---

## 🔒 Segurança

### **1. Configurar SSL/HTTPS (Certbot)**

```bash
# Instalar Certbot
apt install -y certbot python3-certbot-nginx

# Obter certificado SSL (substitua pelo seu domínio)
certbot --nginx -d seudominio.com

# Renovação automática já está configurada
```

### **2. Configurar Senha do MySQL**

```bash
# Conectar no MySQL
mysql -u root -p

# Criar usuário para a aplicação
CREATE USER 'dashboard'@'localhost' IDENTIFIED BY 'senha_forte_aqui';

# Dar permissões
GRANT SELECT ON seu_banco.* TO 'dashboard'@'localhost';
GRANT SELECT ON db_gringao.* TO 'dashboard'@'localhost';

# Aplicar mudanças
FLUSH PRIVILEGES;
```

### **3. Proteger Arquivos Sensíveis**

```bash
# Proteger .env
chmod 600 /var/www/dashboard/backend/.env

# Proteger bancos SQLite
chmod 600 /var/www/dashboard/backend/*.db
chmod 600 /var/www/dashboard/backend/cache/*.db
```

---

## 🔄 Atualização da Aplicação

### **Processo de Atualização:**

```bash
# 1. Conectar na VPS
ssh root@72.60.250.20

# 2. Ir para o diretório
cd /var/www/dashboard

# 3. Fazer backup
./backup.sh

# 4. Atualizar código (Git)
git pull origin main

# 5. Executar deploy
./deploy.sh

# 6. Verificar status
./status.sh
```

---

## 🐛 Troubleshooting

### **Problema: Backend não inicia**

```bash
# Ver logs
pm2 logs dashboard-backend --lines 100

# Verificar porta
netstat -tlnp | grep 3001

# Testar manualmente
cd /var/www/dashboard/backend
node server.js
```

### **Problema: Frontend não carrega**

```bash
# Verificar Nginx
nginx -t
systemctl status nginx

# Ver logs
tail -f /var/log/nginx/dashboard-error.log

# Verificar arquivos
ls -la /var/www/dashboard/frontend/build
```

### **Problema: Erro de conexão com banco**

```bash
# Testar conexão MySQL
mysql -h localhost -u usuario -p

# Verificar .env
cat /var/www/dashboard/backend/.env

# Ver logs do backend
pm2 logs dashboard-backend
```

---

## ✅ Checklist de Deploy

- [ ] VPS acessível via SSH
- [ ] Node.js instalado (v18+)
- [ ] PM2 instalado
- [ ] Nginx instalado
- [ ] Diretórios criados
- [ ] Arquivos transferidos
- [ ] Dependências instaladas (backend)
- [ ] Frontend buildado
- [ ] Arquivo .env configurado
- [ ] PM2 configurado e rodando
- [ ] Nginx configurado
- [ ] Firewall configurado
- [ ] Backup inicial executado
- [ ] Aplicação acessível via navegador
- [ ] Login funcionando
- [ ] Dados carregando corretamente

---

## 🎯 Acesso Final

Após o deploy completo:

**URL:** `http://72.60.250.20`

**Credenciais Admin:**
- Email: `admin@dashboard.com`
- Senha: `admin123`

---

## 📞 Suporte

Em caso de problemas:

1. Verificar logs: `pm2 logs dashboard-backend`
2. Verificar status: `pm2 status`
3. Verificar Nginx: `systemctl status nginx`
4. Verificar firewall: `ufw status`

---

🚀 **Deploy pronto para execução!**

