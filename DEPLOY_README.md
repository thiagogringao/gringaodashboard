# 🚀 Deploy Dashboard Produtos - Guia Rápido

## 📋 Informações do Servidor

```
🖥️  Servidor VPS
IP: 72.60.250.20
Usuário: root
Senha: Admingringao1211.

🗄️  Banco de Dados MySQL
Host: 5.161.115.232
Port: 3306
User: app
Senha: lnC3bz5Qy93R
Schemas: db_gringao (e-commerce), loja_fisica (loja física)
```

---

## ⚡ Início Rápido

### **Opção 1: Deploy Automatizado (Recomendado)**

#### Windows (PowerShell)
```powershell
# Executar script de deploy
.\deploy-manual.ps1
```

#### Linux/Mac (Bash)
```bash
# Dar permissão
chmod +x deploy-to-vps.sh

# Executar
./deploy-to-vps.sh
```

### **Opção 2: Deploy Manual**

Siga o guia completo em: **[DEPLOY_PRODUCAO.md](./DEPLOY_PRODUCAO.md)**

---

## 📁 Arquivos Criados

### **Configuração**
- ✅ `backend/.env.production` - Configurações de produção do backend
- ✅ `frontend/.env.production` - Configurações de produção do frontend

### **Scripts de Deploy**
- ✅ `deploy-to-vps.sh` - Deploy automatizado (Linux/Mac)
- ✅ `deploy-manual.ps1` - Deploy automatizado (Windows)

### **Scripts do Servidor** (pasta `server-scripts/`)
- ✅ `install-dependencies.sh` - Instalar dependências no servidor
- ✅ `setup-structure.sh` - Criar estrutura de diretórios
- ✅ `status.sh` - Verificar status da aplicação
- ✅ `logs.sh` - Visualizar logs (menu interativo)
- ✅ `backup.sh` - Fazer backup dos dados
- ✅ `update.sh` - Atualizar aplicação

### **Documentação**
- ✅ `DEPLOY_PRODUCAO.md` - Guia completo de deploy
- ✅ `COMANDOS_RAPIDOS.md` - Comandos úteis para o dia a dia
- ✅ `DEPLOY_README.md` - Este arquivo

---

## 🎯 Processo de Deploy (Resumo)

### **1. Preparar Servidor**
```bash
# Conectar no servidor
ssh root@72.60.250.20

# Instalar dependências
curl -o install-dependencies.sh https://raw.githubusercontent.com/.../install-dependencies.sh
chmod +x install-dependencies.sh
./install-dependencies.sh
```

### **2. Executar Deploy**

**Do seu computador:**
```powershell
# Windows
.\deploy-manual.ps1

# Ou Linux/Mac
./deploy-to-vps.sh
```

### **3. Verificar Deploy**
```bash
# Conectar no servidor
ssh root@72.60.250.20

# Verificar status
pm2 status
systemctl status nginx

# Acessar aplicação
curl http://localhost:3001/health
```

### **4. Acessar Aplicação**
Abra no navegador: **http://72.60.250.20**

---

## 📊 Comandos Essenciais

### **Monitoramento**
```bash
# Ver status
pm2 status

# Ver logs
pm2 logs dashboard-backend

# Monitorar recursos
pm2 monit
```

### **Gerenciamento**
```bash
# Reiniciar backend
pm2 restart dashboard-backend

# Reiniciar Nginx
systemctl restart nginx

# Ver status completo
/var/www/dashboard/status.sh
```

### **Backup**
```bash
# Fazer backup
/var/www/dashboard/backup.sh

# Ver backups
ls -lh /var/backups/dashboard/
```

### **Atualização**
```bash
# Atualizar aplicação
/var/www/dashboard/update.sh
```

---

## 🔧 Estrutura no Servidor

```
/var/www/dashboard/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env (configurações de produção)
│   ├── cache/ (bancos SQLite)
│   └── auth.db
├── frontend/
│   └── (arquivos do build React)
├── logs/
│   ├── backend-error.log
│   └── backend-out.log
├── status.sh
├── logs.sh
├── backup.sh
└── update.sh

/var/backups/dashboard/
├── sqlite_YYYYMMDD_HHMMSS.tar.gz
└── logs_YYYYMMDD_HHMMSS.tar.gz
```

---

## 🐛 Troubleshooting

### **Backend não inicia**
```bash
# Ver logs
pm2 logs dashboard-backend --lines 100

# Verificar porta
netstat -tlnp | grep 3001

# Testar manualmente
cd /var/www/dashboard/backend
node server.js
```

### **Frontend não carrega**
```bash
# Verificar Nginx
nginx -t
systemctl status nginx

# Ver logs
tail -f /var/log/nginx/dashboard-error.log
```

### **Erro de conexão com banco**
```bash
# Testar conexão
mysql -h 5.161.115.232 -P 3306 -u app -p
# Senha: lnC3bz5Qy93R

# Ver logs do backend
pm2 logs dashboard-backend | grep -i mysql
```

---

## 📚 Documentação Completa

- **[DEPLOY_PRODUCAO.md](./DEPLOY_PRODUCAO.md)** - Guia completo de deploy passo a passo
- **[COMANDOS_RAPIDOS.md](./COMANDOS_RAPIDOS.md)** - Referência rápida de comandos
- **[DEPLOY_VPS.md](./DEPLOY_VPS.md)** - Documentação anterior (referência)

---

## ✅ Checklist de Deploy

- [ ] Servidor acessível via SSH
- [ ] Node.js 18+ instalado
- [ ] PM2 instalado
- [ ] Nginx instalado
- [ ] Arquivos transferidos
- [ ] Backend configurado (`.env`)
- [ ] Frontend buildado
- [ ] PM2 rodando
- [ ] Nginx configurado
- [ ] Firewall configurado
- [ ] Aplicação acessível
- [ ] Backup configurado

---

## 🆘 Suporte

### **Comandos de Emergência**

```bash
# Reiniciar tudo
pm2 restart dashboard-backend
systemctl restart nginx

# Ver todos os logs
pm2 logs dashboard-backend
tail -f /var/log/nginx/dashboard-error.log

# Verificar saúde
curl http://localhost:3001/health
```

### **Contatos**
- Documentação: Ver arquivos `.md` neste diretório
- Logs: `/var/www/dashboard/logs/`
- Backups: `/var/backups/dashboard/`

---

## 🎉 Próximos Passos

Após o deploy bem-sucedido:

1. ✅ Testar todas as funcionalidades
2. ✅ Configurar backup automático (cron)
3. ✅ Configurar SSL/HTTPS (Certbot)
4. ✅ Configurar monitoramento
5. ✅ Documentar credenciais de acesso

---

## 📞 Acesso Rápido

**URL da Aplicação:** http://72.60.250.20

**SSH:** `ssh root@72.60.250.20`

**Ver Status:** `pm2 status`

**Ver Logs:** `pm2 logs dashboard-backend`

---

🚀 **Pronto para deploy!**

Para começar, execute:
```powershell
.\deploy-manual.ps1
```

Ou siga o guia completo em **[DEPLOY_PRODUCAO.md](./DEPLOY_PRODUCAO.md)**
