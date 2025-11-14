# 🔄 Mudança: "Valor Estoque" → "Preço Padrão"

## 📋 O que mudou?

### ❌ Antes:
- Badge: **E** (Estoque)
- Tooltip: "Origem: Valor Estoque"
- Confuso - parecia que era um tipo de preço específico

### ✅ Agora:
- Badge: **P** (Padrão)
- Tooltip: "Origem: Preço Padrão"
- Mais claro - indica que é o preço base/padrão

---

## 🎯 Badges Atualizados:

| Badge | Cor | Nome | Quando Aparece |
|-------|-----|------|----------------|
| **R** | 🟢 Verde | Valor Revenda | Produto tem preço de revenda definido |
| **A** | 🔵 Azul | Valor Atacado | Revenda = 0, mas tem preço atacado |
| **V** | 🟠 Laranja | Valor Varejo | Revenda e Atacado = 0, mas tem varejo |
| **P** | ⚪ Cinza | Preço Padrão | Produto não está na view de preços |

---

## 📊 Estatísticas Atuais:

- **1.126 produtos** com Valor Revenda (🟢 R)
- **6 produtos** com Valor Varejo (🟠 V)
- **0 produtos** com Valor Atacado (🔵 A)
- **1.266 produtos** com Preço Padrão (⚪ P)

**Total:** 2.398 produtos

---

## 💡 Por que "Preço Padrão"?

### Produtos com badge **P** (Cinza):
- Não estão cadastrados na `vw_dprodutos`
- Usam o preço da tabela `estoque` como fallback
- São produtos que ainda não têm classificação de preço

### Não é um erro!
É apenas um indicador de que o produto usa o **preço base** ao invés de ter uma classificação específica (Revenda/Atacado/Varejo).

---

## 🚀 Como Usar:

1. **Badge Verde (R)** = Melhor! Produto tem preço de revenda
2. **Badge Azul (A)** = Bom! Produto tem preço atacado
3. **Badge Laranja (V)** = OK! Produto tem preço varejo
4. **Badge Cinza (P)** = Atenção! Produto usa preço padrão

---

## 📝 Próximos Passos (Opcional):

Se você quiser que TODOS os produtos tenham classificação (R/A/V):
1. Adicionar os 1.266 produtos faltantes na `vw_dprodutos`
2. Definir VALOR_REVENDA, VALOR_ATACADO ou VALOR_VAREJO para cada um
3. Executar novo backup: `curl -X POST http://localhost:3001/api/backup/full`

---

**Mudança aplicada com sucesso!** ✅
