# 🏷️ Categorização Automática de Produtos

## ✅ Funcionalidade Implementada

### 📝 Análise Inteligente da Descrição

O sistema agora **analisa automaticamente a descrição** de cada produto e atribui uma **categoria** baseada em palavras-chave encontradas no texto.

---

## 🎯 Como Funciona

### **Lógica de Categorização:**

O sistema busca palavras-chave na descrição do produto (case-insensitive) e atribui a categoria correspondente:

```javascript
const categorizarProduto = (descricao) => {
  if (!descricao) return 'Outro';
  
  const desc = descricao.toLowerCase();
  
  // Verificar palavras-chave para cada categoria
  if (desc.includes('argola') || desc.includes('argolas')) return 'Argola';
  if (desc.includes('pulseira') || desc.includes('pulseiras')) return 'Pulseira';
  if (desc.includes('brinco') || desc.includes('brincos')) return 'Brinco';
  if (desc.includes('anel') || desc.includes('aneis') || desc.includes('anéis')) return 'Anel';
  if (desc.includes('colar') || desc.includes('colares') || desc.includes('corrente') || desc.includes('correntes')) return 'Colar';
  if (desc.includes('tornozeleira') || desc.includes('tornozeleiras')) return 'Tornozeleira';
  if (desc.includes('pingente') || desc.includes('pingentes')) return 'Pingente';
  if (desc.includes('piercing') || desc.includes('piercings')) return 'Piercing';
  
  return 'Outro';
};
```

---

## 📊 Categorias Disponíveis

| Categoria | Palavras-chave | Exemplo de Descrição |
|-----------|----------------|----------------------|
| **Argola** | argola, argolas | "ARGOLA DOURADA 3CM" |
| **Pulseira** | pulseira, pulseiras | "PULSEIRA PRATA 925" |
| **Brinco** | brinco, brincos | "BRINCO ZIRCONIA" |
| **Anel** | anel, aneis, anéis | "ANEL SOLITARIO OURO" |
| **Colar** | colar, colares, corrente, correntes | "COLAR PRATA CORAÇÃO" |
| **Tornozeleira** | tornozeleira, tornozeleiras | "TORNOZELEIRA PINGENTES" |
| **Pingente** | pingente, pingentes | "PINGENTE CRUZ PRATA" |
| **Piercing** | piercing, piercings | "PIERCING NARIZ TITANIO" |
| **Outro** | (nenhuma palavra-chave encontrada) | "PRODUTO DIVERSOS" |

---

## 🔍 Prioridade de Categorização

### **1. Categoria do Banco de Dados**
Se o produto já tem uma categoria definida no banco de dados, ela é mantida.

### **2. Categorização Automática**
Se a categoria estiver vazia (`null` ou `undefined`), o sistema analisa a descrição e atribui automaticamente.

```javascript
categoria: p.categoria || categorizarProduto(p.descricao)
```

---

## 📍 Onde Foi Implementado

### **Backend - Controller:**

✅ **Loja Física** (`getLojaFisicaProdutos`)
- Linha 217-250: Função de categorização
- Linha 259: Aplicação na resposta

✅ **Sugestão de Compras** (`getLojaFisicaProdutosAbaixoEstoqueIdeal`)
- Linha 44-60: Função de categorização
- Linha 121: Aplicação na resposta

✅ **Picos e Quedas** (`getLojaFisicaProdutosPicosQueda`)
- Linha 681-697: Função de categorização
- Linha 921: Aplicação na resposta

---

## 💻 Exemplos de Uso

### **Exemplo 1: Argola**
```
Descrição: "ARGOLA DOURADA 5CM"
Categoria: "Argola"
```

### **Exemplo 2: Pulseira**
```
Descrição: "PULSEIRA PRATA 925 COM ZIRCONIA"
Categoria: "Pulseira"
```

### **Exemplo 3: Brinco**
```
Descrição: "BRINCO SOLITARIO OURO 18K"
Categoria: "Brinco"
```

### **Exemplo 4: Múltiplas Palavras**
```
Descrição: "CONJUNTO COLAR E BRINCO"
Categoria: "Colar" (primeira palavra-chave encontrada)
```

### **Exemplo 5: Sem Palavra-chave**
```
Descrição: "PRODUTO ESPECIAL XYZ"
Categoria: "Outro"
```

---

## 🎯 Benefícios

### **1. Organização Automática**
✅ Produtos categorizados sem intervenção manual
✅ Consistência na nomenclatura
✅ Facilita filtros e buscas

### **2. Análise de Vendas**
✅ Relatórios por categoria
✅ Identificação de categorias mais vendidas
✅ Sugestões de compra por categoria

### **3. Gestão de Estoque**
✅ Controle de estoque por categoria
✅ Alertas específicos por tipo de produto
✅ Planejamento de compras otimizado

---

## 🔄 Fluxo de Dados

```
1. Produto no Banco de Dados
   ↓
2. API busca produto
   ↓
3. Verifica se tem categoria
   ↓
   SIM → Usa categoria do banco
   NÃO → Analisa descrição
   ↓
4. Categorização automática
   ↓
5. Retorna para frontend
   ↓
6. Exibe na coluna "Categoria"
```

---

## 📊 Visualização no Frontend

### **Loja Física:**
```
┌──────────────────────────────────────┐
│ Código │ Descrição │ Categoria       │
├────────┼───────────┼─────────────────┤
│ 020728 │ ARGOLA... │ Argola          │
│ 030456 │ PULSEIRA..│ Pulseira        │
│ 040789 │ BRINCO... │ Brinco          │
└──────────────────────────────────────┘
```

### **Sugestão de Compras:**
```
┌──────────────────────────────────────┐
│ Código │ Descrição │ Categoria       │
├────────┼───────────┼─────────────────┤
│ 020728 │ ARGOLA... │ Argola          │
│ 030456 │ PULSEIRA..│ Pulseira        │
└──────────────────────────────────────┘
```

### **Picos e Quedas:**
```
┌──────────────────────────────────────┐
│ Código │ Descrição │ Categoria       │
├────────┼───────────┼─────────────────┤
│ 020728 │ ARGOLA... │ Argola          │
│ 030456 │ PULSEIRA..│ Pulseira        │
└──────────────────────────────────────┘
```

---

## 🧪 Como Testar

### **1. Acesse qualquer página:**
```
http://localhost:3000/loja-fisica
http://localhost:3000/sugestao-compras
http://localhost:3000/picos-queda
```

### **2. Observe a coluna "Categoria":**
- ✅ Produtos com palavras-chave na descrição terão categoria atribuída
- ✅ Produtos sem palavras-chave terão "Outro"

### **3. Use os filtros:**
- ✅ Filtre por categoria específica
- ✅ Veja apenas produtos de uma categoria

---

## 🔧 Personalização

### **Adicionar Nova Categoria:**

1. Edite a função `categorizarProduto` em:
   - `backend/controllers/lojaFisicaController.js`

2. Adicione nova verificação:
```javascript
if (desc.includes('nova_palavra') || desc.includes('outra_palavra')) {
  return 'Nova Categoria';
}
```

3. Reinicie o backend:
```bash
npm run dev
```

---

## 📝 Exemplos Reais

### **Joalheria/Bijuteria:**

| Descrição Original | Categoria Atribuída |
|--------------------|---------------------|
| ARGOLA DOURADA 3CM | Argola |
| PULSEIRA PRATA 925 | Pulseira |
| BRINCO ZIRCONIA | Brinco |
| ANEL SOLITARIO | Anel |
| COLAR CORAÇÃO | Colar |
| TORNOZELEIRA PINGENTES | Tornozeleira |
| PINGENTE CRUZ | Pingente |
| PIERCING NARIZ | Piercing |
| CONJUNTO COMPLETO | Outro |

---

## 🎨 Integração com Filtros

### **Filtro por Categoria:**

O componente de filtros já está preparado para usar as categorias:

```jsx
<Filtros
  fornecedores={fornecedores}
  categorias={categorias}
  onFilterChange={handleFilterChange}
/>
```

**Categorias disponíveis:**
- Argola
- Pulseira
- Brinco
- Anel
- Colar
- Tornozeleira
- Pingente
- Piercing
- Outro

---

## 📊 Estatísticas

### **Após Implementação:**

✅ **100% dos produtos** têm categoria
✅ **Categorização instantânea** (sem delay)
✅ **Sem necessidade** de atualização manual
✅ **Consistência** em todas as páginas

---

## 🔄 Manutenção

### **Atualizar Palavras-chave:**

Se novos produtos não estão sendo categorizados corretamente:

1. Identifique a palavra-chave na descrição
2. Adicione na função `categorizarProduto`
3. Reinicie o backend
4. Produtos serão categorizados automaticamente

**Não é necessário atualizar o banco de dados!**

---

## 📁 Arquivos Modificados

### **Backend:**
✅ `backend/controllers/lojaFisicaController.js`
- Função `getLojaFisicaProdutos` (linha 217-259)
- Função `getLojaFisicaProdutosAbaixoEstoqueIdeal` (linha 44-121)
- Função `getLojaFisicaProdutosPicosQueda` (linha 681-921)

---

## ✨ Resultado Final

**Antes:**
```
Categoria: null
```

**Agora:**
```
Categoria: Argola (detectado automaticamente)
```

---

**Categorização automática implementada com sucesso!** 🏷️✨

**Agora você pode:**
- ✅ Ver categorias automaticamente atribuídas
- ✅ Filtrar produtos por categoria
- ✅ Analisar vendas por tipo de produto
- ✅ Organizar estoque por categoria

---

**Teste agora em qualquer página do sistema!** 🚀
