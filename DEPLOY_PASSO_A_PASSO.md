# 🚀 DEPLOY NO NOVO SERVIDOR - PASSO A PASSO

## 📋 Informações do Servidor

```
🖥️  NOVO SERVIDOR VPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IP:       72.61.40.170
Usuário:  root
Senha:    Admingringao1211.

🗄️  BANCO DE DADOS MYSQL (mesmo de antes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Host:     5.161.115.232
Port:     3306
User:     app
Senha:    lnC3bz5Qy93R
Schemas:  db_gringao, loja_fisica
```

---

## ✅ O QUE JÁ ESTÁ PRONTO

- ✅ Frontend buildado com novo IP
- ✅ Configurações atualizadas (.env.production)
- ✅ Script de deploy criado (DEPLOY_NOVO_SERVIDOR.sh)

---

## 🎯 EXECUTE O DEPLOY EM 3 PASSOS

### **PASSO 1: Transferir Arquivos** (5 minutos)

#### Via WinSCP (Recomendado):

1. **Conectar no servidor:**
   - Host: `72.61.40.170`
   - User: `root`
   - Password: `Admingringao1211.`

2. **Criar diretórios no servidor:**
   - `/var/www/dashboard/backend`
   - `/var/www/dashboard/frontend`

3. **Transferir arquivos:**

   **Backend:**
   ```
   LOCAL: C:\Users\thiag\Desktop\dashboardPRODUTOS\backend\*
   SERVIDOR: /var/www/dashboard/backend/
   ```

   **.env de produção:**
   ```
   LOCAL: C:\Users\thiag\Desktop\dashboardPRODUTOS\backend\.env.production
   SERVIDOR: /var/www/dashboard/backend/.env
   (RENOMEAR para .env - remover .production)
   ```

   **Frontend:**
   ```
   LOCAL: C:\Users\thiag\Desktop\dashboardPRODUTOS\frontend\dist\*
   SERVIDOR: /var/www/dashboard/frontend/
   ```

   **Script de deploy:**
   ```
   LOCAL: C:\Users\thiag\Desktop\dashboardPRODUTOS\DEPLOY_NOVO_SERVIDOR.sh
   SERVIDOR: /root/
   ```

#### Via SCP (PowerShell):

```powershell
# Transferir backend
scp -r .\backend\* root@72.61.40.170:/var/www/dashboard/backend/

# Transferir .env
scp .\backend\.env.production root@72.61.40.170:/var/www/dashboard/backend/.env

# Transferir frontend
scp -r .\frontend\dist\* root@72.61.40.170:/var/www/dashboard/frontend/

# Transferir script
scp .\DEPLOY_NOVO_SERVIDOR.sh root@72.61.40.170:/root/
```

---

### **PASSO 2: Conectar no Servidor** (1 minuto)

```powershell
ssh root@72.61.40.170
# Senha: Admingringao1211.
```

---

### **PASSO 3: Executar Deploy** (5 minutos)

```bash
# Dar permissão de execução
chmod +x /root/DEPLOY_NOVO_SERVIDOR.sh

# Executar script
bash /root/DEPLOY_NOVO_SERVIDOR.sh
```

**O script irá:**
- ✅ Atualizar sistema
- ✅ Instalar Node.js 18.x
- ✅ Instalar PM2
- ✅ Instalar Nginx
- ✅ Criar diretórios
- ✅ Verificar arquivos transferidos
- ✅ Instalar dependências do backend
- ✅ Ajustar permissões
- ✅ Configurar PM2 (2 instâncias em cluster)
- ✅ Iniciar aplicação
- ✅ Configurar Nginx
- ✅ Configurar firewall (portas 22, 80, 443)
- ✅ Verificar status

---

## 🎉 PRONTO!

Acesse no navegador: **http://72.61.40.170**

---

## 📊 Verificar Status

```bash
# Ver status do PM2
pm2 status

# Ver logs em tempo real
pm2 logs dashboard-backend

# Ver logs das últimas 50 linhas
pm2 logs dashboard-backend --lines 50

# Monitorar recursos
pm2 monit

# Ver logs do Nginx
tail -f /var/log/nginx/dashboard-error.log

# Testar backend diretamente
curl http://localhost:3001/health
```

---

## 🔧 Comandos Úteis

```bash
# Reiniciar aplicação
pm2 restart dashboard-backend

# Parar aplicação
pm2 stop dashboard-backend

# Iniciar aplicação
pm2 start dashboard-backend

# Reiniciar Nginx
systemctl restart nginx

# Ver status do Nginx
systemctl status nginx

# Testar configuração do Nginx
nginx -t

# Ver status do firewall
ufw status
```

---

## 🐛 Troubleshooting

### Backend não inicia

```bash
# Ver logs detalhados
pm2 logs dashboard-backend --lines 100

# Verificar se a porta está em uso
netstat -tlnp | grep 3001

# Testar manualmente
cd /var/www/dashboard/backend
node server.js
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
```

### Erro de conexão com banco

```bash
# Testar conexão MySQL
mysql -h 5.161.115.232 -P 3306 -u app -p
# Senha: lnC3bz5Qy93R

# Ver logs do backend relacionados ao banco
pm2 logs dashboard-backend | grep -i mysql
pm2 logs dashboard-backend | grep -i error
```

### Aplicação lenta

```bash
# Monitorar recursos
pm2 monit

# Ver uso de CPU e memória
htop

# Ver processos Node
ps aux | grep node

# Reiniciar aplicação
pm2 restart dashboard-backend
```

---

## 📝 Checklist de Deploy

- [ ] Arquivos do backend transferidos
- [ ] Arquivo .env transferido e renomeado
- [ ] Frontend buildado e transferido
- [ ] Script de deploy transferido
- [ ] Script executado com sucesso
- [ ] PM2 rodando (2 instâncias)
- [ ] Nginx configurado e rodando
- [ ] Firewall configurado
- [ ] Aplicação acessível no navegador
- [ ] APIs funcionando

---

## 🔒 Segurança

### Portas Abertas
- ✅ 22 (SSH)
- ✅ 80 (HTTP)
- ✅ 443 (HTTPS - para futuro SSL)

### Arquivos Protegidos
- ✅ .env (chmod 600)
- ✅ Bancos SQLite (chmod 600)

### Próximos Passos de Segurança
1. Configurar SSL/HTTPS com Let's Encrypt
2. Configurar chave SSH ao invés de senha
3. Desabilitar login root direto
4. Configurar fail2ban

---

## 📞 Informações Importantes

**URL da Aplicação:** http://72.61.40.170

**SSH:** `ssh root@72.61.40.170`

**Diretórios:**
- Aplicação: `/var/www/dashboard`
- Backend: `/var/www/dashboard/backend`
- Frontend: `/var/www/dashboard/frontend`
- Logs: `/var/www/dashboard/logs`
- Backups: `/var/backups/dashboard`

**Logs:**
- PM2: `/var/www/dashboard/logs/`
- Nginx Access: `/var/log/nginx/dashboard-access.log`
- Nginx Error: `/var/log/nginx/dashboard-error.log`

---

## 🎯 Resumo Rápido

```bash
# 1. Transferir arquivos (WinSCP ou SCP)
# 2. Conectar no servidor
ssh root@72.61.40.170

# 3. Executar deploy
chmod +x /root/DEPLOY_NOVO_SERVIDOR.sh
bash /root/DEPLOY_NOVO_SERVIDOR.sh

# 4. Acessar
# http://72.61.40.170
```

---

🚀 **Boa sorte com o deploy no novo servidor!**
