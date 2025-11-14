# 🚀 Deploy em Produção - Dashboard Produtos

## 📋 Informações do Servidor

```
IP: 72.60.250.20
Usuário: root
Senha: Admingringao1211.
```

## 🗄️ Banco de Dados MySQL

### Schema: db_gringao (E-commerce)
```
Host: 5.161.115.232
Port: 3306
User: app
Senha: lnC3bz5Qy93R
```

### Schema: loja_fisica (Loja Física)
```
Host: 5.161.115.232
Port: 3306
User: app
Senha: lnC3bz5Qy93R
```

---

## 🎯 Métodos de Deploy

### **Método 1: Deploy Automatizado (Linux/Mac)**

```bash
# Dar permissão de execução
chmod +x deploy-to-vps.sh

# Executar deploy
./deploy-to-vps.sh
```

### **Método 2: Deploy Manual (Windows PowerShell)**

**Pré-requisito:** Instalar PuTTY (inclui plink e pscp)
- Download: https://www.putty.org/

```powershell
# Executar script PowerShell
.\deploy-manual.ps1
```

### **Método 3: Deploy Manual Passo a Passo**

Siga as instruções detalhadas abaixo.

---

## 📦 Deploy Manual Passo a Passo

### **Passo 1: Conectar no Servidor**

```bash
ssh root@72.60.250.20
# Senha: Admingringao1211.
```

### **Passo 2: Instalar Dependências do Servidor**

```bash
# Atualizar sistema
apt update && apt upgrade -y

# Instalar Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verificar instalação
node --version  # Deve ser v18+
npm --version

# Instalar PM2 (gerenciador de processos)
npm install -g pm2

# Instalar Nginx
apt install -y nginx

# Instalar Git (opcional)
apt install -y git
```

### **Passo 3: Criar Estrutura de Diretórios**

```bash
# Criar diretórios
mkdir -p /var/www/dashboard/backend/cache
mkdir -p /var/www/dashboard/frontend
mkdir -p /var/www/dashboard/logs

# Navegar para o diretório
cd /var/www/dashboard
```

### **Passo 4: Transferir Arquivos do Backend**

**Do seu computador local (Windows PowerShell):**

```powershell
# Navegar até o projeto
cd C:\Users\thiag\Desktop\dashboardPRODUTOS

# Transferir backend (usando SCP do Windows)
# Opção A: Com WinSCP (GUI) - Recomendado
# Baixe em: https://winscp.net/

# Opção B: Com PowerShell (requer OpenSSH)
scp -r .\backend\* root@72.60.250.20:/var/www/dashboard/backend/
scp .\backend\.env.production root@72.60.250.20:/var/www/dashboard/backend/.env
```

### **Passo 5: Transferir Frontend (após build)**

**No seu computador local:**

```powershell
# Buildar frontend
cd frontend
npm install
npm run build

# Transferir build
scp -r .\dist\* root@72.60.250.20:/var/www/dashboard/frontend/
```

### **Passo 6: Configurar Backend no Servidor**

**De volta no servidor SSH:**

```bash
cd /var/www/dashboard/backend

# Instalar dependências
npm install --production

# Verificar arquivo .env
cat .env

# Ajustar permissões
chmod 600 .env
chmod 755 server.js
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

# Iniciar aplicação
pm2 start ecosystem.config.js

# Salvar configuração
pm2 save

# Configurar PM2 para iniciar no boot
pm2 startup
# Copie e execute o comando que aparecer

# Ver status
pm2 status

# Ver logs
pm2 logs dashboard-backend --lines 50
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
        root /var/www/dashboard/frontend;
        try_files $uri $uri/ /index.html;
        
        # Cache para assets estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
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

# Habilitar Nginx no boot
systemctl enable nginx
```

### **Passo 9: Configurar Firewall**

```bash
# Instalar UFW
apt install -y ufw

# Permitir SSH (IMPORTANTE!)
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

### **Passo 10: Testar Aplicação**

```bash
# Verificar se o backend está rodando
curl http://localhost:3001/health

# Verificar PM2
pm2 status

# Verificar Nginx
systemctl status nginx

# Ver logs do backend
pm2 logs dashboard-backend --lines 20

# Ver logs do Nginx
tail -f /var/log/nginx/dashboard-error.log
```

---

## 🔄 Atualização da Aplicação

### **Script de Atualização Rápida**

```bash
#!/bin/bash
# Salvar como: /var/www/dashboard/update.sh

echo "🔄 Atualizando Dashboard..."

cd /var/www/dashboard/backend

# Parar aplicação
pm2 stop dashboard-backend

# Atualizar dependências (se necessário)
npm install --production

# Reiniciar aplicação
pm2 restart dashboard-backend

# Recarregar Nginx
systemctl reload nginx

echo "✅ Atualização concluída!"
pm2 status
```

### **Atualizar Apenas Frontend**

```bash
# Do seu computador local, após fazer build
cd frontend
npm run build
scp -r .\dist\* root@72.60.250.20:/var/www/dashboard/frontend/

# No servidor, recarregar Nginx
ssh root@72.60.250.20 "systemctl reload nginx"
```

### **Atualizar Apenas Backend**

```bash
# Do seu computador local
scp -r .\backend\* root@72.60.250.20:/var/www/dashboard/backend/

# No servidor
ssh root@72.60.250.20 "cd /var/www/dashboard/backend && npm install --production && pm2 restart dashboard-backend"
```

---

## 📊 Monitoramento

### **Comandos Úteis**

```bash
# Ver status da aplicação
pm2 status

# Ver logs em tempo real
pm2 logs dashboard-backend

# Ver logs das últimas 100 linhas
pm2 logs dashboard-backend --lines 100

# Monitorar recursos
pm2 monit

# Ver informações detalhadas
pm2 show dashboard-backend

# Ver logs do Nginx
tail -f /var/log/nginx/dashboard-access.log
tail -f /var/log/nginx/dashboard-error.log

# Ver uso de recursos do servidor
htop
df -h
free -h
```

### **Script de Status**

```bash
#!/bin/bash
# Salvar como: /var/www/dashboard/status.sh

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

echo "📈 Uso de Memória:"
free -h
echo ""

echo "🔥 Processos Node:"
ps aux | grep node | grep -v grep
```

---

## 🐛 Troubleshooting

### **Problema: Backend não inicia**

```bash
# Ver logs detalhados
pm2 logs dashboard-backend --lines 200

# Verificar se a porta está em uso
netstat -tlnp | grep 3001

# Testar manualmente
cd /var/www/dashboard/backend
node server.js

# Verificar variáveis de ambiente
cat .env
```

### **Problema: Frontend não carrega**

```bash
# Verificar configuração do Nginx
nginx -t

# Ver logs de erro
tail -f /var/log/nginx/dashboard-error.log

# Verificar arquivos do frontend
ls -la /var/www/dashboard/frontend/

# Verificar permissões
chmod -R 755 /var/www/dashboard/frontend/
```

### **Problema: Erro de conexão com banco**

```bash
# Testar conexão MySQL
mysql -h 5.161.115.232 -P 3306 -u app -p
# Senha: lnC3bz5Qy93R

# Verificar se pode acessar os schemas
mysql -h 5.161.115.232 -P 3306 -u app -p -e "SHOW DATABASES;"

# Ver logs do backend
pm2 logs dashboard-backend | grep -i mysql
pm2 logs dashboard-backend | grep -i error
```

### **Problema: Aplicação lenta**

```bash
# Ver uso de recursos
pm2 monit

# Ver processos
htop

# Verificar logs de erro
pm2 logs dashboard-backend --err

# Reiniciar aplicação
pm2 restart dashboard-backend
```

---

## 🔒 Segurança

### **1. Alterar JWT Secret**

```bash
# Editar .env
nano /var/www/dashboard/backend/.env

# Alterar linha:
JWT_SECRET=seu-secret-super-seguro-aqui-$(openssl rand -hex 32)

# Reiniciar aplicação
pm2 restart dashboard-backend
```

### **2. Configurar SSL/HTTPS (Certbot)**

```bash
# Instalar Certbot
apt install -y certbot python3-certbot-nginx

# Obter certificado (substitua pelo seu domínio)
certbot --nginx -d seudominio.com

# Renovação automática já está configurada
# Testar renovação
certbot renew --dry-run
```

### **3. Proteger Arquivos Sensíveis**

```bash
# Proteger .env
chmod 600 /var/www/dashboard/backend/.env

# Proteger bancos SQLite
chmod 600 /var/www/dashboard/backend/*.db
chmod 600 /var/www/dashboard/backend/cache/*.db

# Verificar permissões
ls -la /var/www/dashboard/backend/
```

---

## 📦 Backup

### **Script de Backup**

```bash
#!/bin/bash
# Salvar como: /var/www/dashboard/backup.sh

BACKUP_DIR="/var/backups/dashboard"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

echo "💾 Executando backup..."

# Backup dos bancos SQLite
cd /var/www/dashboard/backend
tar -czf $BACKUP_DIR/sqlite_$DATE.tar.gz cache/*.db auth.db 2>/dev/null

# Backup dos logs
tar -czf $BACKUP_DIR/logs_$DATE.tar.gz ../logs/*.log 2>/dev/null

# Manter apenas últimos 7 backups
cd $BACKUP_DIR
ls -t sqlite_*.tar.gz | tail -n +8 | xargs -r rm
ls -t logs_*.tar.gz | tail -n +8 | xargs -r rm

echo "✅ Backup concluído!"
ls -lh $BACKUP_DIR
```

### **Agendar Backup Automático**

```bash
# Editar crontab
crontab -e

# Adicionar linha para backup diário às 3h da manhã
0 3 * * * /var/www/dashboard/backup.sh >> /var/www/dashboard/logs/backup.log 2>&1
```

---

## ✅ Checklist de Deploy

- [ ] Servidor acessível via SSH
- [ ] Node.js 18+ instalado
- [ ] PM2 instalado globalmente
- [ ] Nginx instalado e configurado
- [ ] Diretórios criados
- [ ] Backend transferido e configurado
- [ ] Frontend buildado e transferido
- [ ] Arquivo `.env` configurado corretamente
- [ ] Dependências do backend instaladas
- [ ] PM2 rodando a aplicação
- [ ] Nginx configurado e rodando
- [ ] Firewall configurado (portas 22, 80, 443)
- [ ] Aplicação acessível via navegador
- [ ] Login funcionando
- [ ] Dados carregando corretamente
- [ ] Backup configurado

---

## 🎯 Acesso Final

**URL:** http://72.60.250.20

**Credenciais padrão:**
- Verificar no banco de dados ou criar novo usuário

---

## 📞 Comandos Rápidos

```bash
# Conectar no servidor
ssh root@72.60.250.20

# Ver status
pm2 status

# Ver logs
pm2 logs dashboard-backend

# Reiniciar backend
pm2 restart dashboard-backend

# Reiniciar Nginx
systemctl restart nginx

# Ver logs do Nginx
tail -f /var/log/nginx/dashboard-error.log

# Executar backup
/var/www/dashboard/backup.sh

# Ver status completo
/var/www/dashboard/status.sh
```

---

🚀 **Deploy pronto para produção!**
