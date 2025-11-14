# 📚 Índice Completo - Documentação de Deploy

## 🎯 Por Onde Começar?

### **Nunca fez deploy antes?**
👉 Comece aqui: **[INICIO_RAPIDO.md](./INICIO_RAPIDO.md)**

### **Quer um guia visual passo a passo?**
👉 Veja: **[GUIA_VISUAL_DEPLOY.md](./GUIA_VISUAL_DEPLOY.md)**

### **Precisa de todos os detalhes?**
👉 Leia: **[DEPLOY_PRODUCAO.md](./DEPLOY_PRODUCAO.md)**

---

## 📁 Estrutura da Documentação

### 🚀 **Guias de Deploy**

#### 1. **[INICIO_RAPIDO.md](./INICIO_RAPIDO.md)**
Deploy em 5 minutos - O essencial para colocar no ar rapidamente.

**Conteúdo:**
- ✅ Deploy em 3 passos
- ✅ Comandos essenciais
- ✅ Troubleshooting básico
- ✅ Checklist rápido

**Ideal para:** Quem quer deploy rápido e já tem experiência.

---

#### 2. **[GUIA_VISUAL_DEPLOY.md](./GUIA_VISUAL_DEPLOY.md)**
Guia visual completo com cada passo detalhado.

**Conteúdo:**
- ✅ Preparar servidor (6 passos)
- ✅ Transferir arquivos (7 passos)
- ✅ Configurar aplicação (7 passos)
- ✅ Configurar Nginx (3 passos)
- ✅ Configurar firewall (1 passo)
- ✅ Testar aplicação (4 passos)

**Ideal para:** Quem nunca fez deploy ou quer seguir passo a passo.

---

#### 3. **[DEPLOY_PRODUCAO.md](./DEPLOY_PRODUCAO.md)**
Documentação completa e detalhada de deploy.

**Conteúdo:**
- ✅ Informações do servidor e banco
- ✅ Métodos de deploy (automatizado e manual)
- ✅ Deploy passo a passo (10 passos)
- ✅ Scripts de atualização
- ✅ Monitoramento e logs
- ✅ Troubleshooting completo
- ✅ Segurança (SSL, firewall, etc)
- ✅ Backup e restauração

**Ideal para:** Referência completa e configurações avançadas.

---

#### 4. **[DEPLOY_README.md](./DEPLOY_README.md)**
Resumo executivo com links para toda documentação.

**Conteúdo:**
- ✅ Informações do servidor
- ✅ Métodos de deploy
- ✅ Processo resumido
- ✅ Comandos essenciais
- ✅ Estrutura no servidor
- ✅ Links para documentação completa

**Ideal para:** Visão geral e navegação rápida.

---

### 📦 **Transferência de Arquivos**

#### 5. **[TRANSFERIR_ARQUIVOS_WINDOWS.md](./TRANSFERIR_ARQUIVOS_WINDOWS.md)**
Como transferir arquivos do Windows para o servidor.

**Conteúdo:**
- ✅ Método 1: WinSCP (GUI - Recomendado)
- ✅ Método 2: PowerShell com SCP
- ✅ Método 3: FileZilla
- ✅ Checklist de transferência
- ✅ Comandos pós-transferência
- ✅ Problemas comuns

**Ideal para:** Usuários Windows que precisam transferir arquivos.

---

### ⚡ **Referência Rápida**

#### 6. **[COMANDOS_RAPIDOS.md](./COMANDOS_RAPIDOS.md)**
Referência rápida de todos os comandos úteis.

**Conteúdo:**
- ✅ Conectar no servidor
- ✅ Monitoramento (status, logs)
- ✅ Gerenciamento (reiniciar, parar, iniciar)
- ✅ Atualização
- ✅ Backup
- ✅ Diagnóstico
- ✅ Troubleshooting
- ✅ Configuração
- ✅ Segurança
- ✅ Comandos de emergência

**Ideal para:** Consulta rápida no dia a dia.

---

### 🛠️ **Scripts Automatizados**

#### 7. **Scripts de Deploy**

##### `deploy-to-vps.sh` (Linux/Mac)
Script automatizado de deploy completo.

**Execução:**
```bash
chmod +x deploy-to-vps.sh
./deploy-to-vps.sh
```

##### `deploy-manual.ps1` (Windows)
Script automatizado de deploy para Windows.

**Execução:**
```powershell
.\deploy-manual.ps1
```

---

#### 8. **Scripts do Servidor** (pasta `server-scripts/`)

Documentação completa: **[server-scripts/README.md](./server-scripts/README.md)**

##### Scripts Disponíveis:

- **`install-dependencies.sh`** - Instalar Node.js, PM2, Nginx, etc
- **`setup-structure.sh`** - Criar estrutura de diretórios
- **`status.sh`** - Ver status da aplicação
- **`logs.sh`** - Menu interativo de logs
- **`backup.sh`** - Fazer backup dos dados
- **`update.sh`** - Atualizar aplicação

**Uso:**
```bash
chmod +x script-name.sh
./script-name.sh
```

---

### ⚙️ **Arquivos de Configuração**

#### 9. **Configurações de Produção**

##### `backend/.env.production`
Configurações do backend para produção.

**Conteúdo:**
- Porta do servidor (3001)
- Configurações do banco MySQL
- Variáveis de ambiente de produção
- CORS configurado para o IP do servidor

##### `frontend/.env.production`
Configurações do frontend para produção.

**Conteúdo:**
- URL da API apontando para o servidor

---

### 📖 **Documentação Antiga**

#### 10. **[DEPLOY_VPS.md](./DEPLOY_VPS.md)**
Documentação anterior de deploy (mantida como referência).

---

## 🎯 Fluxo de Trabalho Recomendado

### **Para Deploy Inicial:**

```
1. INICIO_RAPIDO.md
   ↓
2. Se precisar de mais detalhes → GUIA_VISUAL_DEPLOY.md
   ↓
3. Se tiver dúvidas → DEPLOY_PRODUCAO.md
   ↓
4. Para transferir arquivos → TRANSFERIR_ARQUIVOS_WINDOWS.md
```

### **Para Uso Diário:**

```
1. COMANDOS_RAPIDOS.md (referência de comandos)
   ↓
2. Scripts do servidor (status.sh, logs.sh, backup.sh)
```

### **Para Atualização:**

```
1. COMANDOS_RAPIDOS.md (seção Atualização)
   ↓
2. update.sh (script automatizado)
```

### **Para Troubleshooting:**

```
1. COMANDOS_RAPIDOS.md (seção Troubleshooting)
   ↓
2. DEPLOY_PRODUCAO.md (seção Troubleshooting completa)
   ↓
3. logs.sh (ver logs detalhados)
```

---

## 📊 Matriz de Decisão

### **Qual documentação usar?**

| Situação | Documentação Recomendada |
|----------|-------------------------|
| Primeiro deploy | **INICIO_RAPIDO.md** ou **GUIA_VISUAL_DEPLOY.md** |
| Deploy detalhado | **DEPLOY_PRODUCAO.md** |
| Transferir arquivos | **TRANSFERIR_ARQUIVOS_WINDOWS.md** |
| Consulta rápida | **COMANDOS_RAPIDOS.md** |
| Usar scripts | **server-scripts/README.md** |
| Visão geral | **DEPLOY_README.md** |
| Problema/erro | **COMANDOS_RAPIDOS.md** (Troubleshooting) |

---

## 🗂️ Estrutura de Arquivos

```
dashboardPRODUTOS/
│
├── 📚 DOCUMENTAÇÃO DE DEPLOY
│   ├── INDICE_DEPLOY.md (este arquivo)
│   ├── INICIO_RAPIDO.md
│   ├── GUIA_VISUAL_DEPLOY.md
│   ├── DEPLOY_PRODUCAO.md
│   ├── DEPLOY_README.md
│   ├── TRANSFERIR_ARQUIVOS_WINDOWS.md
│   ├── COMANDOS_RAPIDOS.md
│   └── DEPLOY_VPS.md (referência antiga)
│
├── 🚀 SCRIPTS DE DEPLOY
│   ├── deploy-to-vps.sh (Linux/Mac)
│   └── deploy-manual.ps1 (Windows)
│
├── 🛠️ SCRIPTS DO SERVIDOR
│   └── server-scripts/
│       ├── README.md
│       ├── install-dependencies.sh
│       ├── setup-structure.sh
│       ├── status.sh
│       ├── logs.sh
│       ├── backup.sh
│       └── update.sh
│
├── ⚙️ CONFIGURAÇÕES
│   ├── backend/
│   │   └── .env.production
│   └── frontend/
│       └── .env.production
│
└── 📁 CÓDIGO FONTE
    ├── backend/
    └── frontend/
```

---

## 🎓 Níveis de Experiência

### **Iniciante (Nunca fez deploy)**
1. Leia: **INICIO_RAPIDO.md**
2. Siga: **GUIA_VISUAL_DEPLOY.md**
3. Use: **TRANSFERIR_ARQUIVOS_WINDOWS.md**
4. Consulte: **COMANDOS_RAPIDOS.md**

### **Intermediário (Já fez deploy antes)**
1. Leia: **DEPLOY_README.md**
2. Execute: `deploy-manual.ps1`
3. Consulte: **COMANDOS_RAPIDOS.md**
4. Use scripts: `server-scripts/*.sh`

### **Avançado (Experiência com servidores)**
1. Execute: `deploy-to-vps.sh` ou `deploy-manual.ps1`
2. Customize: **DEPLOY_PRODUCAO.md**
3. Automatize: Crie seus próprios scripts
4. Referência: **COMANDOS_RAPIDOS.md**

---

## 🔍 Busca Rápida

### **Preciso de...**

- **Fazer deploy pela primeira vez** → INICIO_RAPIDO.md
- **Guia passo a passo detalhado** → GUIA_VISUAL_DEPLOY.md
- **Transferir arquivos do Windows** → TRANSFERIR_ARQUIVOS_WINDOWS.md
- **Comandos para o dia a dia** → COMANDOS_RAPIDOS.md
- **Ver logs da aplicação** → logs.sh ou COMANDOS_RAPIDOS.md
- **Fazer backup** → backup.sh ou COMANDOS_RAPIDOS.md
- **Atualizar aplicação** → update.sh ou COMANDOS_RAPIDOS.md
- **Resolver problema** → COMANDOS_RAPIDOS.md (Troubleshooting)
- **Configurar SSL/HTTPS** → DEPLOY_PRODUCAO.md (Segurança)
- **Informações do servidor** → Qualquer arquivo (início)

---

## 📞 Informações Importantes

### **Servidor VPS**
```
IP:       72.60.250.20
Usuário:  root
Senha:    Admingringao1211.
```

### **Banco de Dados MySQL**
```
Host:     5.161.115.232
Port:     3306
User:     app
Senha:    lnC3bz5Qy93R
Schemas:  db_gringao, loja_fisica
```

### **URLs**
```
Aplicação:  http://72.60.250.20
API:        http://72.60.250.20/api
```

### **Diretórios no Servidor**
```
Aplicação:  /var/www/dashboard
Backend:    /var/www/dashboard/backend
Frontend:   /var/www/dashboard/frontend
Logs:       /var/www/dashboard/logs
Backups:    /var/backups/dashboard
```

---

## ✅ Checklist Geral

- [ ] Leu a documentação apropriada
- [ ] Servidor acessível via SSH
- [ ] Dependências instaladas (Node.js, PM2, Nginx)
- [ ] Arquivos transferidos
- [ ] Backend configurado (.env)
- [ ] Frontend buildado
- [ ] PM2 rodando
- [ ] Nginx configurado
- [ ] Firewall configurado
- [ ] Aplicação acessível
- [ ] Backup configurado
- [ ] Documentação salva para referência

---

## 🎉 Conclusão

Esta documentação cobre todo o processo de deploy, desde a instalação inicial até a manutenção diária.

**Comece por aqui:**
- 🚀 Deploy rápido: **[INICIO_RAPIDO.md](./INICIO_RAPIDO.md)**
- 📖 Guia completo: **[GUIA_VISUAL_DEPLOY.md](./GUIA_VISUAL_DEPLOY.md)**
- ⚡ Referência: **[COMANDOS_RAPIDOS.md](./COMANDOS_RAPIDOS.md)**

---

📚 **Boa sorte com o deploy!**

Se tiver dúvidas, consulte a documentação apropriada ou os scripts auxiliares.
