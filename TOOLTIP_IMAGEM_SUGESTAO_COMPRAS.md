# 🖼️ Imagem do Produto na Sugestão de Compras

## ✅ Funcionalidades Implementadas

### 📸 Miniatura + Tooltip de Imagem

Na página **Sugestão de Compras**, a coluna de código mostra:
1. **Miniatura da foto** (50x50px) ao lado do código
2. **Tooltip ampliado** (300x300px) ao passar o mouse sobre a miniatura

---

## 🎯 Como Funciona

### 1. **Layout da Coluna Código**
```jsx
<div className={styles.codigoComImagem}>
  <ImageTooltip src={item.imagemBase64} alt={item.descricao}>
    <img 
      src={item.imagemBase64 || placeholderSVG} 
      alt={item.descricao}
      className={styles.miniatura}
    />
  </ImageTooltip>
  <span className={styles.codigo}>{item.codigoInterno}</span>
</div>
```

**Localização:** `frontend/src/pages/SugestaoCompras/SugestaoCompras.jsx` (linha 131-140)

---

### 2. **Visual da Miniatura**

#### **Miniatura (50x50px):**
- 📐 Tamanho: 50x50px
- 🔲 Borda: 2px cinza (#e0e0e0)
- 🔄 Border-radius: 8px
- 🎯 Object-fit: cover
- 🖱️ Cursor: pointer

#### **Ao Passar o Mouse (Hover):**
- 🟡 Borda muda para dourado (#FFD700)
- 📈 Aumenta 10% (scale 1.1)
- ✨ Sombra dourada aparece
- 🖼️ Tooltip ampliado (300x300px) aparece

### 3. **Visual do Código**
- 🔵 Cor azul (#004B87)
- 📝 Fonte: Courier New (monospace)
- 💪 Negrito (600)
- 📏 Espaçamento: 12px da miniatura

---

## 🎨 Características do Tooltip

### **Imagem:**
- 📐 Tamanho: 300x300px
- 🎯 Ajuste: object-fit contain
- 🔲 Background: branco
- 🌟 Borda: 3px dourada (#FFD700)
- 🔄 Animação: fadeIn + scale

### **Posicionamento:**
- 📍 Segue o cursor do mouse
- 📏 Offset: 20px (direita e baixo)
- 🔝 Z-index: 10000 (sempre visível)
- 🚫 Pointer-events: none (não bloqueia cliques)

### **Placeholder (Sem Imagem):**
- 🖼️ SVG com ícone de câmera
- 📝 Texto: "Sem Imagem"
- 🎨 Cores: cinza claro

---

## 💻 Código CSS

### Layout com Imagem:
```css
.codigoComImagem {
  display: flex;
  align-items: center;
  gap: 12px;
}
```

### Estilo da Miniatura:
```css
.miniatura {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.miniatura:hover {
  border-color: #FFD700;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}
```

### Estilo do Código:
```css
.codigo {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #004B87;
  white-space: nowrap;
}
```

### Estilo do Tooltip:
```css
.tooltip {
  position: fixed;
  z-index: 10000;
  pointer-events: none;
  animation: fadeIn 0.2s ease;
}

.tooltipImage {
  width: 300px;
  height: 300px;
  object-fit: contain;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  border: 3px solid #FFD700;
}
```

---

## 🚀 Como Usar

### 1. **Acesse a Página:**
```
http://localhost:3000/sugestao-compras
```

### 2. **Passe o Mouse:**
- Localize a coluna **"Código"**
- Passe o mouse sobre qualquer código
- Veja a imagem aparecer!

### 3. **Indicadores Visuais:**
- ✅ Sublinhado pontilhado dourado = tem imagem
- ✅ Cursor "help" (?) = interativo
- ✅ Hover dourado = destaque

---

## 📊 Estrutura da Tabela

| Coluna | Tooltip? | Descrição |
|--------|----------|-----------|
| **Código** | ✅ **SIM!** | Mostra imagem do produto |
| Descrição | ❌ | Texto simples |
| Categoria | ❌ | Texto simples |
| Estoque Atual | ❌ | Número |
| Estoque Ideal | ❌ | Número |
| Sugerido Comprar | ❌ | Número destacado |
| Preço Custo | ❌ | Valor monetário |
| Valor Total | ❌ | Valor monetário |
| Risco / Dias | ❌ | Badge + texto |
| Ações | ❌ | Botão "Ver detalhes" |

---

## 🎯 Benefícios

✅ **Identificação Visual** - Veja o produto antes de comprar
✅ **Sem Cliques** - Apenas passe o mouse
✅ **Não Invasivo** - Tooltip não bloqueia a tela
✅ **Rápido** - Aparece instantaneamente
✅ **Elegante** - Animação suave com borda dourada
✅ **Acessível** - Cursor "help" indica interatividade

---

## 🔧 Componentes Envolvidos

### 1. **ImageTooltip.jsx**
- Componente reutilizável
- Gerencia estado do tooltip
- Controla posicionamento
- Trata imagens ausentes

### 2. **SugestaoCompras.jsx**
- Usa ImageTooltip na coluna código
- Passa imagem base64
- Estiliza o código

### 3. **CSS Modules**
- `ImageTooltip.module.css` - Estilo do tooltip
- `SugestaoCompras.module.css` - Estilo do código

---

## 📝 Exemplo de Uso

### Produto COM Imagem:
```
Código: 020728
Hover: Mostra foto do produto
Visual: Sublinhado dourado + cursor help
```

### Produto SEM Imagem:
```
Código: 999999
Hover: Mostra placeholder "Sem Imagem"
Visual: Mesmo estilo (sublinhado + cursor)
```

---

## 🎨 Cores Utilizadas

| Elemento | Cor | Código |
|----------|-----|--------|
| Código (normal) | Azul | #004B87 |
| Código (hover) | Dourado | #FFD700 |
| Sublinhado | Dourado | #FFD700 |
| Borda tooltip | Dourado | #FFD700 |
| Background tooltip | Branco | #FFFFFF |

---

## 🔄 Melhorias Aplicadas

### **Antes:**
- ❌ Código sem indicação visual
- ❌ Não ficava claro que tinha tooltip
- ❌ Cursor padrão

### **Agora:**
- ✅ Sublinhado pontilhado dourado
- ✅ Cursor "help" (?)
- ✅ Hover muda cor para dourado
- ✅ Visual mais atrativo

---

## 📱 Responsividade

- ✅ Tooltip segue o cursor em qualquer resolução
- ✅ Imagem mantém proporção (object-fit: contain)
- ✅ Funciona em desktop e tablets
- ⚠️ Em mobile, considerar usar clique ao invés de hover

---

## 🧪 Teste Agora!

1. **Acesse:** http://localhost:3000/sugestao-compras
2. **Localize** a coluna "Código"
3. **Passe o mouse** sobre qualquer código
4. **Veja** a foto do produto aparecer! 🎉

---

**Tooltip de imagem funcionando perfeitamente!** 🖼️✨
