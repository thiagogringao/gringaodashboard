# Backend - Catálogo de Produtos

API REST para gerenciamento de catálogo de produtos da joalheria.

## Stack Tecnológica

- **Node.js** (v18+)
- **Express.js** - Framework web
- **MySQL2** - Driver MySQL com suporte a Promises
- **CORS** - Middleware para CORS
- **dotenv** - Gerenciamento de variáveis de ambiente

## Estrutura de Arquivos

```
backend/
├── config/
│   └── database.js          # Configuração de conexões MySQL (2 pools)
├── controllers/
│   ├── ecommerceController.js    # Lógica de negócio do e-commerce
│   └── lojaFisicaController.js   # Lógica de negócio da loja física
├── routes/
│   └── produtos.js          # Definição de rotas
├── middleware/
│   └── errorHandler.js      # Tratamento global de erros
├── utils/
│   └── helpers.js           # Funções auxiliares
├── .env                     # Variáveis de ambiente (não commitar)
├── .env.example             # Exemplo de variáveis
├── .gitignore
├── package.json
└── server.js                # Entrada da aplicação
```

## Instalação

```bash
npm install
```

## Configuração

1. Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

2. Configure as variáveis no arquivo `.env`:
```env
PORT=3001
NODE_ENV=development

# Banco E-commerce (db_gringao)
DB_ECOMMERCE_HOST=seu_host
DB_ECOMMERCE_USER=seu_usuario
DB_ECOMMERCE_PASSWORD=sua_senha

# Banco Loja Física (loja_fisica)
DB_LOJA_HOST=seu_host
DB_LOJA_USER=seu_usuario
DB_LOJA_PASSWORD=sua_senha

CORS_ORIGIN=http://localhost:3000
```

## Scripts

- `npm start` - Inicia o servidor em modo produção
- `npm run dev` - Inicia o servidor em modo desenvolvimento (nodemon)

## API Endpoints

### Health Check
```
GET /health
```
Retorna o status do servidor.

### E-commerce

#### Listar Produtos
```
GET /api/produtos/ecommerce
```

**Query Parameters:**
- `page` (number, opcional): Página (padrão: 1)
- `limit` (number, opcional): Itens por página (padrão: 20)
- `search` (string, opcional): Buscar por código ou nome
- `situacao` (string, opcional): Filtrar por situação (padrão: 'ativo')

**Resposta:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

#### Obter Produto Específico
```
GET /api/produtos/ecommerce/:codigo
```

**Resposta:**
```json
{
  "success": true,
  "data": {
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
}
```

### Loja Física

#### Listar Produtos
```
GET /api/produtos/loja-fisica
```

**Query Parameters:**
- `page` (number, opcional): Página (padrão: 1)
- `limit` (number, opcional): Itens por página (padrão: 20)
- `search` (string, opcional): Buscar por código, código de barras ou descrição

**Resposta:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 80,
    "totalPages": 4
  }
}
```

#### Obter Produto Específico
```
GET /api/produtos/loja-fisica/:codigo
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "codigoInterno": "0000000023380",
    "codigoBarras": "7891234567890",
    "descricao": "ANEL PRATA 925",
    "descricaoResumida": "ANEL PRATA",
    "estoque": 8,
    "imagemBase64": "data:image/jpeg;base64,..."
  }
}
```

## Estrutura dos Bancos de Dados

### Banco E-commerce: `db_gringao`

**Tabela**: `bling2_produtos`

Colunas utilizadas:
- `id` (BIGINT) - ID único
- `codigo` (VARCHAR) - Código do produto
- `nome` (VARCHAR) - Nome do produto
- `preco` (DECIMAL) - Preço de venda
- `precoCusto` (DECIMAL) - Preço de custo
- `estoque` (INT) - Quantidade em estoque
- `situacao` (VARCHAR) - Status (ativo/inativo)
- `imagemURL` (VARCHAR) - URL da imagem

**Observações:**
- Colunas em **minúsculas**
- Filtrar por `situacao = 'ativo'`

### Banco Loja Física: `loja_fisica`

**Tabela**: `produtos`
- `CODIGO_INTERNO` (VARCHAR) - Código interno
- `CODIGO_BARRAS` (VARCHAR) - Código de barras
- `DESCRICAO` (VARCHAR) - Descrição completa
- `DESCRICAO_RESUMIDA` (VARCHAR) - Descrição resumida

**View**: `vw_dprodutos`
- `CODIGO_INTERNO` (VARCHAR) - Código (com padding)
- `DESCRICAO` (VARCHAR) - Descrição
- `img` (TEXT) - Imagem em Base64

**Tabela**: `estoque`
- `CODIGO_INTERNO` (VARCHAR) - Código do produto
- `QUANTIDADE_ATUAL` (INT) - Quantidade atual

**Observações:**
- Colunas em **MAIÚSCULAS**
- JOIN com view usando `LPAD(CODIGO_INTERNO, 13, '0')`

## Segurança

### SQL Injection
- Uso de prepared statements em todas as queries
- Sanitização de strings de busca
- Validação de parâmetros

### CORS
- Configurado para aceitar apenas origem especificada em `.env`

### Variáveis Sensíveis
- Credenciais em arquivo `.env` (não versionado)
- `.env.example` para referência

### Tratamento de Erros
- Middleware global de erros
- Mensagens genéricas em produção
- Stack trace apenas em desenvolvimento

## Performance

### Pool de Conexões
- 2 pools separados (e-commerce e loja física)
- Limite de 10 conexões por pool
- Reutilização de conexões

### Queries Otimizadas
- Paginação no banco (LIMIT/OFFSET)
- Seleção apenas de colunas necessárias
- Índices nas colunas de busca (recomendado)

## Desenvolvimento

### Adicionar Novo Endpoint

1. Criar função no controller apropriado
2. Adicionar rota em `routes/produtos.js`
3. Testar com Postman/Insomnia
4. Documentar no README

### Estrutura de Resposta Padrão

**Sucesso:**
```json
{
  "success": true,
  "data": {...}
}
```

**Erro:**
```json
{
  "success": false,
  "message": "Mensagem de erro"
}
```

## Troubleshooting

### Erro de Conexão
- Verifique se os bancos estão acessíveis
- Confirme credenciais no `.env`
- Verifique firewall/rede

### Porta em Uso
- Altere `PORT` no `.env`
- Ou mate o processo: `netstat -ano | findstr :3001`

### CORS Error
- Verifique `CORS_ORIGIN` no `.env`
- Confirme que o frontend está rodando na origem correta

## Logs

O servidor registra:
- Inicialização na porta especificada
- Erros capturados pelo middleware
- Stack traces (apenas em desenvolvimento)

## Próximas Melhorias

- [ ] Implementar cache Redis
- [ ] Adicionar rate limiting
- [ ] Implementar logging estruturado (Winston)
- [ ] Adicionar testes unitários e integração
- [ ] Documentação Swagger/OpenAPI
- [ ] Health check detalhado (status dos bancos)
