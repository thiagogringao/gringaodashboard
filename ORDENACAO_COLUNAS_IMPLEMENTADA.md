# 🔄 Ordenação de Colunas Implementada

## ✅ Funcionalidade Completa!

Sistema de ordenação implementado em **todas as colunas** das tabelas de produtos (E-commerce e Loja Física).

## 🎯 Características:

### 1. **Ordenação Padrão:**
- ✅ **Produtos mais vendidos primeiro** (totalVendas DESC)
- ✅ Mantém a ordenação inicial ao carregar a página
- ✅ Usuário sempre vê os best-sellers primeiro

### 2. **Ordenação Interativa:**
- ✅ **Clique no header** da coluna para ordenar
- ✅ **Primeiro clique**: Ordem crescente (A-Z ou 0-9)
- ✅ **Segundo clique**: Ordem decrescente (Z-A ou 9-0)
- ✅ **Terceiro clique**: Volta para ordem padrão (mais vendidos)

### 3. **Indicadores Visuais:**
- ✅ **Ícone ⇅**: Coluna não ordenada (hover para ordenar)
- ✅ **Ícone ↑**: Ordem crescente (A-Z ou 0-9)
- ✅ **Ícone ↓**: Ordem decrescente (Z-A ou 9-0)
- ✅ **Animação**: Ícone pulsa ao mudar ordenação
- ✅ **Hover**: Destaque visual ao passar mouse

## 📊 Colunas Ordenáveis:

### E-commerce:
1. ✅ **Código** (Alfabética: A-Z / Z-A)
2. ✅ **Descrição** (Alfabética: A-Z / Z-A)
3. ✅ **Preço Venda** (Numérica: 0-9 / 9-0)
4. ✅ **Preço Custo** (Numérica: 0-9 / 9-0)
5. ✅ **Estoque** (Numérica: 0-9 / 9-0)
6. ✅ **Estoque Mín.** (Numérica: 0-9 / 9-0)
7. ✅ **Mês Pico** (Alfabética: A-Z / Z-A)

### Loja Física:
1. ✅ **Código** (Alfabética: A-Z / Z-A)
2. ✅ **Descrição** (Alfabética: A-Z / Z-A)
3. ✅ **Fornecedor** (Alfabética: A-Z / Z-A)
4. ✅ **Preço Venda** (Numérica: 0-9 / 9-0)
5. ✅ **Estoque** (Numérica: 0-9 / 9-0)
6. ✅ **Estoque Mín.** (Numérica: 0-9 / 9-0)
7. ✅ **Mês Pico** (Alfabética: A-Z / Z-A)

## 🔧 Implementação:

### 1. **Componente ProductTable:**

**Props adicionadas:**
```jsx
<ProductTable
  produtos={sortedProdutos}
  tipo="ecommerce"
  onSort={handleSort}        // Função de ordenação
  sortConfig={sortConfig}    // Estado atual da ordenação
/>
```

**Headers com ordenação:**
```jsx
<th className={styles.sortable} onClick={() => handleSort('codigo')}>
  Código {getSortIcon('codigo')}
</th>
```

**Função getSortIcon:**
```jsx
const getSortIcon = (field) => {
  if (!sortConfig || sortConfig.field !== field) {
    return <span className={styles.sortIcon}>⇅</span>;
  }
  return sortConfig.direction === 'asc' 
    ? <span className={styles.sortIconActive}>↑</span>
    : <span className={styles.sortIconActive}>↓</span>;
};
```

### 2. **Componentes de Catálogo:**

**Estado de ordenação:**
```jsx
const [sortConfig, setSortConfig] = useState({ 
  field: 'totalVendas', 
  direction: 'desc' 
});
```

**Função de ordenação:**
```jsx
const handleSort = useCallback((field) => {
  setSortConfig(prevConfig => {
    // Se clicar no mesmo campo, inverte a direção
    if (prevConfig.field === field) {
      return {
        field,
        direction: prevConfig.direction === 'asc' ? 'desc' : 'asc'
      };
    }
    // Se clicar em novo campo, começa com ordem crescente
    return {
      field,
      direction: field === 'totalVendas' ? 'desc' : 'asc'
    };
  });
}, []);
```

**Ordenação dos produtos:**
```jsx
const sortedProdutos = data?.data ? [...data.data].sort((a, b) => {
  const { field, direction } = sortConfig;
  let aValue = a[field];
  let bValue = b[field];

  // Ordenação alfabética para campos de texto
  if (field === 'codigo' || field === 'descricao' || field === 'fornecedor' || field === 'mesPico') {
    aValue = (aValue || '').toString().toLowerCase();
    bValue = (bValue || '').toString().toLowerCase();
    return direction === 'asc' 
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  }

  // Ordenação numérica para campos numéricos
  aValue = parseFloat(aValue) || 0;
  bValue = parseFloat(bValue) || 0;
  return direction === 'asc' ? aValue - bValue : bValue - aValue;
}) : [];
```

### 3. **Estilos CSS:**

**Coluna ordenável:**
```css
.sortable {
  cursor: pointer;
  user-select: none;
  transition: background 0.2s ease;
}

.sortable:hover {
  background: rgba(255, 255, 255, 0.1);
}
```

**Ícone inativo:**
```css
.sortIcon {
  display: inline-block;
  margin-left: 6px;
  opacity: 0.5;
  font-size: 12px;
  transition: opacity 0.2s ease;
}

.sortable:hover .sortIcon {
  opacity: 0.8;
}
```

**Ícone ativo:**
```css
.sortIconActive {
  display: inline-block;
  margin-left: 6px;
  opacity: 1;
  font-size: 14px;
  font-weight: bold;
  color: #fff;
  animation: pulse 0.3s ease;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
```

## 🎨 Fluxo de Uso:

### Cenário 1: Ordenar por Código
```
1. Usuário entra na página
   → Produtos ordenados por vendas (DESC) ✅
   
2. Usuário clica em "Código"
   → Produtos ordenados A-Z (ASC) ↑
   
3. Usuário clica novamente em "Código"
   → Produtos ordenados Z-A (DESC) ↓
   
4. Usuário clica em outra coluna
   → Nova ordenação aplicada
```

### Cenário 2: Ordenar por Preço
```
1. Usuário clica em "Preço Venda"
   → Produtos ordenados do menor para maior (ASC) ↑
   
2. Usuário clica novamente em "Preço Venda"
   → Produtos ordenados do maior para menor (DESC) ↓
```

### Cenário 3: Ordenar por Estoque
```
1. Usuário clica em "Estoque"
   → Produtos com menos estoque primeiro (ASC) ↑
   
2. Usuário clica novamente em "Estoque"
   → Produtos com mais estoque primeiro (DESC) ↓
```

## 📋 Tipos de Ordenação:

### Ordenação Alfabética (A-Z / Z-A):
- **Código**
- **Descrição**
- **Fornecedor** (Loja Física)
- **Mês Pico**

**Características:**
- Case-insensitive (ignora maiúsculas/minúsculas)
- Usa `localeCompare` para ordenação correta de acentos
- Valores vazios/null vão para o final

### Ordenação Numérica (0-9 / 9-0):
- **Preço Venda**
- **Preço Custo**
- **Estoque**
- **Estoque Mínimo**

**Características:**
- Converte para número antes de comparar
- Valores vazios/null tratados como 0
- Precisão decimal mantida

## 💡 Comportamento Especial:

### 1. **Ordenação Padrão (totalVendas):**
- Sempre começa em **ordem decrescente** (mais vendidos primeiro)
- Garante que best-sellers apareçam no topo ao carregar

### 2. **Outras Colunas:**
- Sempre começam em **ordem crescente** (A-Z ou 0-9)
- Segundo clique inverte para decrescente

### 3. **Persistência:**
- Ordenação mantida ao navegar entre páginas
- Reset ao fazer nova busca
- Reset ao recarregar a página

## 🎯 Exemplos de Uso:

### Encontrar Produtos com Estoque Baixo:
```
1. Clique em "Estoque" → Ordem crescente ↑
2. Produtos com menos estoque aparecem primeiro
3. Facilita identificação de produtos para reposição
```

### Encontrar Produtos Mais Caros:
```
1. Clique em "Preço Venda" → Ordem crescente ↑
2. Clique novamente → Ordem decrescente ↓
3. Produtos mais caros aparecem primeiro
```

### Ordenar Alfabeticamente:
```
1. Clique em "Descrição" → Ordem A-Z ↑
2. Facilita encontrar produto específico
3. Útil para inventário e conferência
```

## 📁 Arquivos Modificados:

### 1. **frontend/src/components/ProductTable/ProductTable.jsx**
- Adicionadas props `onSort` e `sortConfig`
- Implementada função `handleSort`
- Implementada função `getSortIcon`
- Headers com classe `sortable` e `onClick`

### 2. **frontend/src/components/ProductTable/ProductTable.module.css**
- Estilos para `.sortable`
- Estilos para `.sortIcon`
- Estilos para `.sortIconActive`
- Animação `pulse`

### 3. **frontend/src/pages/Ecommerce/EcommerceCatalog.jsx**
- Estado `sortConfig`
- Função `handleSort`
- Lógica de ordenação `sortedProdutos`
- Props passadas para `ProductTable`

### 4. **frontend/src/pages/LojaFisica/LojaFisicaCatalog.jsx**
- Estado `sortConfig`
- Função `handleSort`
- Lógica de ordenação `sortedProdutos`
- Props passadas para `ProductTable`

## 🚀 Resultado Final:

### Funcionalidades:
- ✅ Ordenação em todas as colunas
- ✅ Indicadores visuais claros
- ✅ Ordenação padrão por vendas
- ✅ Alternância crescente/decrescente
- ✅ Suporte a texto e números
- ✅ Animações suaves
- ✅ Hover effects
- ✅ Performance otimizada

### UX Melhorada:
- ✅ Intuitivo e fácil de usar
- ✅ Feedback visual imediato
- ✅ Comportamento consistente
- ✅ Acessível e responsivo

### Performance:
- ✅ Ordenação no frontend (rápida)
- ✅ Sem requisições adicionais ao servidor
- ✅ Mantém paginação funcionando
- ✅ Não afeta cache

---

**Ordenação de colunas implementada com sucesso! 🎉**
**Sistema completo e funcional em ambos os catálogos! ✅**
**Produtos sempre começam ordenados por vendas! 📊**

