# 🔧 Corrigir Erro de Login - CORS

## 🐛 Problema

Erro ao fazer login:
```
Servidor não está respondendo. No 'Access-Control-Allow-Origin' header is present
```

---

## 🔍 Causas Possíveis

### **1. Backend não está rodando**
### **2. Porta incorreta**
### **3. Banco de dados SQLite corrompido**
### **4. Processos node antigos**

---

## ✅ Solução Rápida

### **Execute este script:**

```bash
# 1. Parar todos os processos node
Stop-Process -Name node -Force

# 2. Deletar bancos SQLite (serão recriados)
Remove-Item -Path "backend\cache\*.db" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "backend\cache\*.db-shm" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "backend\cache\*.db-wal" -Force -ErrorAction SilentlyContinue

# 3. Iniciar backend
cd backend
npm run dev
```

---

## 📋 Passo a Passo Detalhado

### **Passo 1: Parar Processos Node**

```powershell
Stop-Process -Name node -Force
```

### **Passo 2: Limpar Cache SQLite**

```powershell
cd backend\cache
Remove-Item *.db, *.db-shm, *.db-wal -Force
cd ..\..
```

### **Passo 3: Executar Backup**

```powershell
cd backend
node scripts\backupToSQLite.js
node scripts\backupEcommerceToSQLite.js
```

### **Passo 4: Iniciar Backend**

```powershell
cd backend
npm run dev
```

**Aguarde ver:**
```
✅ Cache SQLite Loja Física inicializado
✅ Cache SQLite E-commerce inicializado
🚀 Servidor rodando na porta 3001
```

### **Passo 5: Testar API**

```powershell
curl http://localhost:3001/api/produtos/loja-fisica?limit=1
```

**Deve retornar JSON com produtos**

### **Passo 6: Testar Login**

1. Acesse: `http://localhost:3000/login`
2. Email: `admin@dashboard.com`
3. Senha: `admin123`
4. Clique em "Entrar"

---

## 🧪 Testes de Verificação

### **1. Backend está rodando?**

```powershell
Get-Process -Name node
```

**Deve mostrar processos node ativos**

### **2. Porta 3001 está aberta?**

```powershell
Test-NetConnection -ComputerName localhost -Port 3001
```

**Deve mostrar: TcpTestSucceeded : True**

### **3. API responde?**

```powershell
curl http://localhost:3001/api/produtos/loja-fisica?limit=1
```

**Deve retornar JSON**

### **4. CORS está configurado?**

```powershell
curl -Method OPTIONS http://localhost:3001/api/auth/login -Headers @{"Origin"="http://localhost:3000"}
```

**Deve retornar headers de CORS**

---

## 🔧 Script Automático

Criei um script para corrigir automaticamente:

### **Arquivo:** `fix-backend.bat`

```batch
@echo off
echo ========================================
echo  CORRIGINDO BACKEND
echo ========================================
echo.

echo [1/5] Parando processos node...
taskkill /F /IM node.exe >nul 2>&1

echo [2/5] Limpando cache SQLite...
cd backend\cache
del /F /Q *.db *.db-shm *.db-wal >nul 2>&1
cd ..\..

echo [3/5] Executando backup Loja Fisica...
cd backend
node scripts\backupToSQLite.js

echo [4/5] Executando backup E-commerce...
node scripts\backupEcommerceToSQLite.js

echo [5/5] Iniciando backend...
echo.
echo Backend iniciando...
echo Acesse: http://localhost:3000/login
echo.
npm run dev
```

---

## 📊 Verificação de Saúde

### **Backend Saudável:**

```
✅ Processos node rodando
✅ Porta 3001 aberta
✅ API responde
✅ CORS configurado
✅ SQLite inicializado
✅ Login funciona
```

### **Backend com Problemas:**

```
❌ Nenhum processo node
❌ Porta 3001 fechada
❌ API não responde
❌ Erro de CORS
❌ SQLite corrompido
❌ Login falha
```

---

## 🚨 Erros Comuns

### **Erro 1: ECONNREFUSED**

**Causa:** Backend não está rodando

**Solução:**
```powershell
cd backend
npm run dev
```

### **Erro 2: SQLITE_ERROR**

**Causa:** Banco SQLite corrompido ou estrutura antiga

**Solução:**
```powershell
Remove-Item backend\cache\*.db -Force
cd backend
node scripts\backupToSQLite.js
node scripts\backupEcommerceToSQLite.js
```

### **Erro 3: Port 3001 already in use**

**Causa:** Outro processo usando a porta

**Solução:**
```powershell
Stop-Process -Name node -Force
cd backend
npm run dev
```

### **Erro 4: Cannot GET /api/auth/login**

**Causa:** Método incorreto (deve ser POST)

**Solução:**
```powershell
curl -Method POST http://localhost:3001/api/auth/login -Body '{"email":"admin@dashboard.com","senha":"admin123"}' -ContentType "application/json"
```

---

## 💡 Dicas

### **1. Sempre pare processos antes de reiniciar:**

```powershell
Stop-Process -Name node -Force
```

### **2. Verifique logs do backend:**

Olhe o terminal onde o backend está rodando para ver erros.

### **3. Limpe cache do navegador:**

```
Ctrl + Shift + Delete
```

### **4. Use modo anônimo para testar:**

```
Ctrl + Shift + N
```

---

## 📝 Checklist de Correção

- [ ] Parar processos node
- [ ] Deletar cache SQLite
- [ ] Executar backup Loja Física
- [ ] Executar backup E-commerce
- [ ] Iniciar backend
- [ ] Aguardar mensagem de sucesso
- [ ] Testar API
- [ ] Testar login
- [ ] Limpar cache do navegador
- [ ] Fazer login novamente

---

## 🎯 Solução Definitiva

### **Para evitar o problema:**

1. **Sempre use o script de correção** quando houver problemas
2. **Não mate processos node manualmente** sem reiniciar
3. **Execute backups** após mudanças no código
4. **Verifique logs** antes de reportar erros

---

## 📞 Suporte

### **Se o problema persistir:**

1. Verifique se MySQL está rodando
2. Verifique credenciais no `.env`
3. Verifique se a porta 3001 está livre
4. Verifique logs do backend
5. Tente reiniciar o computador

---

**Execute o script de correção e tente fazer login novamente!** 🚀
