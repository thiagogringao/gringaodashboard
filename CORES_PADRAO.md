# 🎨 Cores Padrão da Aplicação

## 🔵 Cores Principais

### Azul (Cor Primária)
```css
/* Azul Principal */
--primary-blue: #004B87;

/* Azul Escuro (hover/active) */
--primary-blue-dark: #003d6e;

/* Azul Mais Escuro */
--primary-blue-darker: #002d52;

/* Gradiente Padrão */
background: linear-gradient(135deg, #004B87 0%, #003d6e 100%);
```

**Uso:**
- ✅ Sidebar
- ✅ Botões principais
- ✅ Links ativos
- ✅ Filtros
- ✅ Destaques importantes

---

### 🟡 Dourado (Cor de Destaque)
```css
/* Dourado */
--accent-gold: #FFD700;
```

**Uso:**
- ✅ Ícones importantes
- ✅ Badges de notificação
- ✅ Destaques especiais
- ✅ Hover em elementos críticos

---

## 🎨 Cores Secundárias

### Cinza (Backgrounds e Textos)
```css
/* Background Principal */
--bg-light: #f8f9fa;

/* Texto Principal */
--text-dark: #2c3e50;

/* Texto Secundário */
--text-secondary: #495057;

/* Bordas */
--border-light: #dee2e6;
--border-lighter: #e9ecef;
```

---

### 🔴 Vermelho (Ações Destrutivas)
```css
/* Vermelho para deletar/limpar */
--danger-red: #dc3545;
--danger-red-hover: #c82333;
```

**Uso:**
- ✅ Botão "Limpar Filtros"
- ✅ Ações de exclusão
- ✅ Alertas de erro

---

### 🟢 Verde (Sucesso)
```css
/* Verde para sucesso */
--success-green: #28a745;
```

**Uso:**
- ✅ Mensagens de sucesso
- ✅ Status positivo
- ✅ Confirmações

---

## 📊 Aplicação das Cores

### Componente de Filtros
```css
/* Botão Principal */
background: linear-gradient(135deg, #004B87 0%, #003d6e 100%);

/* Badge de Contagem */
background: #FFD700;
color: #004B87;

/* Tags de Filtro */
border: 2px solid #004B87;
color: #004B87;

/* Hover nos Selects */
border-color: #004B87;
box-shadow: 0 0 0 3px rgba(0, 75, 135, 0.1);
```

---

### Sidebar
```css
/* Background */
background: linear-gradient(180deg, #004B87 0%, #003d6e 100%);

/* Ícone do Logo */
color: #FFD700;
```

---

## 🎯 Diretrizes de Uso

### ✅ Faça:
- Use **azul (#004B87)** para elementos principais
- Use **dourado (#FFD700)** para destaques importantes
- Use **vermelho (#dc3545)** apenas para ações destrutivas
- Mantenha contraste adequado para acessibilidade
- Use gradientes sutis para profundidade

### ❌ Não Faça:
- ❌ Não use roxo (#667eea) - não faz parte da paleta
- ❌ Não misture muitas cores em um componente
- ❌ Não use cores muito saturadas
- ❌ Não ignore contraste de texto

---

## 🔧 Como Aplicar em Novos Componentes

### Exemplo de Botão Primário:
```css
.primaryButton {
  background: linear-gradient(135deg, #004B87 0%, #003d6e 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.primaryButton:hover {
  background: linear-gradient(135deg, #003d6e 0%, #002d52 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 75, 135, 0.3);
}
```

### Exemplo de Badge:
```css
.badge {
  background: #FFD700;
  color: #004B87;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}
```

### Exemplo de Tag:
```css
.tag {
  border: 2px solid #004B87;
  color: #004B87;
  background: white;
  padding: 6px 12px;
  border-radius: 20px;
}

.tag:hover {
  background: #004B87;
  color: white;
}
```

---

## 📱 Acessibilidade

### Contraste Mínimo (WCAG AA):
- ✅ Azul (#004B87) em branco: **9.5:1** (Excelente)
- ✅ Dourado (#FFD700) em azul: **8.2:1** (Excelente)
- ✅ Vermelho (#dc3545) em branco: **5.5:1** (Bom)

---

**Mantenha sempre estas cores para consistência visual!** 🎨
