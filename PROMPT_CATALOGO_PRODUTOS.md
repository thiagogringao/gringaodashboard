# Prompt: Aplicação de Catálogo de Produtos - Joalheria

## 📋 Contexto do Projeto

Preciso que você desenvolva uma aplicação completa de **catálogo de produtos** para uma joalheria que opera tanto com loja física quanto e-commerce. O sistema deve consultar bancos de dados MySQL existentes e apresentar informações detalhadas dos produtos de forma elegante e intuitiva.

---

## 🎯 Objetivo

Criar uma aplicação web moderna que exiba o catálogo de produtos com as seguintes informações:

- **Imagem do produto** (se disponível)
- **Código do produto**
- **Descrição completa**
- **Quantidade em estoque**
- **Preço de custo**
- **Preço de venda**
- **Margem de lucro** (calculada)

---

## 🛠️ Stack Tecnológica Obrigatória

### Backend
- **Node.js** (versão 18+)
- **Express.js** para API REST
- **MySQL2** para conexão com banco de dados
- **dotenv** para variáveis de ambiente
- **cors** para habilitar requisições cross-origin

### Frontend
- **React** (versão 18+)
- **React Router DOM** para navegação
- **Axios** para requisições HTTP
- **CSS Modules** ou **Styled Components** para estilização
- **React Query** (TanStack Query) para gerenciamento de estado de servidor

---

## 🗄️ Estrutura dos Bancos de Dados

### Banco 1: `db_gringao` (E-commerce)

**Tabela Principal**: `bling2_produtos`

```sql
-- Colunas relevantes:
id              BIGINT          -- Identificador único
codigo          VARCHAR(50)     -- Código único do produto
nome            VARCHAR(255)    -- Nome do produto
preco           DECIMAL(10,2)   -- Preço de venda
precoCusto      DECIMAL(10,2)   -- Preço de custo
estoque         INT             -- Quantidade em estoque
situacao        VARCHAR(20)     -- Situação (ativo/inativo)
imagemURL       VARCHAR(255)    -- URL da imagem do produto
```

**Observações**:
- Campos estão em **minúsculas**
- Use apenas produtos com `situacao = 'ativo'`
- A `imagemURL` pode estar vazia (exibir imagem placeholder)

---

### Banco 2: `loja_fisica` (Loja Física/PDV)

**Tabela de Produtos**: `produtos`

```sql
-- Colunas relevantes:
CODIGO_INTERNO         VARCHAR(9)      -- Código interno (PK)
CODIGO_BARRAS          VARCHAR(13)     -- Código de barras
DESCRICAO              VARCHAR(40)     -- Descrição completa
DESCRICAO_RESUMIDA     VARCHAR(24)     -- Descrição resumida
```

**View de Produtos com Imagem**: `vw_dprodutos`

```sql
-- Colunas relevantes:
CODIGO_INTERNO    VARCHAR(13)     -- Código com padding de zeros
DESCRICAO         VARCHAR         -- Descrição do produto
img               TEXT            -- Imagem em Base64 (LONGTEXT)
```

**Tabela de Estoque**: `estoque`

```sql
-- Colunas relevantes:
CODIGO_INTERNO      VARCHAR(13)     -- Código do produto (FK)
QUANTIDADE_ATUAL    INT             -- Quantidade atual em estoque
```

**Importante**:
- Campos estão em **MAIÚSCULAS**
- Para obter imagens, faça JOIN com `vw_dprodutos` usando:
  ```sql
  LPAD(produtos.CODIGO_INTERNO, 13, '0') = vw_dprodutos.CODIGO_INTERNO
  ```
- A coluna `img` contém a imagem em Base64 (pode estar vazia)

---

## ⚙️ Requisitos Funcionais do Backend

### 1. API REST com Express

Crie os seguintes endpoints:

#### **GET** `/api/produtos/ecommerce`
- Retorna lista de produtos do e-commerce (`db_gringao`)
- Suporta paginação: `?page=1&limit=20`
- Suporta busca: `?search=colar`
- Suporta filtro por situação: `?situacao=ativo`

**Resposta esperada**:
```json
{
  "success": true,
  "data": [
    {
      "id": 12345,
      "codigo": "COL001",
      "nome": "Colar de Prata 925",
      "preco": 150.00,
      "precoCusto": 80.00,
      "margem": 87.5,
      "estoque": 15,
      "imagemURL": "https://example.com/image.jpg",
      "situacao": "ativo"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

#### **GET** `/api/produtos/loja-fisica`
- Retorna lista de produtos da loja física (`loja_fisica`)
- Suporta paginação: `?page=1&limit=20`
- Suporta busca: `?search=anel`
- Inclui imagem em Base64 da view `vw_dprodutos`

**Resposta esperada**:
```json
{
  "success": true,
  "data": [
    {
      "codigoInterno": "0000000023380",
      "codigoBarras": "7891234567890",
      "descricao": "ANEL PRATA 925 COM ZIRCONIA",
      "descricaoResumida": "ANEL PRATA ZIRCONIA",
      "estoque": 8,
      "imagemBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 80,
    "totalPages": 4
  }
}
```

---

#### **GET** `/api/produtos/ecommerce/:codigo`
- Retorna detalhes de um produto específico do e-commerce

---

#### **GET** `/api/produtos/loja-fisica/:codigo`
- Retorna detalhes de um produto específico da loja física

---

### 2. Configuração do Banco de Dados

Crie um arquivo `config/database.js` com pool de conexões:

```javascript
const mysql = require('mysql2/promise');

const poolEcommerce = mysql.createPool({
  host: process.env.DB_ECOMMERCE_HOST,
  user: process.env.DB_ECOMMERCE_USER,
  password: process.env.DB_ECOMMERCE_PASSWORD,
  database: 'db_gringao',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const poolLojaFisica = mysql.createPool({
  host: process.env.DB_LOJA_HOST,
  user: process.env.DB_LOJA_USER,
  password: process.env.DB_LOJA_PASSWORD,
  database: 'loja_fisica',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = { poolEcommerce, poolLojaFisica };
```

---

### 3. Middleware de Erro

Implemente um middleware global para tratamento de erros:

```javascript
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
```

---

### 4. Variáveis de Ambiente

Crie um arquivo `.env.example`:

```env
# Servidor
PORT=3001
NODE_ENV=development

# Banco E-commerce
DB_ECOMMERCE_HOST=seu_host_ecommerce
DB_ECOMMERCE_USER=seu_usuario
DB_ECOMMERCE_PASSWORD=sua_senha

# Banco Loja Física
DB_LOJA_HOST=seu_host_loja
DB_LOJA_USER=seu_usuario
DB_LOJA_PASSWORD=sua_senha

# CORS
CORS_ORIGIN=http://localhost:3000
```

---

## 🎨 Requisitos Funcionais do Frontend

### 1. Páginas Principais

#### **Home** (`/`)
- Exibe logo da joalheria
- Botões para navegar para:
  - "Catálogo E-commerce"
  - "Catálogo Loja Física"

---

#### **Catálogo E-commerce** (`/ecommerce`)
- Grid responsivo de cards de produtos
- Cada card exibe:
  - Imagem do produto (ou placeholder se não houver)
  - Código do produto
  - Nome/descrição
  - Preço de venda (destaque)
  - Preço de custo (menor)
  - Badge com margem de lucro %
  - Quantidade em estoque
- Barra de busca no topo
- Paginação na parte inferior
- Loading state enquanto carrega

---

#### **Catálogo Loja Física** (`/loja-fisica`)
- Similar ao catálogo e-commerce, mas:
  - Exibe imagem em Base64
  - Mostra código interno e código de barras
  - Sem informação de preço (não disponível nas tabelas)

---

#### **Detalhes do Produto** (`/ecommerce/:codigo` ou `/loja-fisica/:codigo`)
- Exibe informações completas do produto
- Imagem em tamanho maior
- Todas as informações em layout detalhado
- Botão "Voltar" para o catálogo

---

### 2. Componentes Reutilizáveis

#### `ProductCard`
- Card visual do produto
- Props: `produto`, `tipo` (ecommerce ou loja)

#### `SearchBar`
- Input de busca com debounce
- Props: `onSearch`, `placeholder`

#### `Pagination`
- Controles de paginação
- Props: `currentPage`, `totalPages`, `onPageChange`

#### `Loading`
- Spinner ou skeleton loader

#### `EmptyState`
- Mensagem quando não há produtos

---

### 3. Estilização

#### Requisitos de UI/UX:
- Design moderno e limpo
- Responsivo (mobile-first)
- Paleta de cores elegante (sugestão: dourado/preto para joalheria)
- Animações suaves de hover nos cards
- Loading states visuais
- Tratamento de erros com mensagens amigáveis

#### Exemplo de Card de Produto (CSS):
```css
.product-card {
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  background: #f5f5f5;
}

.product-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #FFD700;
  color: #000;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 12px;
}
```

---

### 4. React Query Setup

Configure o React Query para cache e gerenciamento de estado:

```javascript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});
```

---

## 📁 Estrutura de Arquivos Sugerida

### Backend (`/backend`)
```
backend/
├── config/
│   └── database.js          # Configuração de conexões MySQL
├── controllers/
│   ├── ecommerceController.js
│   └── lojaFisicaController.js
├── routes/
│   └── produtos.js          # Rotas da API
├── middleware/
│   └── errorHandler.js      # Tratamento de erros
├── utils/
│   └── helpers.js           # Funções auxiliares
├── .env.example             # Exemplo de variáveis de ambiente
├── .env                     # Variáveis de ambiente (não commitar)
├── .gitignore
├── package.json
└── server.js                # Entrada da aplicação
```

### Frontend (`/frontend`)
```
frontend/
├── src/
│   ├── components/
│   │   ├── ProductCard/
│   │   │   ├── ProductCard.jsx
│   │   │   └── ProductCard.module.css
│   │   ├── SearchBar/
│   │   │   ├── SearchBar.jsx
│   │   │   └── SearchBar.module.css
│   │   ├── Pagination/
│   │   │   ├── Pagination.jsx
│   │   │   └── Pagination.module.css
│   │   ├── Loading/
│   │   │   └── Loading.jsx
│   │   └── EmptyState/
│   │       └── EmptyState.jsx
│   ├── pages/
│   │   ├── Home/
│   │   │   ├── Home.jsx
│   │   │   └── Home.module.css
│   │   ├── Ecommerce/
│   │   │   ├── EcommerceCatalog.jsx
│   │   │   └── EcommerceCatalog.module.css
│   │   ├── LojaFisica/
│   │   │   ├── LojaFisicaCatalog.jsx
│   │   │   └── LojaFisicaCatalog.module.css
│   │   └── ProductDetail/
│   │       ├── ProductDetail.jsx
│   │       └── ProductDetail.module.css
│   ├── services/
│   │   └── api.js           # Configuração do Axios
│   ├── hooks/
│   │   └── useProducts.js   # Custom hooks com React Query
│   ├── utils/
│   │   └── formatters.js    # Formatação de preços, etc.
│   ├── App.jsx              # Configuração de rotas
│   ├── App.css              # Estilos globais
│   └── main.jsx             # Entrada da aplicação
├── .env.example
├── .env
├── .gitignore
├── package.json
└── vite.config.js           # Configuração do Vite
```

---

## 🔧 Requisitos Técnicos Adicionais

### 1. Tratamento de Imagens

**E-commerce**:
- Se `imagemURL` estiver vazia, exibir imagem placeholder
- Validar se a URL é válida antes de renderizar

**Loja Física**:
- A coluna `img` contém Base64 ou está vazia
- Se vazia, exibir placeholder
- Formato esperado: `data:image/jpeg;base64,{base64_string}`

---

### 2. Cálculo de Margem de Lucro

```javascript
const calcularMargem = (precoVenda, precoCusto) => {
  if (!precoCusto || precoCusto === 0) return 0;
  return ((precoVenda - precoCusto) / precoCusto * 100).toFixed(2);
};
```

---

### 3. Formatação de Valores

```javascript
const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};
```

---

### 4. Otimizações de Performance

- Implementar **lazy loading** para imagens
- Usar **React.memo** nos componentes de produto
- Implementar **debounce** na busca (300ms)
- Limitar tamanho das imagens Base64 retornadas (máx 500KB)
- Usar **paginação** no backend (limit/offset)

---

### 5. Segurança

- Validar inputs no backend
- Usar **prepared statements** para prevenir SQL injection
- Sanitizar strings de busca
- Configurar CORS adequadamente
- Não expor mensagens de erro detalhadas em produção

---

## ✅ Checklist de Entrega

### Backend
- [ ] Configuração de conexões MySQL com pool
- [ ] Endpoints GET funcionais para ambos os bancos
- [ ] Paginação implementada
- [ ] Busca por texto implementada
- [ ] Tratamento de erros global
- [ ] Validação de inputs
- [ ] CORS configurado
- [ ] Documentação dos endpoints (README ou Swagger)

### Frontend
- [ ] Página Home com navegação
- [ ] Catálogo E-commerce funcional
- [ ] Catálogo Loja Física funcional
- [ ] Página de detalhes do produto
- [ ] Busca com debounce
- [ ] Paginação funcional
- [ ] Loading states
- [ ] Tratamento de erros na UI
- [ ] Design responsivo (mobile, tablet, desktop)
- [ ] Imagens placeholder para produtos sem imagem

---

## 📝 Observações Importantes

1. **Case Sensitivity**: 
   - `db_gringao`: colunas em minúsculas
   - `loja_fisica`: colunas em MAIÚSCULAS

2. **JOIN com vw_dprodutos**:
   - Sempre use `LPAD(CODIGO_INTERNO, 13, '0')` para fazer JOIN

3. **Performance**:
   - Limite de 20 produtos por página
   - Cache de queries recomendado (usar Redis futuramente)

4. **Dados Read-Only**:
   - Ambos os bancos são **READ-ONLY**
   - Não implementar funcionalidades de criação/edição/exclusão

5. **Fallbacks**:
   - Sempre ter fallback para imagens ausentes
   - Tratar valores NULL/undefined gracefully

---

## 🚀 Comandos de Execução

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 📚 Dependências Principais

### Backend (`package.json`)
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.5",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

### Frontend (`package.json`)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2",
    "@tanstack/react-query": "^5.12.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  }
}
```

---

## 🎯 Resultado Esperado

Uma aplicação web moderna, responsiva e performática que permita visualizar o catálogo de produtos de ambos os canais (e-commerce e loja física) com todas as informações relevantes apresentadas de forma clara e elegante, adequada ao contexto de uma joalheria de alto padrão.

---

**Bom desenvolvimento! 💎✨**
