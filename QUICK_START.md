# Guia Rápido de Início

Este guia te ajudará a configurar e executar a aplicação em poucos minutos.

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** versão 18 ou superior ([Download](https://nodejs.org/))
- **MySQL** com acesso aos bancos `db_gringao` e `loja_fisica`
- **Git** (opcional, para clonar repositório)

Verifique as instalações:
```bash
node --version  # Deve retornar v18.x.x ou superior
npm --version   # Deve retornar 9.x.x ou superior
```

## Configuração Rápida

### Passo 1: Configurar Backend

1. Abra um terminal na pasta do projeto
2. Entre na pasta backend:
```bash
cd backend
```

3. Instale as dependências:
```bash
npm install
```

4. Configure o arquivo `.env` com suas credenciais de banco:
```bash
# Abra o arquivo backend/.env e edite:
DB_ECOMMERCE_HOST=seu_host_aqui
DB_ECOMMERCE_USER=seu_usuario_aqui
DB_ECOMMERCE_PASSWORD=sua_senha_aqui

DB_LOJA_HOST=seu_host_aqui
DB_LOJA_USER=seu_usuario_aqui
DB_LOJA_PASSWORD=sua_senha_aqui
```

5. Inicie o servidor backend:
```bash
npm run dev
```

Você verá:
```
Servidor rodando na porta 3001
Ambiente: development
```

**✅ Backend configurado!** Deixe este terminal aberto.

### Passo 2: Configurar Frontend

1. Abra um **NOVO** terminal
2. Entre na pasta frontend:
```bash
cd frontend
```

3. Instale as dependências:
```bash
npm install
```

4. O arquivo `.env` já está configurado por padrão, mas você pode verificar:
```bash
# Arquivo frontend/.env
VITE_API_URL=http://localhost:3001
```

5. Inicie o servidor frontend:
```bash
npm run dev
```

Você verá:
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

**✅ Frontend configurado!** O navegador abrirá automaticamente.

## Testando a Aplicação

### Teste 1: Health Check do Backend

Abra no navegador:
```
http://localhost:3001/health
```

Você deve ver:
```json
{
  "status": "ok",
  "message": "Servidor rodando"
}
```

### Teste 2: Acessar Home

Abra no navegador:
```
http://localhost:3000
```

Você verá a página inicial com dois cards:
- **E-commerce**
- **Loja Física**

### Teste 3: Ver Catálogo

Clique em um dos cards para ver o catálogo de produtos!

## Estrutura de Comandos

### Backend (Terminal 1)
```bash
cd backend
npm run dev    # Modo desenvolvimento (recarrega automaticamente)
npm start      # Modo produção
```

### Frontend (Terminal 2)
```bash
cd frontend
npm run dev      # Modo desenvolvimento
npm run build    # Gerar build de produção
npm run preview  # Preview do build
```

## Verificação de Problemas Comuns

### ❌ Erro: "Cannot connect to database"
**Solução:**
- Verifique se as credenciais no `backend/.env` estão corretas
- Confirme se o MySQL está rodando
- Teste a conexão com um cliente MySQL

### ❌ Erro: "CORS error" no frontend
**Solução:**
- Certifique-se que o backend está rodando
- Verifique se `CORS_ORIGIN` no `backend/.env` está como `http://localhost:3000`
- Limpe cache do navegador (Ctrl+Shift+Delete)

### ❌ Erro: "Port 3001 is already in use"
**Solução:**
- Mate o processo na porta 3001:
  ```bash
  # Windows
  netstat -ano | findstr :3001
  taskkill /PID <numero_do_pid> /F

  # Linux/Mac
  lsof -ti:3001 | xargs kill -9
  ```
- Ou altere a porta no `backend/.env`

### ❌ Erro: "Port 3000 is already in use"
**Solução:**
- Feche outros processos na porta 3000
- Ou use a porta que o Vite sugerir automaticamente

### ❌ Página em branco no frontend
**Solução:**
- Abra o Console do navegador (F12)
- Verifique erros JavaScript
- Confirme que `VITE_API_URL` está correto no `frontend/.env`
- Reinicie o servidor frontend

### ❌ Produtos não aparecem
**Solução:**
- Verifique se há dados nas tabelas do banco
- Teste o endpoint diretamente: `http://localhost:3001/api/produtos/ecommerce`
- Verifique logs do backend no terminal

## Próximos Passos

Agora que tudo está funcionando, você pode:

1. **Explorar a API**: Teste os endpoints com Postman/Insomnia
2. **Customizar cores**: Edite os arquivos `.module.css`
3. **Adicionar features**: Consulte os READMEs específicos
4. **Deploy**: Prepare para produção

## Arquivos de Configuração

### Backend
- `backend/.env` - Variáveis de ambiente (EDITAR)
- `backend/server.js` - Entrada do servidor
- `backend/config/database.js` - Conexões MySQL

### Frontend
- `frontend/.env` - URL da API (EDITAR se necessário)
- `frontend/vite.config.js` - Configuração do Vite
- `frontend/src/App.jsx` - Rotas da aplicação

## Atalhos Úteis

### Durante Desenvolvimento

**Backend (Terminal 1):**
- `Ctrl+C` - Para o servidor
- Salvar arquivo - Reinicia automaticamente (nodemon)

**Frontend (Terminal 2):**
- `Ctrl+C` - Para o servidor
- Salvar arquivo - Hot reload automático (Vite HMR)

**Navegador:**
- `F12` - Abre DevTools
- `Ctrl+Shift+R` - Hard reload (limpa cache)
- `Ctrl+Shift+C` - Inspecionar elemento

## URLs Importantes

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **API E-commerce**: http://localhost:3001/api/produtos/ecommerce
- **API Loja Física**: http://localhost:3001/api/produtos/loja-fisica

## Suporte

Se encontrar problemas:

1. Consulte os arquivos README detalhados:
   - `README.md` (principal)
   - `backend/README.md`
   - `frontend/README.md`

2. Verifique os logs nos terminais

3. Limpe e reinstale dependências:
   ```bash
   rm -rf node_modules
   npm install
   ```

## Checklist de Instalação

Marque conforme avançar:

- [ ] Node.js 18+ instalado
- [ ] MySQL acessível
- [ ] Backend: `npm install` executado
- [ ] Backend: `.env` configurado
- [ ] Backend: Servidor rodando (porta 3001)
- [ ] Frontend: `npm install` executado
- [ ] Frontend: `.env` verificado
- [ ] Frontend: Servidor rodando (porta 3000)
- [ ] Health check funcionando
- [ ] Home page carregando
- [ ] Catálogo exibindo produtos

**✅ Tudo pronto!** Bom desenvolvimento! 🚀
