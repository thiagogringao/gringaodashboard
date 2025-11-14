# 📦 Como Transferir Arquivos para o Servidor (Windows)

## 🎯 Métodos Disponíveis

### **Método 1: WinSCP (Recomendado - GUI)**
### **Método 2: PowerShell com SCP**
### **Método 3: FileZilla**

---

## 🥇 Método 1: WinSCP (Mais Fácil)

### **Passo 1: Baixar e Instalar**
1. Baixe o WinSCP: https://winscp.net/eng/download.php
2. Instale o programa

### **Passo 2: Configurar Conexão**
1. Abra o WinSCP
2. Clique em "New Session"
3. Preencha os dados:
   - **File protocol:** SFTP
   - **Host name:** 72.60.250.20
   - **Port number:** 22
   - **User name:** root
   - **Password:** Admingringao1211.
4. Clique em "Save" para salvar a conexão
5. Clique em "Login"

### **Passo 3: Transferir Backend**
1. No lado esquerdo (seu computador), navegue até:
   ```
   C:\Users\thiag\Desktop\dashboardPRODUTOS\backend
   ```

2. No lado direito (servidor), navegue até:
   ```
   /var/www/dashboard/backend
   ```

3. Selecione todos os arquivos do backend (Ctrl+A)
4. Arraste para o lado direito (servidor)
5. Aguarde a transferência

### **Passo 4: Transferir .env de Produção**
1. No lado esquerdo, selecione o arquivo:
   ```
   backend\.env.production
   ```

2. Arraste para o servidor em:
   ```
   /var/www/dashboard/backend/.env
   ```
   (Renomeie para `.env` durante a transferência)

### **Passo 5: Transferir Frontend (após build)**
1. No seu computador, abra PowerShell e execute:
   ```powershell
   cd C:\Users\thiag\Desktop\dashboardPRODUTOS\frontend
   npm install
   npm run build
   ```

2. No WinSCP, navegue no lado esquerdo até:
   ```
   C:\Users\thiag\Desktop\dashboardPRODUTOS\frontend\dist
   ```

3. No lado direito (servidor), navegue até:
   ```
   /var/www/dashboard/frontend
   ```

4. Selecione todos os arquivos da pasta `dist` (Ctrl+A)
5. Arraste para o lado direito (servidor)

### **Passo 6: Transferir Scripts do Servidor**
1. No lado esquerdo, navegue até:
   ```
   C:\Users\thiag\Desktop\dashboardPRODUTOS\server-scripts
   ```

2. No lado direito, navegue até:
   ```
   /var/www/dashboard
   ```

3. Selecione todos os arquivos `.sh`
4. Arraste para o servidor

---

## 🥈 Método 2: PowerShell com SCP

### **Pré-requisitos**
Windows 10 (versão 1809+) ou Windows 11 já tem OpenSSH instalado.

### **Verificar se SCP está disponível**
```powershell
scp
```

Se não estiver disponível, instale OpenSSH:
```powershell
# Executar como Administrador
Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0
```

### **Transferir Backend**
```powershell
# Navegar até o projeto
cd C:\Users\thiag\Desktop\dashboardPRODUTOS

# Transferir backend (todos os arquivos)
scp -r .\backend\* root@72.60.250.20:/var/www/dashboard/backend/

# Transferir .env de produção
scp .\backend\.env.production root@72.60.250.20:/var/www/dashboard/backend/.env
```

### **Buildar e Transferir Frontend**
```powershell
# Buildar frontend
cd frontend
npm install
npm run build

# Transferir build
scp -r .\dist\* root@72.60.250.20:/var/www/dashboard/frontend/

# Voltar para raiz do projeto
cd ..
```

### **Transferir Scripts**
```powershell
# Transferir scripts do servidor
scp .\server-scripts\*.sh root@72.60.250.20:/var/www/dashboard/
```

**Nota:** O SCP pedirá a senha a cada comando: `Admingringao1211.`

---

## 🥉 Método 3: FileZilla

### **Passo 1: Baixar e Instalar**
1. Baixe o FileZilla: https://filezilla-project.org/
2. Instale o programa

### **Passo 2: Configurar Conexão**
1. Abra o FileZilla
2. Vá em "File" > "Site Manager"
3. Clique em "New Site"
4. Preencha os dados:
   - **Protocol:** SFTP - SSH File Transfer Protocol
   - **Host:** 72.60.250.20
   - **Port:** 22
   - **Logon Type:** Normal
   - **User:** root
   - **Password:** Admingringao1211.
5. Clique em "Connect"

### **Passo 3: Transferir Arquivos**
Siga os mesmos passos do WinSCP (Método 1), mas usando a interface do FileZilla.

---

## 📋 Checklist de Transferência

### **Backend**
- [ ] Todos os arquivos da pasta `backend/`
- [ ] Arquivo `.env.production` renomeado para `.env`
- [ ] Pasta `cache/` criada (vazia)
- [ ] Permissões corretas (será ajustado no servidor)

### **Frontend**
- [ ] Build executado (`npm run build`)
- [ ] Todos os arquivos da pasta `dist/` transferidos
- [ ] Arquivos na pasta `/var/www/dashboard/frontend/`

### **Scripts**
- [ ] Todos os arquivos `.sh` da pasta `server-scripts/`
- [ ] Scripts na pasta `/var/www/dashboard/`
- [ ] Permissões de execução (será ajustado no servidor)

---

## 🔧 Após Transferir os Arquivos

### **Conectar no Servidor via SSH**

**Opção A: PuTTY (GUI)**
1. Baixe o PuTTY: https://www.putty.org/
2. Abra o PuTTY
3. Em "Host Name": 72.60.250.20
4. Em "Port": 22
5. Clique em "Open"
6. Login: root
7. Password: Admingringao1211.

**Opção B: PowerShell**
```powershell
ssh root@72.60.250.20
# Senha: Admingringao1211.
```

### **Configurar Permissões e Instalar Dependências**

```bash
# Ajustar permissões dos scripts
cd /var/www/dashboard
chmod +x *.sh

# Ajustar permissões do .env
chmod 600 backend/.env

# Instalar dependências do backend
cd backend
npm install --production

# Verificar se os arquivos estão corretos
ls -la
cat .env
```

### **Iniciar Aplicação**

```bash
# Criar configuração do PM2
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

# Iniciar com PM2
pm2 start ecosystem.config.js
pm2 save

# Verificar status
pm2 status
pm2 logs dashboard-backend
```

---

## 🐛 Problemas Comuns

### **Erro: "Permission denied"**
```bash
# No servidor, ajustar permissões
chmod -R 755 /var/www/dashboard
chmod 600 /var/www/dashboard/backend/.env
```

### **Erro: "Connection refused"**
- Verifique se o IP está correto: 72.60.250.20
- Verifique se a porta SSH (22) está aberta
- Verifique se o firewall do Windows não está bloqueando

### **Erro: "Host key verification failed"**
```powershell
# Remover chave antiga (se existir)
ssh-keygen -R 72.60.250.20

# Tentar conectar novamente
ssh root@72.60.250.20
```

### **Arquivos não aparecem no servidor**
- Verifique se transferiu para o diretório correto
- Verifique se a transferência foi concluída (sem erros)
- No servidor, execute: `ls -la /var/www/dashboard/backend/`

---

## 📊 Verificar Transferência

### **No Servidor (via SSH)**

```bash
# Verificar estrutura
tree -L 2 /var/www/dashboard

# Ou
ls -la /var/www/dashboard/backend/
ls -la /var/www/dashboard/frontend/

# Verificar tamanho dos arquivos
du -sh /var/www/dashboard/backend/
du -sh /var/www/dashboard/frontend/

# Verificar se .env existe
cat /var/www/dashboard/backend/.env
```

---

## 🎯 Resumo Rápido

### **Método Mais Fácil (WinSCP):**
1. Instalar WinSCP
2. Conectar no servidor (72.60.250.20)
3. Arrastar arquivos do backend
4. Buildar frontend (`npm run build`)
5. Arrastar arquivos do frontend (pasta `dist`)
6. Conectar via SSH (PuTTY ou PowerShell)
7. Executar comandos de configuração

### **Método Mais Rápido (PowerShell SCP):**
```powershell
# Backend
scp -r .\backend\* root@72.60.250.20:/var/www/dashboard/backend/
scp .\backend\.env.production root@72.60.250.20:/var/www/dashboard/backend/.env

# Frontend (após build)
cd frontend
npm run build
scp -r .\dist\* root@72.60.250.20:/var/www/dashboard/frontend/
```

---

## 📞 Próximos Passos

Após transferir os arquivos:
1. ✅ Conectar no servidor via SSH
2. ✅ Ajustar permissões
3. ✅ Instalar dependências
4. ✅ Configurar PM2
5. ✅ Configurar Nginx
6. ✅ Testar aplicação

Veja o guia completo em: **[DEPLOY_PRODUCAO.md](./DEPLOY_PRODUCAO.md)**

---

🚀 **Pronto para transferir!**
