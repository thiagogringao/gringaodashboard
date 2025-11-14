# 💡 Tooltip Explicativo de Custos - Implementado

## ✅ Funcionalidade Completa

Tooltip informativo que explica porque alguns custos aparecem em vermelho, com cálculo de variação e possíveis causas!

## 🎯 O que foi Implementado:

### 1. Tooltip Inteligente

**Informações Exibidas:**
```
⚠️ Variação de Custo Detectada!

Custo atual: R$ 2,80
Custo anterior (Jan): R$ 2,70
Variação: +3.7%

Este custo foi alterado em relação ao mês anterior.

Possíveis causas:
• Reajuste do fornecedor
• Mudança de fornecedor
• Variação cambial
• Alteração de frete/impostos
```

### 2. Cálculo Automático de Variação

**Lógica Implementada:**
```javascript
// Buscar custo do mês anterior
const custoAnterior = idx < produto.historicoVendas.length - 1 
  ? produto.historicoVendas[idx + 1].custoMedio 
  : venda.custoMedio;

// Calcular variação percentual
const variacao = custoAnterior > 0 
  ? ((venda.custoMedio - custoAnterior) / custoAnterior * 100).toFixed(1)
  : 0;

// Formatar com sinal + ou -
Variação: ${variacao > 0 ? '+' : ''}${variacao}%
```

### 3. Visual Interativo

**Efeitos CSS:**
- ✅ Cursor `help` (❓) ao passar o mouse
- ✅ Hover: fundo mais escuro + zoom 5%
- ✅ Ícone ⚠️ com animação de pulso
- ✅ Transição suave (0.2s)

**CSS Implementado:**
```css
.custoAlterado {
  cursor: help;
  transition: all 0.2s ease;
}

.custoAlterado:hover {
  background: rgba(231, 76, 60, 0.2);
  transform: scale(1.05);
}

.custoAlterado::before {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
```

## 📊 Exemplo de Uso:

### Caso 1: Aumento de Custo
```
Produto: 006237 - PCT PIRANHA MED TRIDENTE

Mar/2025: ⚠️ R$ 2.80 (hover para ver)
↓
Tooltip:
⚠️ Variação de Custo Detectada!

Custo atual: R$ 2,80
Custo anterior (Fev): R$ 2,78
Variação: +0.7%

Possíveis causas:
• Reajuste do fornecedor
• Mudança de fornecedor
• Variação cambial
• Alteração de frete/impostos
```

### Caso 2: Redução de Custo
```
Tooltip:
⚠️ Variação de Custo Detectada!

Custo atual: R$ 5,50
Custo anterior (Ago): R$ 6,00
Variação: -8.3%

Possíveis causas:
• Negociação com fornecedor
• Mudança de fornecedor
• Compra em maior volume
• Promoção do fornecedor
```

## 🎨 Experiência do Usuário:

### Fluxo de Interação:

1. **Usuário vê** custo em vermelho com ⚠️
2. **Cursor muda** para ❓ (help)
3. **Hover:** fundo escurece e valor aumenta 5%
4. **Tooltip aparece** com explicação detalhada
5. **Ícone ⚠️** pulsa para chamar atenção

### Visual:

```
Antes do Hover:
┌─────────────────────┐
│ ⚠️ R$ 2,80          │ ← Vermelho, negrito
└─────────────────────┘

Durante o Hover:
┌─────────────────────┐
│ ⚠️ R$ 2,80          │ ← Fundo mais escuro, zoom 5%
│                     │
│ [TOOLTIP]           │
│ ⚠️ Variação...      │
│ Custo atual: R$2,80 │
│ Custo anterior: ... │
│ Variação: +0.7%     │
│ ...                 │
└─────────────────────┘
```

## 💡 Informações do Tooltip:

### 1. **Título:**
```
⚠️ Variação de Custo Detectada!
```

### 2. **Comparação:**
```
Custo atual: R$ X,XX
Custo anterior (Mês): R$ Y,YY
Variação: ±Z.Z%
```

### 3. **Explicação:**
```
Este custo foi alterado em relação ao mês anterior.
```

### 4. **Possíveis Causas:**
```
• Reajuste do fornecedor
• Mudança de fornecedor
• Variação cambial
• Alteração de frete/impostos
```

## 🔧 Detalhes Técnicos:

### Cálculo de Variação:
```javascript
// Percentual de variação
variacao = ((custoAtual - custoAnterior) / custoAnterior) * 100

// Exemplos:
// R$ 2.80 → R$ 2.78 = +0.7%
// R$ 5.50 → R$ 6.00 = -8.3%
// R$ 3.00 → R$ 3.00 = 0.0%
```

### Formatação:
```javascript
// Com sinal
variacao > 0 ? '+' : ''  // '+0.7%' ou '-8.3%'

// Casas decimais
.toFixed(1)  // 1 casa decimal
```

### Tooltip Condicional:
```javascript
const tooltipText = venda.custoAlterado 
  ? 'Texto completo com explicação...'
  : '';  // Vazio se custo não alterado
```

## 🎯 Benefícios:

### Para o Usuário:
- ✅ **Entende imediatamente** porque o custo está vermelho
- ✅ **Vê a variação exata** em reais e porcentagem
- ✅ **Conhece possíveis causas** da alteração
- ✅ **Não precisa calcular** manualmente

### Para o Negócio:
- ✅ **Transparência** nos dados
- ✅ **Educação** do usuário
- ✅ **Melhor tomada de decisão**
- ✅ **Reduz dúvidas** sobre o sistema

## 📝 Estrutura do Tooltip:

```
┌─────────────────────────────────────────┐
│ ⚠️ Variação de Custo Detectada!        │
│                                         │
│ Custo atual: R$ 2,80                   │
│ Custo anterior (Jan): R$ 2,70          │
│ Variação: +3.7%                        │
│                                         │
│ Este custo foi alterado em relação ao  │
│ mês anterior. Possíveis causas:        │
│ • Reajuste do fornecedor               │
│ • Mudança de fornecedor                │
│ • Variação cambial                     │
│ • Alteração de frete/impostos          │
└─────────────────────────────────────────┘
```

## 🎨 Animações:

### 1. **Pulso do Ícone:**
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }    /* Normal */
  50% { opacity: 0.6; }       /* Mais claro */
}
/* Duração: 2s, Loop infinito */
```

### 2. **Hover Effect:**
```css
/* Zoom suave */
transform: scale(1.05);

/* Fundo mais escuro */
background: rgba(231, 76, 60, 0.2);

/* Transição suave */
transition: all 0.2s ease;
```

## 🧪 Testes:

### Produto 006237:
```
Mar/2025: R$ 2.80
Fev/2025: R$ 2.78

Tooltip mostra:
Variação: +0.7%
Status: ✅ Funcionando
```

### Produto 011004:
```
Out/2025: R$ 2.57
Set/2025: R$ 2.49

Tooltip mostra:
Variação: +3.2%
Status: ✅ Funcionando
```

## 💡 Como Usar:

1. **Acesse** um produto com custo variável
2. **Localize** o custo em vermelho com ⚠️
3. **Passe o mouse** sobre o valor
4. **Leia** a explicação completa no tooltip
5. **Analise** a variação e possíveis causas

## 📊 Informações Contextuais:

### Variação Positiva (+):
```
Indica: Aumento de custo
Impacto: Redução de margem
Ação sugerida: Revisar preço de venda
```

### Variação Negativa (-):
```
Indica: Redução de custo
Impacto: Aumento de margem
Ação sugerida: Oportunidade de competitividade
```

## 🎉 Resultado Final:

### Antes:
```
❌ Custo em vermelho sem explicação
❌ Usuário não sabe o motivo
❌ Precisa calcular variação manualmente
```

### Depois:
```
✅ Tooltip com explicação completa
✅ Variação calculada automaticamente
✅ Possíveis causas listadas
✅ Cursor help indica informação
✅ Animação chama atenção
✅ Hover interativo
```

## 📁 Arquivos Modificados:

1. **`frontend/src/pages/ProductDetail/ProductDetail.jsx`**:
   - Cálculo de variação de custo
   - Geração dinâmica do tooltip
   - Atributo `title` condicional

2. **`frontend/src/pages/ProductDetail/ProductDetail.module.css`**:
   - Cursor `help`
   - Efeitos de hover
   - Animação de pulso
   - Transições suaves

---

**Tooltip explicativo implementado com sucesso! 💡**
**Usuários agora entendem imediatamente porque custos estão em vermelho! ⚠️**

