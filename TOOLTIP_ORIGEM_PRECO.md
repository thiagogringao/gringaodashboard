# 🏷️ Tooltip de Origem do Preço - Loja Física

## 📊 Funcionalidade Implementada

Agora a coluna **Preço Venda** na Loja Física mostra visualmente de onde o preço está vindo!

---

## 🎯 Como Funciona

### 1️⃣ Badge Visual

Cada preço agora tem um **badge colorido** ao lado indicando a origem:

| Badge | Cor | Significado |
|-------|-----|-------------|
| **R** | 🟢 Verde | **Valor Revenda** (prioridade 1) |
| **A** | 🔵 Azul | **Valor Atacado** (prioridade 2) |
| **V** | 🟠 Laranja | **Valor Varejo** (prioridade 3) |
| **P** | ⚪ Cinza | **Preço Padrão** (fallback) |

### 2️⃣ Tooltip ao Passar o Mouse

Ao passar o mouse sobre o preço, aparece um tooltip com a descrição completa:
- **"Origem: Valor Revenda"**
- **"Origem: Valor Atacado"**
- **"Origem: Valor Varejo"**
- **"Origem: Preço Padrão"**

---

## 🔄 Lógica de Prioridade

O sistema segue esta ordem para determinar o preço:

```
1. VALOR_REVENDA (se > 0)
   ↓ (se = 0 ou NULL)
2. VALOR_ATACADO (se > 0)
   ↓ (se = 0 ou NULL)
3. VALOR_VAREJO (se > 0)
   ↓ (se = 0 ou NULL)
4. VALOR_VENDA (tabela estoque)
```

---

## 📸 Exemplos Visuais

### Produto com Valor Revenda
```
R$ 4,80  [R]
         ↑
    Badge verde
```
**Tooltip:** "Origem: Valor Revenda"

### Produto com Valor Atacado
```
R$ 10,50  [A]
          ↑
     Badge azul
```
**Tooltip:** "Origem: Valor Atacado"

### Produto com Valor Varejo
```
R$ 15,00  [V]
          ↑
    Badge laranja
```
**Tooltip:** "Origem: Valor Varejo"

### Produto com Preço Padrão
```
R$ 11,97  [P]
          ↑
    Badge cinza
```
**Tooltip:** "Origem: Preço Padrão"

---

## 🎨 Cores e Significados

### 🟢 Verde (Revenda)
- **Melhor preço** para revenda
- Prioridade máxima
- Indica preço competitivo

### 🔵 Azul (Atacado)
- Preço para **compras em quantidade**
- Segunda opção quando revenda não disponível
- Bom para volume

### 🟠 Laranja (Varejo)
- Preço de **venda ao consumidor final**
- Usado quando atacado não disponível
- Margem maior

### ⚪ Cinza (Padrão)
- **Preço padrão** quando produto não tem classificação
- Usado quando produto não está na view de preços
- Preço base da tabela de estoque

---

## 💡 Benefícios

✅ **Transparência** - Saber de onde vem cada preço
✅ **Confiança** - Validar se o preço está correto
✅ **Gestão** - Identificar produtos que precisam de atualização
✅ **Visual** - Identificação rápida com cores

---

## 🚀 Como Usar

1. **Acesse** a página Loja Física
2. **Observe** os badges coloridos ao lado dos preços
3. **Passe o mouse** sobre o preço para ver o tooltip
4. **Identifique** rapidamente a origem de cada preço

---

## 🔧 Implementação Técnica

### Backend
- Campo `tipoPreco` adicionado nas queries
- Lógica `CASE WHEN` no SQL para determinar origem
- Retorna: 'revenda', 'atacado', 'varejo' ou 'estoque'

### Frontend
- Badge visual com cores distintas
- Tooltip nativo do HTML com `title`
- CSS com gradientes e sombras
- Responsivo e acessível

---

## 📊 Estatísticas

Agora você pode facilmente identificar:
- Quantos produtos usam **Valor Revenda**
- Quantos precisam de **atualização** (usando estoque)
- Quais produtos têm **preços diferenciados**

---

**Aproveite a nova funcionalidade!** 🎉
