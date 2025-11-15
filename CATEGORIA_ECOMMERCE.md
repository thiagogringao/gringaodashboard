# ✅ Coluna Categoria Adicionada no E-commerce

## 🎯 Objetivo

Adicionar a coluna "Categoria" na funcionalidade E-commerce, buscando os dados da tabela `db_gringao.bling_produtos_detalhes`.

---

## 🛠️ Modificações Realizadas

### **1. Backend - Banco de Dados SQLite**

#### **Arquivo:** `backend/config/cacheEcommerceDatabase.js`

**Adicionado:**
- Coluna `categoria TEXT` na tabela `produtos`
- Índice `idx_categoria` para otimizar buscas

```javascript
CREATE TABLE IF NOT EXISTS produtos (
  codigo TEXT PRIMARY KEY,
  nome TEXT,
  preco REAL DEFAULT 0,
  preco_custo REAL DEFAULT 0,
  estoque INTEGER DEFAULT 0,
  tipo TEXT,
  situacao TEXT,
  formato TEXT,
  imagem_url TEXT,
  categoria TEXT,  // ← NOVO
  ...
);

CREATE INDEX IF NOT EXISTS idx_categoria ON produtos(categoria);  // ← NOVO
```

---

### **2. Backend - Serviço de Backup**

#### **Arquivo:** `backend/services/sqliteEcommerceBackupService.js`

**Modificações:**

#### **2.1. Query SQL - Buscar Categoria:**

```javascript
const [produtos] = await poolEcommerce.query(`
  SELECT
    p.codigo,
    p.nome,
    p.preco,
    p.precoCusto,
    p.estoque,
    p.tipo,
    p.situacao,
    p.formato,
    COALESCE(v.imagem, p.imagemURL, '') as imagemURL,
    d.categoria as categoria  // ← NOVO
  FROM bling2_produtos p
  LEFT JOIN vw_dprodutos v ON p.codigo = v.sku
  LEFT JOIN bling_produtos_detalhes d ON p.codigo = d.codigo  // ← NOVO
  WHERE p.situacao = 'A'
  ORDER BY p.codigo
`);
```

#### **2.2. INSERT Statement:**

```javascript
const insertStmt = cacheDb.prepare(`
  INSERT OR REPLACE INTO produtos (
    codigo, nome, preco, preco_custo, estoque, tipo, situacao, formato, 
    imagem_url, categoria,  // ← NOVO
    estoque_minimo, mes_pico, media_mensal, total_vendas, vendas_mensais,
    historico_12_meses, analise_preditiva, mes_pico_numero,
    tendencia_percentual, previsao_proximo_mes, risco_ruptura, dias_estoque,
    data_atualizacao
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
`);
```

#### **2.3. Execução do INSERT:**

```javascript
insertStmt.run(
  produto.codigo,
  produto.nome,
  produto.preco,
  produto.precoCusto,
  produto.estoque,
  produto.tipo,
  produto.situacao,
  produto.formato,
  produto.imagemURL,
  produto.categoria || null,  // ← NOVO
  analise.estoqueMinimo,
  ...
);
```

---

### **3. Backend - Controller**

#### **Arquivo:** `backend/controllers/ecommerceController.js`

**Adicionado categoria no retorno:**

```javascript
const produtosFormatados = produtos.map(p => {
  const preco = parseFloat(p.preco) || 0;
  const precoCusto = parseFloat(p.preco_custo) || 0;

  return {
    id: p.codigo,
    codigo: p.codigo,
    nome: p.nome,
    preco: preco,
    precoCusto: precoCusto,
    estoque: p.estoque,
    imagemURL: p.imagem_url,
    situacao: p.situacao,
    categoria: p.categoria || null,  // ← NOVO
    margem: calcularMargem(preco, precoCusto),
    ...
  };
});
```

---

### **4. Frontend - Componente ProductTable**

#### **Arquivo:** `frontend/src/components/ProductTable/ProductTable.jsx`

**Modificações:**

#### **4.1. Header da Tabela:**

```jsx
{isEcommerce && (
  <>
    <th className={styles.sortable} onClick={() => handleSort('categoria')}>
      Categoria {getSortIcon('categoria')}  {/* ← NOVO */}
    </th>
    <th className={styles.sortable} onClick={() => handleSort('preco')}>
      Preço Venda {getSortIcon('preco')}
    </th>
    <th className={styles.sortable} onClick={() => handleSort('precoCusto')}>
      Preço Custo {getSortIcon('precoCusto')}
    </th>
  </>
)}
```

#### **4.2. Corpo da Tabela:**

```jsx
{isEcommerce && (
  <>
    <td className={styles.categoria}>
      {produto.categoria || '-'}  {/* ← NOVO */}
    </td>
    <td className={styles.preco}>
      {formatarMoeda(produto.preco || 0)}
    </td>
    <td className={styles.precoCusto}>
      {produto.precoCusto > 0 ? formatarMoeda(produto.precoCusto) : '-'}
    </td>
  </>
)}
```

---

## 📊 Estrutura da Tabela

### **Ordem das Colunas no E-commerce:**

| # | Coluna | Descrição |
|---|--------|-----------|
| 1 | Imagem | Miniatura do produto |
| 2 | Código | Código do produto |
| 3 | Descrição | Nome do produto |
| 4 | **Categoria** | **← NOVA COLUNA** |
| 5 | Preço Venda | Preço de venda |
| 6 | Preço Custo | Preço de custo |
| 7 | Estoque | Quantidade em estoque |
| 8 | Estoque Mín. | Estoque mínimo |
| 9 | Mês Pico | Mês de maior venda |
| 10 | Ações | Botão "Ver detalhes" |

---

## 🔄 Fluxo de Dados

### **1. Banco de Dados MySQL:**
```
db_gringao.bling_produtos_detalhes
  ↓
  categoria (coluna)
```

### **2. Script de Backup:**
```
LEFT JOIN bling_produtos_detalhes d ON p.codigo = d.codigo
  ↓
  SELECT d.categoria as categoria
  ↓
  INSERT INTO produtos (..., categoria, ...)
```

### **3. Cache SQLite:**
```
ecommerce.db
  ↓
  produtos.categoria
```

### **4. API Backend:**
```
GET /api/produtos/ecommerce
  ↓
  SELECT * FROM produtos
  ↓
  return { ..., categoria: p.categoria || null }
```

### **5. Frontend:**
```
ProductTable.jsx
  ↓
  <th>Categoria</th>
  ↓
  <td>{produto.categoria || '-'}</td>
```

---

## 🚀 Como Aplicar as Mudanças

### **Passo 1: Recriar o Cache SQLite**

O banco SQLite precisa ser recriado para incluir a nova coluna:

```bash
cd backend
node scripts/backupEcommerceToSQLite.js
```

**Saída esperada:**
```
🚀 Iniciando backup completo do E-commerce para SQLite...
📦 Buscando produtos do e-commerce...
✅ 1500 produtos encontrados
📊 Buscando histórico de vendas...
✅ Análise de vendas para 800 produtos
💾 Salvando no SQLite...
✅ Backup completo finalizado em 5.2s
📊 Total: 1500 produtos salvos no SQLite
```

### **Passo 2: Reiniciar Backend**

```bash
# Parar processos node
Stop-Process -Name node -Force

# Iniciar backend
cd backend
npm run dev
```

### **Passo 3: Limpar Cache do Frontend**

```
Ctrl + F5
```

Ou abrir em modo anônimo:
```
Ctrl + Shift + N
```

### **Passo 4: Verificar**

Acesse: `http://localhost:3000/ecommerce`

Verifique se a coluna "Categoria" aparece entre "Descrição" e "Preço Venda".

---

## 🧪 Testes

### **1. Teste a API:**

```bash
curl "http://localhost:3001/api/produtos/ecommerce?limit=5" | ConvertFrom-Json | Select-Object -ExpandProperty data | Select-Object codigo, nome, categoria
```

**Resultado esperado:**
```
codigo  nome                           categoria
------  ----                           ---------
001     PRODUTO EXEMPLO 1              Joias
002     PRODUTO EXEMPLO 2              Acessórios
003     PRODUTO EXEMPLO 3              Relógios
```

### **2. Teste no Frontend:**

1. Acesse `http://localhost:3000/ecommerce`
2. Veja a coluna "Categoria" na tabela
3. Verifique se os valores estão corretos
4. Teste a ordenação clicando no header "Categoria"

---

## 📝 Observações Importantes

### **1. Categoria pode ser NULL:**

Se um produto não tiver categoria em `bling_produtos_detalhes`, o valor será `null` e aparecerá como `-` no frontend.

### **2. Backup Necessário:**

As mudanças só terão efeito após executar o script de backup:
```bash
node scripts/backupEcommerceToSQLite.js
```

### **3. Índice para Performance:**

Foi criado um índice na coluna `categoria` para otimizar:
- Ordenação por categoria
- Filtros futuros por categoria
- Buscas

---

## 🎨 Exemplo Visual

### **Tabela E-commerce COM Categoria:**

```
┌────────┬──────────┬─────────────────┬────────────┬───────┬───────┬─────────┐
│ Imagem │ Código   │ Descrição       │ Categoria  │ Preço │ Custo │ Estoque │
├────────┼──────────┼─────────────────┼────────────┼───────┼───────┼─────────┤
│ [IMG]  │ 001      │ ANEL SOLITÁRIO  │ Joias      │ 150   │ 80    │ 10      │
│ [IMG]  │ 002      │ PULSEIRA PRATA  │ Acessórios │ 90    │ 45    │ 25      │
│ [IMG]  │ 003      │ RELÓGIO DIGITAL │ Relógios   │ 200   │ 120   │ 5       │
└────────┴──────────┴─────────────────┴────────────┴───────┴───────┴─────────┘
```

---

## ✅ Checklist de Implementação

- ✅ Coluna `categoria` adicionada no SQLite
- ✅ Índice `idx_categoria` criado
- ✅ JOIN com `bling_produtos_detalhes` no backup
- ✅ INSERT atualizado com categoria
- ✅ Controller retorna categoria
- ✅ Header da tabela com coluna categoria
- ✅ Corpo da tabela exibe categoria
- ✅ Ordenação por categoria funciona

---

## 🔧 Manutenção

### **Atualizar Categorias:**

Para atualizar as categorias dos produtos:

1. Atualizar no banco MySQL: `db_gringao.bling_produtos_detalhes`
2. Executar backup: `node scripts/backupEcommerceToSQLite.js`
3. Reiniciar backend

### **Adicionar Filtro por Categoria (Futuro):**

Se quiser adicionar filtro por categoria no e-commerce (como na Loja Física):

1. Adicionar dropdown no componente Filtros
2. Passar parâmetro `categoria` na URL
3. Filtrar no controller (similar à Loja Física)

---

## 📊 Comparação: Loja Física vs E-commerce

| Aspecto | Loja Física | E-commerce |
|---------|-------------|------------|
| **Origem Categoria** | Categorização automática (descrição) | Tabela `bling_produtos_detalhes` |
| **Armazenamento** | Gerado dinamicamente | Armazenado no SQLite |
| **Atualização** | Automática (sempre) | Após backup |
| **Filtro** | ✅ Implementado | ⚠️ Não implementado ainda |
| **Ordenação** | ✅ Funciona | ✅ Funciona |

---

## 🎯 Próximos Passos (Opcional)

### **1. Implementar Filtro por Categoria:**

Similar à Loja Física, adicionar filtro de categoria no e-commerce.

### **2. Sincronização Automática:**

Agendar backup automático para manter categorias atualizadas:
```javascript
// Executar backup a cada 6 horas
setInterval(() => {
  backupService.backupFullEcommerce();
}, 6 * 60 * 60 * 1000);
```

### **3. Dashboard de Categorias:**

Criar análise de vendas por categoria no e-commerce.

---

**Coluna Categoria implementada com sucesso no E-commerce!** 🎉

**Para aplicar:** Execute o backup e reinicie o backend! 🚀
