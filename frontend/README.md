# Frontend - Catálogo de Produtos

Interface web moderna e responsiva para visualização do catálogo de produtos da joalheria.

## Stack Tecnológica

- **React 18** - Biblioteca JavaScript para UI
- **React Router DOM** - Roteamento
- **Axios** - Cliente HTTP
- **TanStack React Query** - Gerenciamento de estado de servidor
- **CSS Modules** - Estilização com escopo local
- **Vite** - Build tool e dev server

## Estrutura de Arquivos

```
frontend/
├── src/
│   ├── components/           # Componentes reutilizáveis
│   │   ├── ProductCard/      # Card de produto
│   │   ├── SearchBar/        # Barra de busca com debounce
│   │   ├── Pagination/       # Controles de paginação
│   │   ├── Loading/          # Spinner de carregamento
│   │   └── EmptyState/       # Estado vazio
│   ├── pages/                # Páginas da aplicação
│   │   ├── Home/             # Landing page
│   │   ├── Ecommerce/        # Catálogo e-commerce
│   │   ├── LojaFisica/       # Catálogo loja física
│   │   └── ProductDetail/    # Detalhes do produto
│   ├── services/             # Serviços externos
│   │   └── api.js            # Configuração Axios e chamadas API
│   ├── utils/                # Funções utilitárias
│   │   └── formatters.js     # Formatadores (moeda, etc)
│   ├── App.jsx               # Componente raiz e rotas
│   ├── App.css               # Estilos globais
│   └── main.jsx              # Entrada da aplicação
├── .env                      # Variáveis de ambiente
├── .env.example              # Exemplo de variáveis
├── .gitignore
├── index.html                # HTML base
├── package.json
└── vite.config.js            # Configuração do Vite
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

2. Configure a URL da API:
```env
VITE_API_URL=http://localhost:3001
```

## Scripts

- `npm run dev` - Inicia servidor de desenvolvimento (porta 3000)
- `npm run build` - Gera build de produção
- `npm run preview` - Preview do build de produção

## Páginas

### Home (`/`)
- Landing page com design elegante
- Dois cards para navegação:
  - Catálogo E-commerce
  - Catálogo Loja Física

### Catálogo E-commerce (`/ecommerce`)
- Grid responsivo de produtos
- Barra de busca com debounce (300ms)
- Paginação
- Informações exibidas:
  - Imagem do produto
  - Código
  - Nome/descrição
  - Preço de venda (destaque)
  - Preço de custo
  - Badge de margem de lucro
  - Quantidade em estoque
- Loading states
- Empty state se não houver produtos

### Catálogo Loja Física (`/loja-fisica`)
- Similar ao e-commerce
- Informações específicas:
  - Imagem em Base64
  - Código interno
  - Código de barras
  - Descrição completa e resumida
  - Estoque
- Sem informação de preços

### Detalhes do Produto (`/:tipo/:codigo`)
- Layout em duas colunas (imagem + informações)
- Imagem em tamanho maior
- Todas as informações detalhadas
- Botão "Voltar ao Catálogo"

## Componentes

### ProductCard
Componente de card de produto reutilizável.

**Props:**
- `produto` (object) - Dados do produto
- `tipo` (string) - 'ecommerce' ou 'loja-fisica'

**Features:**
- Lazy loading de imagens
- Fallback para imagens ausentes
- Design responsivo
- Animação hover
- React.memo para performance

### SearchBar
Barra de busca com debounce automático.

**Props:**
- `onSearch` (function) - Callback ao buscar
- `placeholder` (string) - Texto placeholder

**Features:**
- Debounce de 300ms
- Botão limpar busca
- Ícone de busca
- Acessibilidade

### Pagination
Controles de paginação inteligentes.

**Props:**
- `currentPage` (number) - Página atual
- `totalPages` (number) - Total de páginas
- `onPageChange` (function) - Callback ao mudar página

**Features:**
- Botões Anterior/Próximo
- Números de página com reticências
- Estado desabilitado
- Scroll automático ao topo

### Loading
Spinner de carregamento simples.

**Features:**
- Animação suave
- Texto de carregamento
- Centralizado

### EmptyState
Estado vazio quando não há dados.

**Props:**
- `message` (string) - Mensagem customizada

## Serviços

### API Service (`services/api.js`)

Configuração centralizada do Axios com:
- Base URL da API
- Timeout de 10 segundos
- Interceptor de erros
- Tratamento de erros amigável

**Funções:**

```javascript
fetchEcommerceProdutos({ page, search, limit })
fetchLojaFisicaProdutos({ page, search, limit })
fetchProdutoDetalhe(tipo, codigo)
```

## Utils

### Formatters (`utils/formatters.js`)

Funções utilitárias de formatação:

```javascript
formatarMoeda(valor)              // R$ 1.234,56
formatarPorcentagem(valor)        // 87.5%
formatarCodigoBarras(codigo)      // 123 456 789 012
validarImagemURL(url)             // true/false
truncarTexto(texto, limite)       // "Texto..."
```

## React Query

### Configuração

```javascript
{
  refetchOnWindowFocus: false,  // Não refetch ao focar janela
  retry: 1,                     // Tentar novamente 1 vez
  staleTime: 5 * 60 * 1000     // Cache de 5 minutos
}
```

### Query Keys

- `['ecommerce-produtos', page, search]`
- `['loja-fisica-produtos', page, search]`
- `['produto-detalhe', tipo, codigo]`

## Estilização

### CSS Modules
Cada componente tem seu próprio arquivo `.module.css` com escopos locais.

### Estilos Globais (`App.css`)
- Reset CSS
- Variáveis de cor
- Scrollbar customizada
- Tipografia
- Transições globais

### Paleta de Cores
- **Primária**: #667eea (roxo)
- **Secundária**: #764ba2 (roxo escuro)
- **Destaque**: #FFD700 (dourado)
- **Texto**: #2c3e50 (azul escuro)
- **Sucesso**: #27ae60 (verde)
- **Erro**: #e74c3c (vermelho)
- **Background**: #f8f9fa (cinza claro)

### Responsividade

Breakpoints:
- **Desktop**: > 968px
- **Tablet**: 768px - 968px
- **Mobile**: < 768px

Grid adaptável:
- Desktop: 4-5 colunas
- Tablet: 2-3 colunas
- Mobile: 1-2 colunas

## Performance

### Otimizações Implementadas

1. **React.memo** em ProductCard
2. **Lazy loading** de imagens
3. **Debounce** na busca (300ms)
4. **React Query cache** (5 minutos)
5. **Code splitting** (React Router)
6. **CSS Modules** (bundle otimizado)
7. **Vite** (HMR ultra-rápido)

### Métricas Alvo

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Score: > 90

## Acessibilidade

- Contraste adequado (WCAG AA)
- Focus visível (outline dourado)
- Labels em inputs
- Alt text em imagens
- Navegação por teclado
- Semântica HTML correta

## Tratamento de Erros

### Tipos de Erro

1. **Erro de Rede**: "Servidor não está respondendo"
2. **Erro 404**: "Produto não encontrado"
3. **Erro 500**: "Erro ao processar requisição"
4. **Timeout**: "Requisição demorou muito"

### UI de Erro

- Mensagens amigáveis
- Botões de retry/voltar
- Background vermelho claro
- Ícones informativos

## Desenvolvimento

### Estrutura de Componente Padrão

```jsx
import styles from './Component.module.css';

const Component = ({ prop1, prop2 }) => {
  return (
    <div className={styles.container}>
      {/* JSX */}
    </div>
  );
};

export default Component;
```

### Hooks Customizados

Potenciais hooks para criar:
- `useDebounce`
- `useLocalStorage`
- `useIntersectionObserver`

### Adicionar Nova Página

1. Criar pasta em `src/pages/`
2. Criar componente e CSS Module
3. Adicionar rota em `App.jsx`
4. Criar função de API se necessário

## Build para Produção

```bash
npm run build
```

Gera pasta `dist/` com:
- HTML minificado
- CSS otimizado e extraído
- JavaScript com tree-shaking
- Assets otimizados
- Source maps

### Preview

```bash
npm run preview
```

Serve o build de produção localmente para testar.

## Variáveis de Ambiente

Vite expõe apenas variáveis com prefixo `VITE_`:

```env
VITE_API_URL=http://localhost:3001
```

Acesso no código:
```javascript
import.meta.env.VITE_API_URL
```

## Troubleshooting

### Erro de CORS
- Verifique se backend está rodando
- Confirme `VITE_API_URL` no `.env`
- Verifique `CORS_ORIGIN` no backend

### Build Falha
- Limpe cache: `rm -rf node_modules && npm install`
- Verifique erros TypeScript/ESLint
- Confirme imports corretos

### Imagens Não Carregam
- Verifique URLs retornadas pela API
- Teste fallback placeholder
- Verifique console do navegador

## Próximas Melhorias

- [ ] Adicionar filtros avançados
- [ ] Implementar favoritos (localStorage)
- [ ] Adicionar modo escuro
- [ ] PWA (Service Worker)
- [ ] Testes (Vitest + React Testing Library)
- [ ] Storybook para componentes
- [ ] Internacionalização (i18n)
- [ ] Analytics (GA4)
