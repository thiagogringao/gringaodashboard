# 🛠️ Scripts do Servidor

Scripts utilitários para gerenciar a aplicação no servidor VPS.

## 📋 Scripts Disponíveis

### 🔧 `install-dependencies.sh`
Instala todas as dependências necessárias no servidor.

**Uso:**
```bash
chmod +x install-dependencies.sh
./install-dependencies.sh
```

**Instala:**
- Node.js 18.x
- PM2
- Nginx
- Git
- UFW (firewall)
- htop

---

### 📁 `setup-structure.sh`
Cria a estrutura de diretórios necessária.

**Uso:**
```bash
chmod +x setup-structure.sh
./setup-structure.sh
```

**Cria:**
- `/var/www/dashboard/backend/cache`
- `/var/www/dashboard/frontend`
- `/var/www/dashboard/logs`
- `/var/backups/dashboard`

---

### 📊 `status.sh`
Exibe status completo da aplicação.

**Uso:**
```bash
chmod +x status.sh
./status.sh
```

**Mostra:**
- Status do PM2
- Status do Nginx
- Espaço em disco
- Uso de memória
- Processos Node
- Bancos SQLite
- Últimos logs

---

### 📋 `logs.sh`
Menu interativo para visualizar logs.

**Uso:**
```bash
chmod +x logs.sh
./logs.sh
```

**Opções:**
1. Logs do Backend (Tempo Real)
2. Logs do Backend (Últimas 100 linhas)
3. Logs do Nginx - Access
4. Logs do Nginx - Error
5. Todos os logs (resumo)
6. Logs de erro apenas

---

### 💾 `backup.sh`
Faz backup dos dados da aplicação.

**Uso:**
```bash
chmod +x backup.sh
./backup.sh
```

**Backup de:**
- Bancos SQLite (cache/*.db, auth.db)
- Logs da aplicação
- Arquivo .env
- Mantém últimos 7 backups

**Backups salvos em:** `/var/backups/dashboard/`

---

### 🔄 `update.sh`
Atualiza a aplicação sem downtime.

**Uso:**
```bash
chmod +x update.sh
./update.sh
```

**Processo:**
1. Faz backup antes de atualizar
2. Para aplicação
3. Atualiza dependências
4. Reinicia aplicação
5. Recarrega Nginx
6. Verifica status

---

## 🚀 Instalação dos Scripts

### Transferir Scripts para o Servidor

**Opção 1: Via WinSCP**
1. Conectar no servidor (72.60.250.20)
2. Navegar até `/var/www/dashboard/`
3. Arrastar todos os arquivos `.sh`

**Opção 2: Via SCP (PowerShell)**
```powershell
scp .\server-scripts\*.sh root@72.60.250.20:/var/www/dashboard/
```

**Opção 3: Manualmente (SSH)**
```bash
# Conectar no servidor
ssh root@72.60.250.20

# Criar arquivos manualmente
cd /var/www/dashboard
nano install-dependencies.sh
# Copiar conteúdo do arquivo
# Salvar: Ctrl+O, Enter, Ctrl+X

# Repetir para cada script
```

### Dar Permissão de Execução

```bash
# Conectar no servidor
ssh root@72.60.250.20

# Navegar até o diretório
cd /var/www/dashboard

# Dar permissão para todos os scripts
chmod +x *.sh

# Verificar
ls -la *.sh
```

---

## 📖 Guia de Uso

### Primeira Instalação

```bash
# 1. Instalar dependências
./install-dependencies.sh

# 2. Criar estrutura
./setup-structure.sh

# 3. Transferir arquivos da aplicação (backend e frontend)
# (Usar WinSCP ou SCP)

# 4. Verificar status
./status.sh
```

### Uso Diário

```bash
# Ver status da aplicação
./status.sh

# Ver logs
./logs.sh

# Fazer backup
./backup.sh
```

### Atualização

```bash
# Atualizar aplicação
./update.sh

# Verificar se atualizou corretamente
./status.sh
./logs.sh
```

---

## 🔧 Comandos Complementares

### PM2

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs dashboard-backend

# Reiniciar
pm2 restart dashboard-backend

# Parar
pm2 stop dashboard-backend

# Iniciar
pm2 start dashboard-backend

# Monitorar
pm2 monit
```

### Nginx

```bash
# Testar configuração
nginx -t

# Recarregar
systemctl reload nginx

# Reiniciar
systemctl restart nginx

# Ver status
systemctl status nginx

# Ver logs
tail -f /var/log/nginx/dashboard-access.log
tail -f /var/log/nginx/dashboard-error.log
```

---

## 🐛 Troubleshooting

### Script não executa

```bash
# Verificar permissões
ls -la *.sh

# Dar permissão
chmod +x nome-do-script.sh

# Verificar se tem caracteres Windows (CRLF)
dos2unix nome-do-script.sh
# Ou
sed -i 's/\r$//' nome-do-script.sh
```

### Erro: "command not found"

```bash
# Executar com caminho completo
/var/www/dashboard/status.sh

# Ou navegar até o diretório
cd /var/www/dashboard
./status.sh
```

---

## 📁 Estrutura de Diretórios

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
│   └── (arquivos do build)
├── logs/
│   ├── backend-error.log
│   └── backend-out.log
├── install-dependencies.sh
├── setup-structure.sh
├── status.sh
├── logs.sh
├── backup.sh
└── update.sh

/var/backups/dashboard/
├── sqlite_YYYYMMDD_HHMMSS.tar.gz
├── logs_YYYYMMDD_HHMMSS.tar.gz
└── env_YYYYMMDD_HHMMSS.backup
```

---

## 🎯 Atalhos (Opcional)

Criar aliases para facilitar o uso:

```bash
# Editar .bashrc
nano ~/.bashrc

# Adicionar no final:
alias dashboard-status='/var/www/dashboard/status.sh'
alias dashboard-logs='/var/www/dashboard/logs.sh'
alias dashboard-backup='/var/www/dashboard/backup.sh'
alias dashboard-update='/var/www/dashboard/update.sh'

# Recarregar
source ~/.bashrc

# Agora você pode usar:
dashboard-status
dashboard-logs
dashboard-backup
dashboard-update
```

---

## 📞 Informações Importantes

**Servidor:** 72.60.250.20  
**Usuário:** root  
**Senha:** Admingringao1211.

**Diretório da Aplicação:** `/var/www/dashboard`  
**Diretório de Backups:** `/var/backups/dashboard`

**Banco de Dados:**
- Host: 5.161.115.232
- Port: 3306
- User: app
- Senha: lnC3bz5Qy93R

---

## 📚 Documentação Adicional

- **[DEPLOY_README.md](../DEPLOY_README.md)** - Guia de início rápido
- **[DEPLOY_PRODUCAO.md](../DEPLOY_PRODUCAO.md)** - Guia completo de deploy
- **[COMANDOS_RAPIDOS.md](../COMANDOS_RAPIDOS.md)** - Referência de comandos
- **[GUIA_VISUAL_DEPLOY.md](../GUIA_VISUAL_DEPLOY.md)** - Guia visual passo a passo

---

🛠️ **Scripts prontos para uso!**
