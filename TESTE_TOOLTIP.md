# 🧪 Teste do Tooltip de Estoque Mínimo

## ✅ Implementação Verificada

### 1. Estrutura JSX (ProductTable.jsx)
- ✅ Wrapper com classe `estoqueMinimoWrapper`
- ✅ Valor com classe `estoqueMinimoValue`
- ✅ Tooltip com todas as informações:
  - Estoque Mínimo
  - Vendas (12 meses)
  - Média Mensal
  - Explicação do cálculo

### 2. CSS (ProductTable.module.css)
- ✅ `.estoqueMinimoWrapper` - posição relativa, cursor help
- ✅ `.estoqueMinimoValue` - estilo do valor
- ✅ `.tooltip` - posicionamento absoluto, inicialmente oculto
- ✅ `.estoqueMinimoWrapper:hover .tooltip` - mostra no hover
- ✅ Seta do tooltip (::after)
- ✅ Estilos de conteúdo (header, rows, divider, info)

### 3. Dados da API
```json
{
  "codigoInterno": "020934",
  "estoqueMinimo": 11535,
  "totalVendas": 99969,
  "mediaMensal": 7689.92,
  "mesPico": "Dez"
}
```

## 🔍 Como Testar

### No Navegador:
1. Abra a página da Loja Física: `http://localhost:3000/loja-fisica`
2. Localize a coluna "Estoque Mín."
3. Passe o mouse sobre o valor do estoque mínimo
4. O tooltip deve aparecer acima do valor com:
   - Cabeçalho roxo "📊 Análise de Estoque"
   - Estoque Mínimo: X unidades
   - Vendas (12 meses): X unidades
   - Média Mensal: X unidades
   - Explicação do cálculo

### Verificar CSS no DevTools:
1. Abra DevTools (F12)
2. Inspecione o elemento com estoque mínimo
3. Verifique se as classes estão aplicadas:
   ```html
   <div class="ProductTable_estoqueMinimoWrapper__xxxxx">
     <span class="ProductTable_estoqueMinimoValue__xxxxx">11535</span>
     <div class="ProductTable_tooltip__xxxxx">
       ...
     </div>
   </div>
   ```

### Verificar Hover:
1. No DevTools, selecione o elemento `.estoqueMinimoWrapper`
2. Na aba "Styles", clique no ícone `:hov`
3. Marque a opção `:hover`
4. O tooltip deve aparecer

## 🐛 Possíveis Problemas

### 1. Tooltip não aparece
**Causa**: Cache do navegador
**Solução**: 
- Pressione `Ctrl + Shift + R` (Windows/Linux)
- Ou `Cmd + Shift + R` (Mac)
- Ou abra DevTools → Network → marque "Disable cache"

### 2. CSS não aplicado
**Causa**: Módulo CSS não carregado
**Solução**:
- Verifique se o import está correto: `import styles from './ProductTable.module.css'`
- Reinicie o servidor de desenvolvimento do React

### 3. Dados não aparecem
**Causa**: API não retornando dados
**Solução**:
- Verifique se o backend está rodando
- Teste a API: `http://localhost:3001/api/produtos/loja-fisica?page=1&limit=1`
- Verifique se os campos existem: `totalVendas`, `mediaMensal`

### 4. Tooltip aparece cortado
**Causa**: Overflow do container pai
**Solução**:
- Adicione `overflow: visible` no container da tabela
- Ou ajuste o `z-index` do tooltip

## 🎨 Personalização

### Alterar tempo de transição:
```css
.tooltip {
  transition: all 0.3s ease; /* Altere 0.3s */
}
```

### Alterar posição:
```css
.tooltip {
  bottom: 100%; /* Acima do elemento */
  /* ou */
  top: 100%; /* Abaixo do elemento */
}
```

### Alterar cores:
```css
.tooltipHeader {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  /* Altere para suas cores */
}
```

## ✅ Checklist de Verificação

- [ ] Backend rodando na porta 3001
- [ ] Frontend rodando na porta 3000
- [ ] Cache do navegador limpo (Ctrl+Shift+R)
- [ ] DevTools aberto para inspecionar
- [ ] Página da Loja Física carregada
- [ ] Mouse sobre o valor do estoque mínimo
- [ ] Tooltip aparece com todas as informações
- [ ] Dados corretos (estoque, vendas, média)
- [ ] Animação suave ao aparecer/desaparecer
- [ ] Seta do tooltip apontando para o valor

## 📸 Como Deve Parecer

```
┌─────────────────────────────────┐
│  📊 Análise de Estoque          │ ← Cabeçalho roxo
├─────────────────────────────────┤
│ Estoque Mínimo:     11535 un    │
│ Vendas (12 meses):  99969 un    │
│ Média Mensal:       7689.92 un  │
├─────────────────────────────────┤
│ 💡 Como calculamos:             │
│ Estoque mínimo = Média × 1,5    │
│ Margem de segurança de 50%      │
└─────────────────────────────────┘
           ▼ ← Seta
       [ 11535 ] ← Valor do estoque
```

## 🚀 Próximos Passos

Se o tooltip não aparecer após limpar o cache:
1. Verifique o console do navegador (F12 → Console)
2. Procure por erros de CSS ou JavaScript
3. Verifique se o React está renderizando o componente
4. Use o React DevTools para inspecionar as props do produto

