# 🏷️ Lista Completa de Categorias

## ✅ Categorias Implementadas

O sistema agora reconhece **13 categorias** de produtos baseadas em palavras-chave na descrição.

---

## 📋 Categorias (Ordem Alfabética)

| # | Categoria | Palavras-chave | Exemplo |
|---|-----------|----------------|---------|
| 1 | **Anel** | anel, aneis, anéis | "ANEL SOLITARIO OURO 18K" |
| 2 | **Argola** | argola, argolas | "ARGOLA DOURADA 5CM" |
| 3 | **Brinco** | brinco, brincos | "BRINCO ZIRCONIA PRATA" |
| 4 | **Colar** | colar, colares, corrente, correntes | "COLAR CORAÇÃO PRATA 925" |
| 5 | **Conjunto** | conjunto, conjuntos | "CONJUNTO COLAR E BRINCO" |
| 6 | **Escapulário** | escapulario, escapulário, escapularios, escapulários | "ESCAPULÁRIO NOSSA SENHORA" |
| 7 | **Gargantilha** | gargantilha, gargantilhas | "GARGANTILHA CHOKER PRATA" |
| 8 | **Piercing** | piercing, piercings | "PIERCING NARIZ TITANIO" |
| 9 | **Pingente** | pingente, pingentes | "PINGENTE CRUZ OURO" |
| 10 | **Pulseira** | pulseira, pulseiras | "PULSEIRA PRATA 925" |
| 11 | **Terço** | terco, terço, tercos, terços | "TERÇO MADEIRA SAGRADA" |
| 12 | **Tornozeleira** | tornozeleira, tornozeleiras | "TORNOZELEIRA PINGENTES" |
| 13 | **Outro** | (nenhuma palavra-chave encontrada) | "PRODUTO ESPECIAL" |

---

## 🎯 Detalhes por Categoria

### 1️⃣ **Anel**
**Palavras-chave:** `anel`, `aneis`, `anéis`

**Exemplos de descrições detectadas:**
- "ANEL SOLITARIO OURO 18K"
- "ANEL DE ACO ADULTO"
- "ANEIS FEM PROMO"
- "PROMO ANEL FEM IMP"

---

### 2️⃣ **Argola**
**Palavras-chave:** `argola`, `argolas`

**Exemplos de descrições detectadas:**
- "ARGOLA DOURADA 5CM"
- "ARGOLA PROMOCAO NOVEMBRO"
- "ARGOLAS GRANDES PRATA"

---

### 3️⃣ **Brinco**
**Palavras-chave:** `brinco`, `brincos`

**Exemplos de descrições detectadas:**
- "BRINCO ZIRCONIA PRATA"
- "BRINCO SOLITARIO OURO"
- "BRINCOS ARGOLA PEQUENA"

---

### 4️⃣ **Colar**
**Palavras-chave:** `colar`, `colares`, `corrente`, `correntes`

**Exemplos de descrições detectadas:**
- "COLAR CORAÇÃO PRATA 925"
- "COLAR PONTO DE LUZ"
- "CORRENTE MASCULINA GROSSA"
- "CORRENTES PRATA ITALIANA"

---

### 5️⃣ **Conjunto** ✨ NOVO
**Palavras-chave:** `conjunto`, `conjuntos`

**Exemplos de descrições detectadas:**
- "CONJUNTO COLAR E BRINCO"
- "CONJUNTO SEMI JOIA COMPLETO"
- "CONJUNTOS FEMININOS DOURADO"

---

### 6️⃣ **Escapulário** ✨ NOVO
**Palavras-chave:** `escapulario`, `escapulário`, `escapularios`, `escapulários`

**Exemplos de descrições detectadas:**
- "ESCAPULÁRIO NOSSA SENHORA"
- "ESCAPULARIO OURO 18K"
- "ESCAPULÁRIOS RELIGIOSOS"

---

### 7️⃣ **Gargantilha** ✨ NOVO
**Palavras-chave:** `gargantilha`, `gargantilhas`

**Exemplos de descrições detectadas:**
- "GARGANTILHA CHOKER PRATA"
- "GARGANTILHA VELUDO PINGENTE"
- "GARGANTILHAS FEMININAS"

---

### 8️⃣ **Piercing**
**Palavras-chave:** `piercing`, `piercings`

**Exemplos de descrições detectadas:**
- "PIERCING NARIZ TITANIO"
- "PIERCING UMBIGO ZIRCONIA"
- "PIERCINGS VARIADOS"

---

### 9️⃣ **Pingente**
**Palavras-chave:** `pingente`, `pingentes`

**Exemplos de descrições detectadas:**
- "PINGENTE CRUZ OURO"
- "PINGENTE CORAÇÃO PRATA"
- "PINGENTES RELIGIOSOS"

---

### 🔟 **Pulseira**
**Palavras-chave:** `pulseira`, `pulseiras`

**Exemplos de descrições detectadas:**
- "PULSEIRA PRATA 925"
- "PULSEIRA COURO MASCULINA"
- "PULSEIRAS FEMININAS DELICADAS"

---

### 1️⃣1️⃣ **Terço** ✨ NOVO
**Palavras-chave:** `terco`, `terço`, `tercos`, `terços`

**Exemplos de descrições detectadas:**
- "TERÇO MADEIRA SAGRADA"
- "TERCO CRISTAL IMPORTADO"
- "TERÇOS RELIGIOSOS VARIADOS"

---

### 1️⃣2️⃣ **Tornozeleira**
**Palavras-chave:** `tornozeleira`, `tornozeleiras`

**Exemplos de descrições detectadas:**
- "TORNOZELEIRA PINGENTES"
- "TORNOZELEIRA PRATA DELICADA"
- "TORNOZELEIRAS FEMININAS"

---

### 1️⃣3️⃣ **Outro**
**Quando:** Nenhuma palavra-chave é encontrada na descrição

**Exemplos de descrições detectadas:**
- "PRODUTO ESPECIAL XYZ"
- "UNID AN ACO VAZ FEMININO CHINA"
- "ITEM PROMOCIONAL"

---

## 🔍 Lógica de Detecção

### **Prioridade:**
1. ✅ Se o produto já tem categoria no banco → **usa a do banco**
2. ✅ Se não tem → **analisa a descrição automaticamente**

### **Case-Insensitive:**
A busca não diferencia maiúsculas de minúsculas:
- "ANEL" = "anel" = "Anel" → **Anel**

### **Acentuação:**
O sistema detecta com e sem acento:
- "anéis" = "aneis" → **Anel**
- "terço" = "terco" → **Terço**
- "escapulário" = "escapulario" → **Escapulário**

---

## 📊 Estatísticas de Uso

### **Categorias Mais Comuns:**
(Baseado em amostra de produtos)

| Categoria | Frequência Estimada |
|-----------|---------------------|
| Anel | ⭐⭐⭐⭐⭐ Alta |
| Argola | ⭐⭐⭐⭐ Média-Alta |
| Brinco | ⭐⭐⭐⭐ Média-Alta |
| Pulseira | ⭐⭐⭐ Média |
| Colar | ⭐⭐⭐ Média |
| Pingente | ⭐⭐ Baixa-Média |
| Conjunto | ⭐⭐ Baixa-Média |
| Gargantilha | ⭐ Baixa |
| Tornozeleira | ⭐ Baixa |
| Piercing | ⭐ Baixa |
| Terço | ⭐ Baixa |
| Escapulário | ⭐ Baixa |
| Outro | ⭐⭐ Baixa-Média |

---

## 🎨 Visualização nos Filtros

### **Dropdown de Categorias:**
```
┌─────────────────────────┐
│ Selecione a Categoria   │
├─────────────────────────┤
│ Todas                   │
│ Anel                    │
│ Argola                  │
│ Brinco                  │
│ Colar                   │
│ Conjunto                │
│ Escapulário             │
│ Gargantilha             │
│ Piercing                │
│ Pingente                │
│ Pulseira                │
│ Terço                   │
│ Tornozeleira            │
│ Outro                   │
└─────────────────────────┘
```

---

## 🔧 Onde Está Implementado

### **Backend:**
✅ **Loja Física** - `getLojaFisicaProdutos` (linha 236-280)
✅ **Sugestão de Compras** - `getLojaFisicaProdutosAbaixoEstoqueIdeal` (linha 45-64)
✅ **Picos e Quedas** - `getLojaFisicaProdutosPicosQueda` (linha 707-726)

### **Frontend:**
✅ **Componente Filtros** - Dropdown de categorias
✅ **ProductTable** - Coluna "Categoria"
✅ **Todas as páginas** - Exibição e filtros

---

## 🧪 Como Testar

### **1. Teste via API:**
```bash
curl "http://localhost:3001/api/produtos/loja-fisica?page=1&limit=10"
```

### **2. Teste no Frontend:**
```
http://localhost:3000/loja-fisica
http://localhost:3000/sugestao-compras
http://localhost:3000/picos-queda
```

### **3. Teste os Filtros:**
- Clique em "🔍 Filtros"
- Selecione uma categoria
- Veja apenas produtos dessa categoria

---

## ➕ Adicionar Nova Categoria

### **Passo a Passo:**

1. **Edite o arquivo:**
   ```
   backend/controllers/lojaFisicaController.js
   ```

2. **Adicione nova verificação em TODAS as 3 funções:**
   ```javascript
   if (desc.includes('nova_palavra') || desc.includes('outra_palavra')) {
     return 'Nova Categoria';
   }
   ```

3. **Reinicie o backend:**
   ```bash
   Stop-Process -Name node -Force
   cd backend
   npm run dev
   ```

4. **Teste:**
   ```bash
   curl "http://localhost:3001/api/produtos/loja-fisica?page=1&limit=5"
   ```

---

## 📝 Notas Importantes

### **✅ Vantagens:**
- Categorização automática e instantânea
- Não requer atualização manual do banco
- Funciona para todos os produtos
- Fácil adicionar novas categorias

### **⚠️ Limitações:**
- Depende de palavras-chave na descrição
- Produtos com descrições genéricas vão para "Outro"
- Primeira palavra-chave encontrada define a categoria

### **💡 Dicas:**
- Mantenha descrições claras e específicas
- Use palavras-chave consistentes
- Revise produtos categorizados como "Outro"

---

## 📊 Resumo

| Item | Valor |
|------|-------|
| **Total de Categorias** | 13 |
| **Categorias Novas** | 4 (Conjunto, Escapulário, Gargantilha, Terço) |
| **Categorias Originais** | 9 |
| **Funções Atualizadas** | 3 (Loja Física, Sugestão, Picos) |
| **Palavras-chave Totais** | ~30 |

---

**Sistema de categorização completo e atualizado!** 🏷️✨

**13 categorias disponíveis para organizar seus produtos!** 🎉
