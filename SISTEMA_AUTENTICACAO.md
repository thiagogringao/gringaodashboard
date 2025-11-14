# 🔐 Sistema de Autenticação - Dashboard Produtos

## ✅ Sistema Completo Implementado!

Um sistema de autenticação completo com login, registro e proteção de rotas foi implementado usando **SQLite**, **JWT** e **React Context**.

---

## 📋 Índice

1. [Tecnologias Utilizadas](#tecnologias-utilizadas)
2. [Estrutura do Backend](#estrutura-do-backend)
3. [Estrutura do Frontend](#estrutura-do-frontend)
4. [Fluxo de Autenticação](#fluxo-de-autenticação)
5. [Rotas da API](#rotas-da-api)
6. [Como Usar](#como-usar)
7. [Credenciais Padrão](#credenciais-padrão)
8. [Segurança](#segurança)

---

## 🛠️ Tecnologias Utilizadas

### Backend:
- **SQLite** (better-sqlite3) - Banco de dados de usuários
- **bcryptjs** - Criptografia de senhas
- **jsonwebtoken** - Geração e validação de tokens JWT
- **Express** - Framework web

### Frontend:
- **React** - Interface do usuário
- **React Router** - Navegação e proteção de rotas
- **Context API** - Gerenciamento de estado de autenticação

---

## 📁 Estrutura do Backend

### 1. **Banco de Dados** (`backend/config/authDatabase.js`)

```javascript
// Tabela de usuários
CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  ativo INTEGER DEFAULT 1,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  ultimo_acesso DATETIME
)
```

**Campos:**
- `id`: ID único do usuário
- `nome`: Nome completo
- `email`: Email único (usado para login)
- `senha`: Senha criptografada com bcrypt
- `role`: Papel do usuário (`user` ou `admin`)
- `ativo`: Status do usuário (1 = ativo, 0 = inativo)
- `data_criacao`: Data de criação da conta
- `ultimo_acesso`: Última vez que fez login

### 2. **Controller** (`backend/controllers/authController.js`)

**Funções:**

#### `register(req, res)`
- Cria novo usuário
- Valida dados (nome, email, senha)
- Criptografa senha com bcrypt
- Gera token JWT
- Retorna token e dados do usuário

#### `login(req, res)`
- Autentica usuário
- Verifica email e senha
- Atualiza último acesso
- Gera token JWT
- Retorna token e dados do usuário

#### `me(req, res)`
- Retorna dados do usuário autenticado
- Requer token JWT válido

#### `listarUsuarios(req, res)` (Admin)
- Lista todos os usuários
- Apenas para administradores

#### `atualizarUsuario(req, res)`
- Atualiza dados do usuário
- Usuário pode atualizar seus próprios dados
- Admin pode atualizar qualquer usuário

#### `deletarUsuario(req, res)` (Admin)
- Deleta usuário
- Apenas para administradores
- Não pode deletar a si mesmo

### 3. **Middleware** (`backend/middleware/auth.js`)

#### `authenticate(req, res, next)`
- Verifica se há token no header `Authorization`
- Valida token JWT
- Adiciona dados do usuário em `req.user`
- Bloqueia acesso se token inválido

#### `isAdmin(req, res, next)`
- Verifica se usuário é administrador
- Deve ser usado após `authenticate`

#### `optionalAuth(req, res, next)`
- Autenticação opcional
- Não bloqueia se não houver token
- Adiciona `req.user` se token válido

### 4. **Rotas** (`backend/routes/auth.js`)

```javascript
// Rotas públicas
POST /api/auth/register  - Registrar novo usuário
POST /api/auth/login     - Fazer login

// Rotas protegidas (requer token)
GET  /api/auth/me        - Dados do usuário autenticado

// Rotas admin (requer token + role admin)
GET    /api/auth/usuarios     - Listar todos os usuários
PUT    /api/auth/usuarios/:id - Atualizar usuário
DELETE /api/auth/usuarios/:id - Deletar usuário
```

---

## 🎨 Estrutura do Frontend

### 1. **Context de Autenticação** (`frontend/src/contexts/AuthContext.jsx`)

**Estado:**
- `user`: Dados do usuário autenticado
- `loading`: Estado de carregamento

**Funções:**
- `login(email, senha)`: Faz login
- `register(nome, email, senha)`: Registra novo usuário
- `logout()`: Faz logout e redireciona para /login
- `isAuthenticated()`: Verifica se está autenticado
- `isAdmin()`: Verifica se é administrador
- `getToken()`: Retorna token JWT

### 2. **Tela de Login** (`frontend/src/pages/Login/Login.jsx`)

**Recursos:**
- Formulário de login (email + senha)
- Validação de campos
- Mensagens de erro
- Link para registro
- Credenciais de teste visíveis
- Redireciona para home após login
- Design moderno e responsivo

### 3. **Tela de Registro** (`frontend/src/pages/Register/Register.jsx`)

**Recursos:**
- Formulário de registro (nome, email, senha, confirmar senha)
- Validação de campos
- Validação de senha (mínimo 6 caracteres)
- Verificação de senhas coincidentes
- Mensagens de erro
- Link para login
- Redireciona para home após registro

### 4. **Proteção de Rotas** (`frontend/src/components/PrivateRoute/PrivateRoute.jsx`)

**Funcionalidade:**
- Verifica se usuário está autenticado
- Redireciona para /login se não autenticado
- Mostra loading enquanto verifica
- Permite acesso se autenticado

### 5. **Informações do Usuário** (no `Sidebar`)

**Recursos:**
- Avatar com inicial do nome
- Nome do usuário
- Email do usuário
- Botão de logout
- Design integrado ao sidebar

---

## 🔄 Fluxo de Autenticação

### 1. **Registro de Novo Usuário**

```
Usuário preenche formulário
        ↓
Frontend valida dados
        ↓
POST /api/auth/register
        ↓
Backend valida dados
        ↓
Backend criptografa senha (bcrypt)
        ↓
Backend salva no SQLite
        ↓
Backend gera token JWT
        ↓
Frontend salva token (localStorage)
        ↓
Frontend salva usuário (Context)
        ↓
Redireciona para home
```

### 2. **Login**

```
Usuário preenche email/senha
        ↓
Frontend valida dados
        ↓
POST /api/auth/login
        ↓
Backend busca usuário por email
        ↓
Backend verifica senha (bcrypt.compare)
        ↓
Backend atualiza último acesso
        ↓
Backend gera token JWT
        ↓
Frontend salva token (localStorage)
        ↓
Frontend salva usuário (Context)
        ↓
Redireciona para home
```

### 3. **Acesso a Rota Protegida**

```
Usuário acessa rota protegida
        ↓
PrivateRoute verifica autenticação
        ↓
Se não autenticado: redireciona para /login
        ↓
Se autenticado: renderiza componente
        ↓
Requisições à API incluem token no header
        ↓
Backend valida token (middleware)
        ↓
Se válido: processa requisição
        ↓
Se inválido: retorna 401 Unauthorized
```

### 4. **Logout**

```
Usuário clica em logout
        ↓
Frontend remove token (localStorage)
        ↓
Frontend limpa usuário (Context)
        ↓
Redireciona para /login
```

---

## 🔌 Rotas da API

### **Rotas Públicas**

#### POST `/api/auth/register`
Registra novo usuário.

**Body:**
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "senha123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": 2,
      "nome": "João Silva",
      "email": "joao@email.com",
      "role": "user"
    }
  }
}
```

#### POST `/api/auth/login`
Faz login.

**Body:**
```json
{
  "email": "admin@dashboard.com",
  "senha": "admin123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": 1,
      "nome": "Administrador",
      "email": "admin@dashboard.com",
      "role": "admin"
    }
  }
}
```

### **Rotas Protegidas** (Requer token)

#### GET `/api/auth/me`
Retorna dados do usuário autenticado.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nome": "Administrador",
    "email": "admin@dashboard.com",
    "role": "admin",
    "data_criacao": "2024-01-01 10:00:00",
    "ultimo_acesso": "2024-01-15 14:30:00"
  }
}
```

### **Rotas Admin** (Requer token + role admin)

#### GET `/api/auth/usuarios`
Lista todos os usuários.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "Administrador",
      "email": "admin@dashboard.com",
      "role": "admin",
      "ativo": 1,
      "data_criacao": "2024-01-01 10:00:00",
      "ultimo_acesso": "2024-01-15 14:30:00"
    },
    {
      "id": 2,
      "nome": "João Silva",
      "email": "joao@email.com",
      "role": "user",
      "ativo": 1,
      "data_criacao": "2024-01-10 09:00:00",
      "ultimo_acesso": "2024-01-14 16:20:00"
    }
  ]
}
```

#### PUT `/api/auth/usuarios/:id`
Atualiza usuário.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Body:**
```json
{
  "nome": "João Silva Santos",
  "email": "joao.santos@email.com",
  "senha": "novaSenha123",
  "role": "admin",
  "ativo": 1
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Usuário atualizado com sucesso",
  "data": {
    "id": 2,
    "nome": "João Silva Santos",
    "email": "joao.santos@email.com",
    "role": "admin",
    "ativo": 1
  }
}
```

#### DELETE `/api/auth/usuarios/:id`
Deleta usuário.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "success": true,
  "message": "Usuário deletado com sucesso"
}
```

---

## 🚀 Como Usar

### 1. **Instalar Dependências**

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 2. **Iniciar Backend**

```bash
cd backend
npm start
```

O backend estará rodando em: `http://localhost:3001`

### 3. **Iniciar Frontend**

```bash
cd frontend
npm start
```

O frontend estará rodando em: `http://localhost:3000`

### 4. **Acessar o Sistema**

1. Abra o navegador em `http://localhost:3000`
2. Você será redirecionado para `/login`
3. Use as credenciais padrão ou registre um novo usuário

---

## 🔑 Credenciais Padrão

Um usuário administrador é criado automaticamente:

```
Email: admin@dashboard.com
Senha: admin123
Role: admin
```

**Use estas credenciais para:**
- Fazer login inicial
- Testar funcionalidades admin
- Gerenciar outros usuários

---

## 🔒 Segurança

### 1. **Senhas Criptografadas**
- Todas as senhas são criptografadas com **bcrypt**
- Salt rounds: 10
- Senhas nunca são armazenadas em texto plano

### 2. **Tokens JWT**
- Tokens assinados com secret key
- Expiração: 24 horas
- Armazenados no localStorage do navegador
- Enviados no header `Authorization: Bearer TOKEN`

### 3. **Validações**

**Backend:**
- Validação de formato de email
- Senha mínima de 6 caracteres
- Email único (não permite duplicados)
- Verificação de usuário ativo

**Frontend:**
- Validação de campos obrigatórios
- Validação de formato de email
- Verificação de senhas coincidentes
- Mensagens de erro claras

### 4. **Proteção de Rotas**

**Backend:**
- Middleware `authenticate` para rotas protegidas
- Middleware `isAdmin` para rotas administrativas
- Retorna 401 para tokens inválidos
- Retorna 403 para acesso não autorizado

**Frontend:**
- Componente `PrivateRoute` para rotas protegidas
- Redireciona para /login se não autenticado
- Verifica token ao carregar aplicação

### 5. **Boas Práticas**

- ✅ Senhas nunca expostas em logs
- ✅ Tokens com expiração
- ✅ CORS configurado corretamente
- ✅ Validação em backend E frontend
- ✅ Mensagens de erro genéricas (não expõem detalhes)
- ✅ Último acesso registrado
- ✅ Possibilidade de desativar usuários

---

## 📊 Banco de Dados

### Localização:
```
backend/auth.db
```

### Estrutura:

```sql
CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  ativo INTEGER DEFAULT 1,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  ultimo_acesso DATETIME
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
```

### Consultas Úteis:

```sql
-- Listar todos os usuários
SELECT id, nome, email, role, ativo FROM usuarios;

-- Buscar usuário por email
SELECT * FROM usuarios WHERE email = 'admin@dashboard.com';

-- Contar usuários ativos
SELECT COUNT(*) FROM usuarios WHERE ativo = 1;

-- Usuários que nunca fizeram login
SELECT nome, email FROM usuarios WHERE ultimo_acesso IS NULL;
```

---

## 🎯 Próximos Passos (Opcional)

### 1. **Recuperação de Senha**
- Endpoint para solicitar reset
- Envio de email com token
- Página de reset de senha

### 2. **Perfil do Usuário**
- Página para editar dados
- Upload de avatar
- Histórico de acessos

### 3. **Gerenciamento de Usuários (Admin)**
- Página admin para listar usuários
- Criar/editar/deletar usuários
- Ativar/desativar usuários
- Alterar roles

### 4. **Auditoria**
- Tabela de logs de ações
- Registro de login/logout
- Registro de alterações

### 5. **Segurança Adicional**
- Two-factor authentication (2FA)
- Rate limiting (limitar tentativas de login)
- Blacklist de tokens (logout forçado)
- Refresh tokens

---

## ✅ Checklist de Implementação

- [x] Banco de dados SQLite para usuários
- [x] Criptografia de senhas (bcrypt)
- [x] Geração de tokens JWT
- [x] Rotas de autenticação (register, login)
- [x] Middleware de autenticação
- [x] Middleware de autorização (admin)
- [x] Context de autenticação no React
- [x] Tela de login
- [x] Tela de registro
- [x] Proteção de rotas no frontend
- [x] Componente de informações do usuário
- [x] Botão de logout
- [x] Usuário admin padrão
- [x] Validações frontend e backend
- [x] Mensagens de erro
- [x] Design responsivo
- [x] Integração completa

---

## 🎉 Sistema Pronto!

O sistema de autenticação está **100% funcional** e pronto para uso!

**Recursos implementados:**
- ✅ Login e registro de usuários
- ✅ Proteção de rotas
- ✅ Gerenciamento de sessão
- ✅ Interface moderna e responsiva
- ✅ Segurança com JWT e bcrypt
- ✅ Validações completas
- ✅ Usuário admin padrão

**Para testar:**
1. Inicie o backend: `cd backend && npm start`
2. Inicie o frontend: `cd frontend && npm start`
3. Acesse: `http://localhost:3000`
4. Faça login com: `admin@dashboard.com` / `admin123`

🚀 **Bom uso!**

