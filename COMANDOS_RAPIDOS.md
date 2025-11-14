# ⚡ Comandos Rápidos - Dashboard Produtos

## 🔐 Conectar no Servidor

```bash
ssh root@72.60.250.20
# Senha: Admingringao1211.
```

---

## 🚀 Deploy

### Deploy Completo (Windows)
```powershell
.\deploy-manual.ps1
```

### Deploy Completo (Linux/Mac)
```bash
chmod +x deploy-to-vps.sh
./deploy-to-vps.sh
```

---

## 📊 Monitoramento

### Ver Status
```bash
# Status completo
/var/www/dashboard/status.sh

# Status PM2
pm2 status

# Status Nginx
systemctl status nginx
```

### Ver Logs
```bash
# Menu interativo de logs
/var/www/dashboard/logs.sh

# Logs em tempo real
pm2 logs dashboard-backend

# Últimas 100 linhas
pm2 logs dashboard-backend --lines 100

# Apenas erros
pm2 logs dashboard-backend --err
```

---

## 🔄 Gerenciamento da Aplicação

### Reiniciar
```bash
# Reiniciar backend
pm2 restart dashboard-backend

# Reiniciar Nginx
systemctl restart nginx

# Reiniciar tudo
pm2 restart dashboard-backend && systemctl restart nginx
```

### Parar/Iniciar
```bash
# Parar backend
pm2 stop dashboard-backend

# Iniciar backend
pm2 start dashboard-backend

# Parar Nginx
systemctl stop nginx

# Iniciar Nginx
systemctl start nginx
```

### Recarregar (sem downtime)
```bash
# Recarregar backend
pm2 reload dashboard-backend

# Recarregar Nginx
systemctl reload nginx
```

---

## 🔄 Atualização

### Atualização Completa
```bash
/var/www/dashboard/update.sh
```

### Atualizar Apenas Backend
```bash
cd /var/www/dashboard/backend
npm install --production
pm2 restart dashboard-backend
```

### Atualizar Apenas Frontend
```bash
# Do seu computador local (após build)
cd frontend
npm run build
scp -r .\dist\* root@72.60.250.20:/var/www/dashboard/frontend/

# No servidor
systemctl reload nginx
```

---

## 💾 Backup

### Executar Backup Manual
```bash
/var/www/dashboard/backup.sh
```

### Ver Backups
```bash
ls -lh /var/backups/dashboard/
```

### Restaurar Backup
```bash
# Listar backups disponíveis
ls -lh /var/backups/dashboard/

# Restaurar banco SQLite
cd /var/www/dashboard/backend
tar -xzf /var/backups/dashboard/sqlite_YYYYMMDD_HHMMSS.tar.gz

# Reiniciar aplicação
pm2 restart dashboard-backend
```

---

## 🔍 Diagnóstico

### Verificar Saúde da Aplicação
```bash
# Health check do backend
curl http://localhost:3001/health

# Testar API
curl http://localhost:3001/api/produtos/estatisticas

# Verificar portas
netstat -tlnp | grep -E '3001|80'
```

### Verificar Recursos
```bash
# Uso de CPU e memória
htop

# Espaço em disco
df -h

# Uso de memória
free -h

# Processos Node
ps aux | grep node
```

### Verificar Conexão com Banco
```bash
# Testar conexão MySQL
mysql -h 5.161.115.232 -P 3306 -u app -p
# Senha: lnC3bz5Qy93R

# Listar databases
mysql -h 5.161.115.232 -P 3306 -u app -p -e "SHOW DATABASES;"
```

---

## 🐛 Troubleshooting

### Backend não inicia
```bash
# Ver logs detalhados
pm2 logs dashboard-backend --lines 200

# Verificar porta em uso
netstat -tlnp | grep 3001

# Testar manualmente
cd /var/www/dashboard/backend
node server.js

# Verificar .env
cat /var/www/dashboard/backend/.env
```

### Frontend não carrega
```bash
# Verificar Nginx
nginx -t
systemctl status nginx

# Ver logs de erro
tail -f /var/log/nginx/dashboard-error.log

# Verificar arquivos
ls -la /var/www/dashboard/frontend/

# Verificar permissões
chmod -R 755 /var/www/dashboard/frontend/
```

### Erro de conexão com banco
```bash
# Ver logs do backend
pm2 logs dashboard-backend | grep -i mysql
pm2 logs dashboard-backend | grep -i error

# Testar conexão
mysql -h 5.161.115.232 -P 3306 -u app -p -e "SELECT 1;"
```

### Aplicação lenta
```bash
# Monitorar recursos
pm2 monit

# Ver processos
htop

# Ver logs de erro
pm2 logs dashboard-backend --err

# Reiniciar
pm2 restart dashboard-backend
```

---

## 🔧 Configuração

### Editar Variáveis de Ambiente
```bash
nano /var/www/dashboard/backend/.env

# Após editar, reiniciar
pm2 restart dashboard-backend
```

### Editar Configuração do Nginx
```bash
nano /etc/nginx/sites-available/dashboard

# Testar configuração
nginx -t

# Recarregar
systemctl reload nginx
```

### Ver Configuração do PM2
```bash
cat /var/www/dashboard/backend/ecosystem.config.js

# Ver informações detalhadas
pm2 show dashboard-backend
```

---

## 🔒 Segurança

### Verificar Firewall
```bash
# Status do firewall
ufw status

# Permitir porta
ufw allow 80/tcp

# Bloquear porta
ufw deny 8080/tcp
```

### Verificar Permissões
```bash
# Verificar permissões dos arquivos
ls -la /var/www/dashboard/backend/

# Proteger .env
chmod 600 /var/www/dashboard/backend/.env

# Proteger bancos SQLite
chmod 600 /var/www/dashboard/backend/*.db
chmod 600 /var/www/dashboard/backend/cache/*.db
```

---

## 📦 Instalação Inicial

### Instalar Dependências do Servidor
```bash
# Executar script de instalação
chmod +x /var/www/dashboard/install-dependencies.sh
/var/www/dashboard/install-dependencies.sh
```

### Criar Estrutura de Diretórios
```bash
chmod +x /var/www/dashboard/setup-structure.sh
/var/www/dashboard/setup-structure.sh
```

---

## 🎯 Atalhos Úteis

### Criar Aliases (Opcional)
```bash
# Adicionar ao ~/.bashrc
nano ~/.bashrc

# Adicionar no final:
alias dashboard-status='/var/www/dashboard/status.sh'
alias dashboard-logs='/var/www/dashboard/logs.sh'
alias dashboard-backup='/var/www/dashboard/backup.sh'
alias dashboard-update='/var/www/dashboard/update.sh'
alias dashboard-restart='pm2 restart dashboard-backend && systemctl reload nginx'

# Recarregar
source ~/.bashrc

# Agora você pode usar:
dashboard-status
dashboard-logs
dashboard-backup
dashboard-update
dashboard-restart
```

---

## 📞 Informações Importantes

### URLs
- **Frontend:** http://72.60.250.20
- **API:** http://72.60.250.20/api
- **Health Check:** http://72.60.250.20/api/health (se existir)

### Diretórios
- **Aplicação:** `/var/www/dashboard`
- **Backend:** `/var/www/dashboard/backend`
- **Frontend:** `/var/www/dashboard/frontend`
- **Logs:** `/var/www/dashboard/logs`
- **Backups:** `/var/backups/dashboard`

### Banco de Dados
- **Host:** 5.161.115.232
- **Port:** 3306
- **User:** app
- **Password:** lnC3bz5Qy93R
- **Schemas:** db_gringao, loja_fisica

---

## 🆘 Comandos de Emergência

### Aplicação travada
```bash
# Parar tudo
pm2 stop all
systemctl stop nginx

# Matar processos Node
pkill -9 node

# Reiniciar tudo
pm2 start dashboard-backend
systemctl start nginx
```

### Disco cheio
```bash
# Ver uso de disco
df -h

# Limpar logs antigos
find /var/log -name "*.log" -mtime +30 -delete
pm2 flush

# Limpar cache do npm
npm cache clean --force

# Limpar backups antigos
find /var/backups/dashboard -name "*.tar.gz" -mtime +7 -delete
```

### Memória cheia
```bash
# Ver uso de memória
free -h

# Reiniciar aplicação
pm2 restart dashboard-backend

# Limpar cache do sistema
sync; echo 3 > /proc/sys/vm/drop_caches
```

---

⚡ **Comandos prontos para uso!**
