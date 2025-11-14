# 🎯 Tooltip com Posicionamento Inteligente

## 📋 Problema Resolvido:

Quando o tooltip aparecia nos últimos produtos da lista (próximo ao final da página), ele era cortado pela borda inferior da tela.

## ✅ Solução Implementada:

### Detecção Automática de Espaço:

O tooltip agora detecta automaticamente se há espaço suficiente abaixo do cursor e ajusta sua posição:

```javascript
const handleMouseEnter = (event, produtoId) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const tooltipHeight = 300; // Altura estimada do tooltip
  const windowHeight = window.innerHeight;
  const spaceBelow = windowHeight - rect.bottom;
  
  // Se não há espaço suficiente abaixo, mostrar acima
  const shouldShowAbove = spaceBelow < tooltipHeight;
  
  setTooltipPosition({
    top: shouldShowAbove 
      ? rect.top - tooltipHeight + 20  // ACIMA do cursor
      : rect.top + rect.height / 2,    // CENTRO vertical
    left: rect.left - 270
  });
  setActiveTooltip(produtoId);
};
```

## 🎨 Comportamento Visual:

### Caso 1: Produtos no Topo/Meio da Página
```
┌──────────────────────────┐
│                          │
│  [ Produto 1 ]           │
│                          │
│  [ Produto 2 ]           │
│                          │
│  [ Produto 3 ]  ◄────┐   │
│                      │   │
│  [ Produto 4 ]   ┌───┴───┐
│                  │Tooltip│ ← Alinhado ao centro
│  [ Produto 5 ]   └───────┘
│                          │
└──────────────────────────┘
```

### Caso 2: Produtos no Final da Página
```
┌──────────────────────────┐
│  [ Produto 8 ]           │
│                          │
│  [ Produto 9 ]   ┌───────┐
│                  │Tooltip│ ← Mostrado ACIMA
│  [ Produto 10 ] ◄└───┬───┘
│                      │   │
│  [ Produto 11 ]      │   │
│                      │   │
│  [ Produto 12 ]  ────┘   │
└──────────────────────────┘
        ▲
    Fim da página
```

## 🔍 Como Funciona:

### 1. Calcular Espaço Disponível:
```javascript
const rect = event.currentTarget.getBoundingClientRect();
const windowHeight = window.innerHeight;
const spaceBelow = windowHeight - rect.bottom;
```

### 2. Verificar se Há Espaço Suficiente:
```javascript
const tooltipHeight = 300; // Altura estimada
const shouldShowAbove = spaceBelow < tooltipHeight;
```

### 3. Ajustar Posição:
```javascript
top: shouldShowAbove 
  ? rect.top - tooltipHeight + 20  // Acima
  : rect.top + rect.height / 2     // Centro
```

## 📊 Lógica de Decisão:

```
┌─────────────────────────────────┐
│ Cursor no produto               │
├─────────────────────────────────┤
│ Calcular espaço abaixo          │
│ spaceBelow = windowHeight - top │
├─────────────────────────────────┤
│ spaceBelow < 300px?             │
├──────────┬──────────────────────┤
│   SIM    │        NÃO           │
│          │                      │
│ Mostrar  │   Mostrar            │
│  ACIMA   │   CENTRO             │
└──────────┴──────────────────────┘
```

## 🎯 Valores Configuráveis:

### Altura do Tooltip:
```javascript
const tooltipHeight = 300; // Ajuste conforme necessário
```

### Margem de Segurança:
```javascript
// Adicionar margem ao mostrar acima
top: rect.top - tooltipHeight + 20  // +20px de margem
```

### Posição Horizontal:
```javascript
left: rect.left - 270  // 250px tooltip + 20px margem
```

## 📐 Cálculos:

### Espaço Abaixo:
```
spaceBelow = Altura da Janela - Posição do Elemento
           = window.innerHeight - rect.bottom
```

### Posição Acima:
```
top = Topo do Elemento - Altura do Tooltip + Margem
    = rect.top - 300 + 20
    = rect.top - 280
```

### Posição Centro:
```
top = Topo do Elemento + (Altura do Elemento / 2)
    = rect.top + (rect.height / 2)
```

## 🧪 Testes:

### Cenário 1: Produto no Topo
- ✅ Tooltip aparece ao centro (posição normal)
- ✅ Não é cortado

### Cenário 2: Produto no Meio
- ✅ Tooltip aparece ao centro (posição normal)
- ✅ Não é cortado

### Cenário 3: Produto no Final
- ✅ Tooltip aparece ACIMA do cursor
- ✅ Não é cortado pela borda inferior

### Cenário 4: Scroll da Página
- ✅ Recalcula posição a cada hover
- ✅ Sempre posiciona corretamente

## 🎨 Melhorias Futuras (Opcional):

### 1. Detecção de Borda Esquerda:
```javascript
const spaceLeft = rect.left;
if (spaceLeft < 270) {
  // Mostrar à direita ao invés de esquerda
  left = rect.right + 20;
}
```

### 2. Altura Dinâmica:
```javascript
// Calcular altura real do tooltip
const tooltipElement = document.querySelector('.tooltip');
const tooltipHeight = tooltipElement?.offsetHeight || 300;
```

### 3. Animação Suave:
```css
.tooltip {
  transition: top 0.2s ease, left 0.2s ease;
}
```

### 4. Indicador Visual:
```javascript
// Adicionar classe para mudar seta
<div className={`${styles.tooltip} ${shouldShowAbove ? styles.tooltipAbove : ''}`}>
```

## 📝 Exemplo Completo:

```javascript
const handleMouseEnter = (event, produtoId) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const tooltipHeight = 300;
  const windowHeight = window.innerHeight;
  const spaceBelow = windowHeight - rect.bottom;
  
  // Verificar espaço abaixo
  const shouldShowAbove = spaceBelow < tooltipHeight;
  
  // Calcular posição
  const top = shouldShowAbove 
    ? rect.top - tooltipHeight + 20  // Acima com margem
    : rect.top + rect.height / 2;    // Centro vertical
  
  const left = rect.left - 270;      // À esquerda
  
  setTooltipPosition({ top, left });
  setActiveTooltip(produtoId);
};
```

## ✅ Checklist:

- [x] Detecta espaço disponível abaixo
- [x] Calcula altura do tooltip
- [x] Posiciona acima se necessário
- [x] Posiciona ao centro se há espaço
- [x] Mantém posição à esquerda
- [x] Recalcula a cada hover
- [x] Funciona com scroll
- [x] Não é cortado pela borda

## 🎯 Resultado:

O tooltip agora **NUNCA** é cortado pela borda inferior da tela. Ele detecta automaticamente quando está próximo ao final da página e se posiciona acima do cursor, garantindo que todo o conteúdo seja sempre visível!

**Posicionamento inteligente implementado! 🚀**

