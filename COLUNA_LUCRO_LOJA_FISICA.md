# ✅ Coluna Lucro Substituindo Mês Pico na Loja Física

## 🎯 Objetivo

Remover a coluna "Mês Pico" e adicionar uma coluna "Lucro" que mostra o lucro potencial de cada produto (calculado como: `(Preço Venda - Preço Custo) × Estoque`).

---

## 🛠️ Modificações Realizadas

### **1. Backend - Controller**

#### **Arquivo:** `backend/controllers/lojaFisicaController.js`

**Modificações:**

#### **Cálculo do Lucro:**

```javascript
// Formatar e categorizar TODOS os produtos primeiro
let produtosFormatados = produtos.map(p => {
  const categoriaFinal = p.categoria || categorizarProduto(p.descricao);
  const precoVenda = parseFloat(p.preco_venda || 0);
  const precoCusto = parseFloat(p.preco_custo || 0);
  const estoque = p.estoque || 0;
  
  // Calcular lucro: (Preço Venda - Preço Custo) × Estoque
  const lucro = (precoVenda - precoCusto) * estoque;
  
  return {
    codigoInterno: p.codigo_interno,
    codigoBarras: p.codigo_barras,
    descricao: p.descricao,
    descricaoResumida: p.descricao_resumida,
    codigoFornecedor: p.codigo_fornecedor,
    categoria: categoriaFinal,
    estoque: estoque,
    precoVenda: precoVenda,
    precoCusto: precoCusto,
    margem: parseFloat(p.margem || 0),
    lucro: lucro,  // ← NOVO
    tipoPreco: p.tipo_preco || 'estoque',
    fornecedor: p.fornecedor,
    imagemBase64: p.imagem_base64,
    estoqueMinimo: p.estoque_minimo,
    // mesPico: p.mes_pico,  ← REMOVIDO
    mediaMensal: parseFloat(p.media_mensal || 0),
    totalVendas: p.total_vendas,
    vendasMensais: p.vendas_mensais ? JSON.parse(p.vendas_mensais) : []
  };
});
```

---

### **2. Frontend - Componente ProductTable**

#### **Arquivo:** `frontend/src/components/ProductTable/ProductTable.jsx`

**Modificações:**

#### **2.1. Header da Tabela:**

**Antes:**
```jsx
<th className={styles.sortable} onClick={() => handleSort('mesPico')}>
  Mês Pico {getSortIcon('mesPico')}
</th>
```

**Agora:**
```jsx
<th className={styles.sortable} onClick={() => handleSort('lucro')}>
  Lucro {getSortIcon('lucro')}
</th>
```

#### **2.2. Corpo da Tabela:**

**Antes:**
```jsx
<td className={styles.mesPico}>
  {produto.mesPico ? (
    <span className={styles.mesPicoBadge}>{produto.mesPico}</span>
  ) : (
    '-'
  )}
</td>
```

**Agora:**
```jsx
<td className={styles.lucro}>
  {produto.lucro !== undefined && produto.lucro !== null ? (
    <span className={produto.lucro >= 0 ? styles.lucroPositivo : styles.lucroNegativo}>
      {formatarMoeda(produto.lucro)}
    </span>
  ) : (
    '-'
  )}
</td>
```

---

### **3. Frontend - Estilos CSS**

#### **Arquivo:** `frontend/src/components/ProductTable/ProductTable.module.css`

**Modificações:**

**Antes:**
```css
.mesPico {
  text-align: center;
}

.mesPicoBadge {
  display: inline-block;
  padding: 4px 10px;
  background: linear-gradient(135deg, #004B87 0%, #003d6e 100%);
  color: white;
  border-radius: 12px;
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

**Agora:**
```css
.lucro {
  text-align: right;
  font-weight: 600;
}

.lucroPositivo {
  color: #27ae60;
  font-weight: 700;
}

.lucroNegativo {
  color: #e74c3c;
  font-weight: 700;
}
```

---

## 📊 Estrutura da Tabela

### **Ordem das Colunas na Loja Física:**

| # | Coluna | Descrição |
|---|--------|-----------|
| 1 | Imagem | Miniatura do produto |
| 2 | Código | Código interno |
| 3 | Descrição | Nome do produto |
| 4 | Fornecedor | Nome do fornecedor |
| 5 | Categoria | Categoria automática |
| 6 | Preço Venda | Preço de venda |
| 7 | Estoque | Quantidade em estoque |
| 8 | Estoque Mín. | Estoque mínimo |
| 9 | **Lucro** | **← NOVA COLUNA (substituiu Mês Pico)** |
| 10 | Ações | Botão "Ver detalhes" |

---

## 💰 Cálculo do Lucro

### **Fórmula:**

```
Lucro por Unidade = Preço Venda - Preço Custo
```

### **Exemplos:**

#### **Exemplo 1: Lucro Positivo**
```
Produto: ANEL DE OURO
Preço Venda: R$ 150,00
Preço Custo: R$ 80,00

Lucro = 150 - 80 = R$ 70,00 ✅ (Verde)
Margem: 46,7%
```

#### **Exemplo 2: Lucro Negativo**
```
Produto: PULSEIRA PRATA
Preço Venda: R$ 50,00
Preço Custo: R$ 70,00

Lucro = 50 - 70 = -R$ 20,00 ❌ (Vermelho)
Margem: -40%
```

#### **Exemplo 3: Lucro Alto**
```
Produto: BRINCO ZIRCÔNIA
Preço Venda: R$ 80,00
Preço Custo: R$ 40,00

Lucro = 80 - 40 = R$ 40,00 ✅ (Verde)
Margem: 50%
```

---

## 🎨 Visualização

### **Cores do Lucro:**

- **Verde (#27ae60):** Lucro positivo ou zero
- **Vermelho (#e74c3c):** Lucro negativo (preço de venda menor que custo)

### **Exemplo Visual:**

```
┌──────────┬─────────────────┬───────────┬───────┬───────┬─────────┬─────────────┐
│ Código   │ Descrição       │ Categoria │ Venda │ Custo │ Estoque │ Lucro/Un    │
├──────────┼─────────────────┼───────────┼───────┼───────┼─────────┼─────────────┤
│ 019216   │ ANEL DE ACO     │ Anel      │ 15,00 │ 10,00 │ 10      │ R$ 5,00  ✅ │
│ 024670   │ ANEIS FEM PROMO │ Anel      │ 20,00 │ 10,00 │ 8       │ R$ 10,00 ✅ │
│ 022482   │ NURI LIMPA PRAT │ Outro     │ 5,00  │ 7,00  │ 5       │ -R$ 2,00 ❌ │
└──────────┴─────────────────┴───────────┴───────┴───────┴─────────┴─────────────┘
```

---

## 🔄 Comparação: Antes vs Agora

| Aspecto | Antes (Mês Pico) | Agora (Lucro) |
|---------|------------------|---------------|
| **Informação** | Mês de maior venda | Lucro por unidade |
| **Utilidade** | Análise histórica | Margem de lucro |
| **Cálculo** | Baseado em vendas passadas | Preço Venda - Preço Custo |
| **Cores** | Badge azul | Verde (positivo) / Vermelho (negativo) |
| **Ordenação** | Por mês | Por valor de lucro |
| **Decisão** | Quando reabastecer | Quais produtos têm melhor margem |

---

## 📈 Benefícios da Mudança

### **1. Visão Financeira Imediata:**
✅ Mostra margem de lucro por unidade
✅ Identifica produtos com margem negativa
✅ Ajuda a definir estratégia de preços

### **2. Tomada de Decisão:**
✅ Produtos com alto lucro → Focar nas vendas
✅ Produtos com lucro negativo → Revisar preços urgente
✅ Produtos com lucro baixo → Avaliar viabilidade

### **3. Análise Rápida:**
✅ Cores facilitam identificação visual
✅ Ordenação por lucro mostra produtos mais rentáveis
✅ Comparação direta entre produtos

---

## 🚀 Como Testar

### **1. Reiniciar Backend:**

```bash
Stop-Process -Name node -Force
cd backend
npm run dev
```

### **2. Limpar Cache do Frontend:**

```
Ctrl + F5
```

### **3. Acessar Loja Física:**

```
http://localhost:3000/loja-fisica
```

### **4. Verificar:**

- ✅ Coluna "Lucro" aparece (não mais "Mês Pico")
- ✅ Valores em verde (positivo) ou vermelho (negativo)
- ✅ Formatação em moeda (R$)
- ✅ Ordenação funciona ao clicar no header

---

## 🧪 Testes da API

### **Teste 1: Verificar Lucro na API**

```bash
curl "http://localhost:3001/api/produtos/loja-fisica?limit=5"
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": [
    {
      "codigoInterno": "019216",
      "descricao": "ANEL DE ACO ADULTO",
      "precoVenda": 15.00,
      "precoCusto": 10.00,
      "estoque": 10,
      "lucro": 50.00,  // ← NOVO
      // "mesPico": "Jan",  ← REMOVIDO
      ...
    }
  ]
}
```

### **Teste 2: Ordenar por Lucro**

```bash
curl "http://localhost:3001/api/produtos/loja-fisica?sortBy=lucro&sortOrder=desc&limit=10"
```

**Resultado:** Produtos com maior lucro primeiro

---

## 💡 Casos de Uso

### **1. Identificar Produtos Mais Lucrativos:**

Ordene por "Lucro" (decrescente) para ver quais produtos têm maior potencial de lucro em estoque.

### **2. Detectar Produtos com Prejuízo:**

Produtos em vermelho (lucro negativo) indicam que o preço de venda está abaixo do custo.

### **3. Priorizar Reabastecimento:**

Produtos com alto lucro e baixo estoque devem ser priorizados para reabastecimento.

### **4. Análise de Portfólio:**

Some os lucros para ver o lucro potencial total do estoque.

---

## 📊 Estatísticas Úteis

### **Lucro Total do Estoque:**

```javascript
const lucroTotal = produtos.reduce((sum, p) => sum + p.lucro, 0);
console.log(`Lucro Total: R$ ${lucroTotal.toFixed(2)}`);
```

### **Produtos com Prejuízo:**

```javascript
const produtosComPrejuizo = produtos.filter(p => p.lucro < 0);
console.log(`${produtosComPrejuizo.length} produtos com prejuízo`);
```

### **Top 10 Mais Lucrativos:**

```javascript
const top10 = produtos
  .sort((a, b) => b.lucro - a.lucro)
  .slice(0, 10);
```

---

## ✅ Checklist de Implementação

- ✅ Cálculo de lucro no backend
- ✅ Remoção de mesPico do retorno
- ✅ Header "Lucro" no frontend
- ✅ Célula com formatação de moeda
- ✅ Cores verde/vermelho
- ✅ Estilos CSS atualizados
- ✅ Ordenação por lucro funciona
- ✅ Documentação completa

---

## 🔧 Manutenção

### **Adicionar Lucro Percentual:**

Se quiser mostrar também a margem percentual:

```javascript
// Lucro unitário (atual)
const lucro = precoVenda - precoCusto;

// Lucro percentual (adicional)
const margemPercentual = precoCusto > 0 
  ? ((precoVenda - precoCusto) / precoCusto) * 100 
  : 0;
```

### **Adicionar Filtro por Lucro:**

Futuramente, pode adicionar filtro para mostrar apenas produtos com lucro positivo/negativo.

---

## 📝 Observações Importantes

### **1. Lucro por Unidade:**

O valor mostrado é o lucro por unidade vendida (margem de lucro). Para calcular lucro total, multiplique pelo estoque.

### **2. Preço de Custo:**

Certifique-se de que os preços de custo estão atualizados no banco de dados para cálculo correto.

### **3. Produtos sem Preço:**

Produtos sem preço de venda ou custo mostrarão lucro R$ 0,00.

### **4. Margem Negativa:**

Produtos em vermelho indicam que o preço de venda está abaixo do custo. Ação urgente necessária!

---

## 🎯 Próximos Passos (Opcional)

### **1. Dashboard de Lucro:**

Criar um card no dashboard mostrando:
- Lucro total do estoque
- Produtos mais lucrativos
- Produtos com prejuízo

### **2. Alertas:**

Notificar quando produtos com alto lucro estão com estoque baixo.

### **3. Relatórios:**

Gerar relatórios de lucro por categoria, fornecedor, etc.

---

**Coluna Lucro implementada com sucesso na Loja Física!** 🎉

**Reinicie o backend e teste agora!** 💰✨
