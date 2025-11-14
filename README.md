# Catálogo de Produtos - Joalheria

Aplicação web moderna para visualização de catálogo de produtos de uma joalheria com integração a bancos de dados MySQL para e-commerce e loja física.

## Tecnologias Utilizadas

### Backend
- Node.js 18+
- Express.js
- MySQL2
- CORS
- dotenv

### Frontend
- React 18+
- React Router DOM
- Axios
- TanStack React Query
- CSS Modules
- Vite

## Estrutura do Projeto

```
dashboardPRODUTOS/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── ecommerceController.js
│   │   └── lojaFisicaController.js
│   ├── routes/
│   │   └── produtos.js
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── utils/
│   │   └── helpers.js
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ProductCard/
    │   │   ├── SearchBar/
    │   │   ├── Pagination/
    │   │   ├── Loading/
    │   │   └── EmptyState/
    │   ├── pages/
    │   │   ├── Home/
    │   │   ├── Ecommerce/
    │   │   ├── LojaFisica/
    │   │   └── ProductDetail/
    │   ├── services/
    │   │   └── api.js
    │   ├── utils/
    │   │   └── formatters.js
    │   ├── App.jsx
    │   ├── App.css
    │   └── main.jsx
    ├── .env.example
    ├── .gitignore
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## Instalação e Configuração

### Backend

1. Entre na pasta do backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Edite o arquivo `.env` com suas credenciais de banco de dados:
```env
PORT=3001
NODE_ENV=development

# Banco E-commerce
DB_ECOMMERCE_HOST=seu_host
DB_ECOMMERCE_USER=seu_usuario
DB_ECOMMERCE_PASSWORD=sua_senha

# Banco Loja Física
DB_LOJA_HOST=seu_host
DB_LOJA_USER=seu_usuario
DB_LOJA_PASSWORD=sua_senha

CORS_ORIGIN=http://localhost:3000
```

5. Inicie o servidor:
```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3001`

### Frontend

1. Entre na pasta do frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Edite o arquivo `.env`:
```env
VITE_API_URL=http://localhost:3001
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O frontend estará rodando em `http://localhost:3000`

## Endpoints da API

### E-commerce

#### GET `/api/produtos/ecommerce`
Retorna lista paginada de produtos do e-commerce.

**Query Parameters:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 20)
- `search` (opcional): Termo de busca
- `situacao` (opcional): Filtro por situação (padrão: 'ativo')

**Resposta:**
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
      "imagemURL": "https://...",
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

#### GET `/api/produtos/ecommerce/:codigo`
Retorna detalhes de um produto específico do e-commerce.

### Loja Física

#### GET `/api/produtos/loja-fisica`
Retorna lista paginada de produtos da loja física.

**Query Parameters:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 20)
- `search` (opcional): Termo de busca

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "codigoInterno": "0000000023380",
      "codigoBarras": "7891234567890",
      "descricao": "ANEL PRATA 925",
      "descricaoResumida": "ANEL PRATA",
      "estoque": 8,
      "imagemBase64": "data:image/jpeg;base64,..."
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

#### GET `/api/produtos/loja-fisica/:codigo`
Retorna detalhes de um produto específico da loja física.

## Funcionalidades

### Frontend

- **Página Home**: Landing page com navegação para os dois catálogos
- **Catálogo E-commerce**:
  - Grid responsivo de produtos
  - Busca com debounce (300ms)
  - Paginação
  - Exibição de preços, custos e margem de lucro
  - Filtro de produtos ativos
- **Catálogo Loja Física**:
  - Grid responsivo de produtos
  - Busca com debounce
  - Paginação
  - Exibição de códigos e estoque
  - Imagens em Base64
- **Detalhes do Produto**:
  - Visualização completa das informações
  - Imagem em tamanho maior
  - Todos os dados do produto

### Backend

- **API REST** com endpoints para ambos os bancos
- **Paginação** em todas as listagens
- **Busca** por código, nome/descrição
- **Pool de conexões** MySQL otimizado
- **Tratamento de erros** centralizado
- **Sanitização** de inputs para segurança
- **CORS** configurado

## Segurança

- Prepared statements para prevenir SQL injection
- Sanitização de strings de busca
- Validação de inputs
- CORS configurado
- Variáveis de ambiente para credenciais
- Mensagens de erro genéricas em produção

## Performance

- React Query com cache de 5 minutos
- Lazy loading de imagens
- Debounce na busca (300ms)
- Paginação no backend
- Pool de conexões MySQL
- Componentes memoizados

## Design

- Design moderno e elegante
- Responsivo (mobile, tablet, desktop)
- Paleta de cores: dourado/preto/branco
- Animações suaves
- Loading states
- Empty states
- Tratamento de erros visual

## Observações Importantes

1. **Bancos Read-Only**: Os bancos de dados são apenas para leitura
2. **Case Sensitivity**:
   - `db_gringao`: colunas em minúsculas
   - `loja_fisica`: colunas em MAIÚSCULAS
3. **JOIN com view**: Use `LPAD(CODIGO_INTERNO, 13, '0')` para JOIN com `vw_dprodutos`
4. **Imagens**: Sempre tenha fallback para imagens ausentes

## Build para Produção

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## Licença

Este projeto foi desenvolvido para uso interno da joalheria.
