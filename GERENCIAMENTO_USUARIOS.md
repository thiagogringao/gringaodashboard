# 👥 Gerenciamento de Usuários - Dashboard Produtos

## ✅ Sistema Completo de Cadastro e Gerenciamento de Usuários

Uma interface completa para administradores cadastrarem e gerenciarem usuários do sistema.

---

## 🎯 Funcionalidades Implementadas

### 1. **Listagem de Usuários**
- ✅ Tabela completa com todos os usuários
- ✅ Informações exibidas:
  - ID
  - Nome (com avatar)
  - Email
  - Função (Admin/Usuário)
  - Status (Ativo/Inativo)
  - Data de criação
  - Último acesso
  - Ações (Editar/Deletar)

### 2. **Cadastro de Novo Usuário**
- ✅ Modal com formulário completo
- ✅ Campos:
  - Nome completo
  - Email
  - Senha
  - Função (Usuário/Administrador)
  - Status (Ativo/Inativo)
- ✅ Validações:
  - Campos obrigatórios
  - Formato de email
  - Senha mínima de 6 caracteres
  - Email único

### 3. **Edição de Usuário**
- ✅ Modal com dados pré-preenchidos
- ✅ Permite alterar todos os campos
- ✅ Senha opcional (deixe em branco para manter)
- ✅ Admin pode alterar função e status
- ✅ Usuário pode editar seus próprios dados

### 4. **Exclusão de Usuário**
- ✅ Confirmação antes de deletar
- ✅ Apenas admin pode deletar
- ✅ Não permite deletar a si mesmo
- ✅ Remove permanentemente do banco

### 5. **Controle de Acesso**
- ✅ Página visível apenas para administradores
- ✅ Menu "Administração" aparece apenas para admins
- ✅ Validação no backend (middleware)
- ✅ Validação no frontend (Context)

---

## 🎨 Interface

### **Página Principal** (`/usuarios`)

```
┌──────────────────────────────────────────────────────────────────┐
│ Gerenciamento de Usuários                    [+ Novo Usuário]    │
│ Cadastre e gerencie usuários do sistema                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ ID │ Nome        │ Email         │ Função │ Status │ Ações  │ │
│ ├────┼─────────────┼───────────────┼────────┼────────┼────────┤ │
│ │ 1  │ [A] Admin   │ admin@...     │ Admin  │ Ativo  │ ✏️ 🗑️  │ │
│ │ 2  │ [J] João    │ joao@...      │ User   │ Ativo  │ ✏️ 🗑️  │ │
│ │ 3  │ [M] Maria   │ maria@...     │ User   │ Inativo│ ✏️ 🗑️  │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### **Modal de Cadastro/Edição**

```
┌────────────────────────────────────────────┐
│ Novo Usuário                          [✕]  │
├────────────────────────────────────────────┤
│                                            │
│ Nome Completo *                            │
│ [_________________________________]        │
│                                            │
│ Email *                                    │
│ [_________________________________]        │
│                                            │
│ Senha *                                    │
│ [_________________________________]        │
│                                            │
│ Função              Status                 │
│ [Usuário ▼]        ☑ Usuário Ativo        │
│                                            │
│                   [Cancelar] [Criar]       │
└────────────────────────────────────────────┘
```

---

## 📁 Arquivos Criados

### **Frontend:**

#### `frontend/src/pages/Users/Users.jsx`
Componente principal da página de gerenciamento.

**Recursos:**
- Estado para lista de usuários
- Estado para modal (aberto/fechado)
- Estado para usuário em edição
- Estado para formulário
- Funções CRUD completas
- Integração com API

#### `frontend/src/pages/Users/Users.module.css`
Estilos da página de gerenciamento.

**Recursos:**
- Design moderno e responsivo
- Tabela estilizada
- Modal com animações
- Badges coloridos para função e status
- Botões de ação com ícones
- Avatares com iniciais

### **Rotas Atualizadas:**

#### `frontend/src/App.jsx`
- Adicionada rota `/usuarios`
- Protegida com `PrivateRoute`

#### `frontend/src/components/Sidebar/Sidebar.jsx`
- Adicionada seção "Administração"
- Menu visível apenas para admins
- Item "Usuários" com ícone

---

## 🔌 Integração com API

### **Endpoints Utilizados:**

#### 1. **Listar Usuários**
```javascript
GET /api/auth/usuarios
Headers: Authorization: Bearer TOKEN

Response:
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
    }
  ]
}
```

#### 2. **Criar Usuário**
```javascript
POST /api/auth/register
Headers: 
  Content-Type: application/json
  Authorization: Bearer TOKEN

Body:
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "senha123",
  "role": "user",
  "ativo": true
}

Response:
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "data": {
    "token": "...",
    "usuario": { ... }
  }
}
```

#### 3. **Atualizar Usuário**
```javascript
PUT /api/auth/usuarios/:id
Headers:
  Content-Type: application/json
  Authorization: Bearer TOKEN

Body:
{
  "nome": "João Silva Santos",
  "email": "joao.santos@email.com",
  "senha": "novaSenha123", // Opcional
  "role": "admin",
  "ativo": true
}

Response:
{
  "success": true,
  "message": "Usuário atualizado com sucesso",
  "data": { ... }
}
```

#### 4. **Deletar Usuário**
```javascript
DELETE /api/auth/usuarios/:id
Headers: Authorization: Bearer TOKEN

Response:
{
  "success": true,
  "message": "Usuário deletado com sucesso"
}
```

---

## 🔒 Segurança e Validações

### **Backend:**

1. **Middleware de Autenticação**
   - Todas as rotas requerem token JWT válido
   - Verificação de expiração do token

2. **Middleware de Autorização**
   - Rotas admin requerem `role: 'admin'`
   - Retorna 403 para usuários não autorizados

3. **Validações:**
   - Email único (não permite duplicados)
   - Formato de email válido
   - Senha mínima de 6 caracteres
   - Campos obrigatórios

4. **Regras de Negócio:**
   - Admin não pode deletar a si mesmo
   - Usuário comum pode editar apenas seus dados
   - Admin pode editar role e status de qualquer usuário

### **Frontend:**

1. **Controle de Acesso:**
   - Página visível apenas para admins
   - Menu "Administração" condicional
   - Verificação via `isAdmin()` do Context

2. **Validações:**
   - Campos obrigatórios
   - Formato de email
   - Senha mínima
   - Mensagens de erro claras

3. **UX:**
   - Confirmação antes de deletar
   - Botão de deletar oculto para próprio usuário
   - Loading states
   - Feedback visual de ações

---

## 🎯 Fluxo de Uso

### **1. Acessar Página de Usuários**

```
Admin faz login
     ↓
Menu "Administração" aparece no sidebar
     ↓
Clica em "Usuários"
     ↓
Página carrega lista de usuários
```

### **2. Cadastrar Novo Usuário**

```
Clica em "Novo Usuário"
     ↓
Modal abre com formulário vazio
     ↓
Preenche dados (nome, email, senha, função)
     ↓
Clica em "Criar Usuário"
     ↓
Frontend valida dados
     ↓
POST /api/auth/register
     ↓
Backend valida e cria usuário
     ↓
Modal fecha
     ↓
Lista atualiza automaticamente
```

### **3. Editar Usuário**

```
Clica no botão ✏️ (Editar)
     ↓
Modal abre com dados pré-preenchidos
     ↓
Altera dados desejados
     ↓
Clica em "Salvar Alterações"
     ↓
Frontend valida dados
     ↓
PUT /api/auth/usuarios/:id
     ↓
Backend valida e atualiza
     ↓
Modal fecha
     ↓
Lista atualiza automaticamente
```

### **4. Deletar Usuário**

```
Clica no botão 🗑️ (Deletar)
     ↓
Confirmação: "Tem certeza?"
     ↓
Usuário confirma
     ↓
DELETE /api/auth/usuarios/:id
     ↓
Backend valida e deleta
     ↓
Lista atualiza automaticamente
```

---

## 🎨 Elementos Visuais

### **Avatares**
- Círculo colorido com gradiente
- Primeira letra do nome em maiúscula
- Cores: Gradiente roxo/azul

### **Badges de Função**
- **Admin:** Fundo amarelo claro, texto laranja
- **User:** Fundo azul claro, texto azul escuro

### **Status**
- **Ativo:** Fundo verde claro, texto verde escuro
- **Inativo:** Fundo vermelho claro, texto vermelho escuro

### **Botões de Ação**
- **Editar:** Fundo azul claro, ícone de lápis
- **Deletar:** Fundo vermelho claro, ícone de lixeira
- Hover: Cor mais intensa

### **Modal**
- Overlay escuro semi-transparente
- Card branco centralizado
- Animação de entrada (slide up + fade in)
- Botão de fechar (X) no canto superior direito

---

## 📊 Estrutura de Dados

### **Estado do Componente:**

```javascript
const [usuarios, setUsuarios] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');
const [showModal, setShowModal] = useState(false);
const [editingUser, setEditingUser] = useState(null);
const [formData, setFormData] = useState({
  nome: '',
  email: '',
  senha: '',
  role: 'user',
  ativo: true
});
```

### **Objeto de Usuário:**

```javascript
{
  id: 1,
  nome: "João Silva",
  email: "joao@email.com",
  role: "user",           // "user" ou "admin"
  ativo: 1,               // 1 = ativo, 0 = inativo
  data_criacao: "2024-01-01 10:00:00",
  ultimo_acesso: "2024-01-15 14:30:00"
}
```

---

## 🚀 Como Usar

### **1. Fazer Login como Admin**

```
Email: admin@dashboard.com
Senha: admin123
```

### **2. Acessar Gerenciamento**

1. No sidebar, procure a seção "Administração"
2. Clique em "Usuários"
3. Você verá a lista de todos os usuários

### **3. Cadastrar Usuário**

1. Clique no botão "Novo Usuário" (canto superior direito)
2. Preencha o formulário:
   - **Nome:** Nome completo do usuário
   - **Email:** Email único (será usado para login)
   - **Senha:** Mínimo 6 caracteres
   - **Função:** Escolha entre Usuário ou Administrador
   - **Status:** Marque se o usuário estará ativo
3. Clique em "Criar Usuário"

### **4. Editar Usuário**

1. Clique no ícone ✏️ na linha do usuário
2. Altere os dados desejados
3. **Senha:** Deixe em branco para manter a atual
4. Clique em "Salvar Alterações"

### **5. Deletar Usuário**

1. Clique no ícone 🗑️ na linha do usuário
2. Confirme a exclusão
3. **Nota:** Você não pode deletar seu próprio usuário

---

## ✅ Checklist de Funcionalidades

- [x] Listagem de usuários com todos os dados
- [x] Avatares com iniciais
- [x] Badges coloridos para função e status
- [x] Botão "Novo Usuário"
- [x] Modal de cadastro
- [x] Formulário completo (nome, email, senha, função, status)
- [x] Validações frontend
- [x] Validações backend
- [x] Criação de usuário via API
- [x] Modal de edição
- [x] Dados pré-preenchidos
- [x] Senha opcional na edição
- [x] Atualização via API
- [x] Botão de deletar
- [x] Confirmação antes de deletar
- [x] Exclusão via API
- [x] Proteção: não deletar a si mesmo
- [x] Menu "Administração" apenas para admins
- [x] Rota protegida (apenas admin)
- [x] Design responsivo
- [x] Animações e transições
- [x] Loading states
- [x] Mensagens de erro
- [x] Atualização automática da lista

---

## 🎯 Casos de Uso

### **Caso 1: Novo Funcionário**
**Situação:** Empresa contrata novo funcionário que precisa acessar o sistema.

**Solução:**
1. Admin acessa "Usuários"
2. Clica em "Novo Usuário"
3. Preenche dados do funcionário
4. Define função como "Usuário"
5. Marca como "Ativo"
6. Cria usuário
7. Informa credenciais ao funcionário

### **Caso 2: Promover Usuário a Admin**
**Situação:** Usuário comum precisa virar administrador.

**Solução:**
1. Admin acessa "Usuários"
2. Localiza o usuário na lista
3. Clica em ✏️ (Editar)
4. Altera função de "Usuário" para "Administrador"
5. Salva alterações
6. Usuário agora tem acesso admin

### **Caso 3: Desativar Usuário Temporariamente**
**Situação:** Funcionário em férias ou afastado.

**Solução:**
1. Admin acessa "Usuários"
2. Localiza o usuário
3. Clica em ✏️ (Editar)
4. Desmarca "Usuário Ativo"
5. Salva alterações
6. Usuário não consegue mais fazer login

### **Caso 4: Funcionário Esqueceu a Senha**
**Situação:** Funcionário não lembra a senha.

**Solução:**
1. Admin acessa "Usuários"
2. Localiza o usuário
3. Clica em ✏️ (Editar)
4. Define nova senha temporária
5. Salva alterações
6. Informa nova senha ao funcionário

### **Caso 5: Funcionário Saiu da Empresa**
**Situação:** Funcionário foi desligado.

**Solução:**
1. Admin acessa "Usuários"
2. Localiza o usuário
3. Clica em 🗑️ (Deletar)
4. Confirma exclusão
5. Usuário removido permanentemente

---

## 🎉 Sistema Completo!

**Funcionalidades Implementadas:**
- ✅ Listagem completa de usuários
- ✅ Cadastro de novos usuários
- ✅ Edição de usuários existentes
- ✅ Exclusão de usuários
- ✅ Controle de acesso (apenas admin)
- ✅ Interface moderna e intuitiva
- ✅ Validações completas
- ✅ Segurança com JWT
- ✅ Design responsivo

**Para Usar:**
1. Faça login como admin: `admin@dashboard.com` / `admin123`
2. Acesse o menu "Administração" → "Usuários"
3. Gerencie os usuários do sistema!

🚀 **Sistema pronto para uso em produção!**

