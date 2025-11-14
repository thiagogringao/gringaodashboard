# 📊 Entendendo a Análise de Picos de Vendas

## 🎯 O que é analisado?

A funcionalidade **Picos de Vendas com Queda** identifica produtos que tiveram um **pico de vendas** seguido por uma **queda sustentada**, e tenta descobrir o **motivo** dessa queda.

---

## 💰 O que é Analisado?

### CUSTO DE COMPRA (Confiável ✅)
- ✅ Quanto **VOCÊ PAGA** ao fornecedor para comprar o produto
- ✅ Exemplo: Você compra um anel por **R$ 3,70** do fornecedor
- ✅ Se o fornecedor aumentar para **R$ 4,50**, seu CUSTO aumentou
- ✅ **Este valor é CONFIÁVEL** pois não muda com promoções

### MARGEM DE LUCRO (Indicador ✅)
- ✅ Diferença entre o que você paga e o que você cobra
- ✅ Exemplo: Custo R$ 3,70 | Venda R$ 23,00 | Margem: 83,9%
- ✅ Margem muito alta (>80%) pode afastar clientes
- ✅ Margem muito baixa (<20%) pode indicar preço pouco atrativo

### ⚠️ PREÇO DE VENDA (Não Analisado)
- ❌ O histórico de vendas inclui **promoções** e **descontos**
- ❌ Comparar preço médio do passado com preço atual gera dados **INCORRETOS**
- ❌ Por isso, **NÃO analisamos variação de preço de venda**
- ✅ Em vez disso, analisamos a **MARGEM DE LUCRO atual**

---

## 📈 Exemplo Real: Produto 020728

### Dados do Pico (Dez/2024):
- **Vendas**: 1.320 unidades (PICO!)
- **Preço de Venda Médio**: R$ 8,36
- **Custo Médio**: R$ 3,50

### Dados Atuais:
- **Vendas**: 26 unidades (QUEDA de 98%!)
- **Preço de Venda Atual**: R$ 23,00
- **Custo Atual**: R$ 3,70

### Análise CORRIGIDA:

#### ✅ CUSTO aumentou 5,7%
- De R$ 3,50 → R$ 3,70
- **Impacto**: BAIXO
- **Conclusão**: Fornecedor aumentou pouco o preço

#### 💸 MARGEM DE LUCRO: 83,9%
- Custo: R$ 3,70 | Venda: R$ 23,00
- **Impacto**: MUITO ALTO!
- **Conclusão**: Margem muito alta pode estar afastando clientes
- **Resultado**: Vendas caíram 98%

#### ⚠️ Sobre o "aumento de 175%"
- ❌ **DADO INCORRETO**: Comparava preço médio de vendas (R$ 8,36) com preço de tabela (R$ 23,00)
- ❌ O R$ 8,36 incluía promoções e descontos do período
- ✅ **CORRIGIDO**: Agora analisamos apenas CUSTO e MARGEM

### 🎯 Motivo Principal: MARGEM MUITO ALTA

O sistema agora detecta que a **MARGEM DE 83,9%** está muito alta, o que pode estar **afastando clientes**.

---

## 🔍 Como Interpretar as Mensagens

### 💰 Mensagens sobre CUSTO
```
💰 CUSTO DE COMPRA aumentou 25.5% (R$ 3.50 → R$ 4.40). Fornecedor aumentou o preço.
```
- **Significa**: O fornecedor está cobrando mais caro de você
- **Ação**: Considere negociar com fornecedor ou buscar alternativas

```
💰 CUSTO DE COMPRA diminuiu 18.2% (R$ 5.50 → R$ 4.50). Fornecedor baixou o preço.
```
- **Significa**: O fornecedor baixou o preço
- **Ação**: Oportunidade de aumentar margem ou baixar preço de venda

### 💸 Mensagens sobre MARGEM
```
💸 Margem de lucro muito alta (85.3%). Preço de venda pode estar afastando clientes.
```
- **Significa**: Você está cobrando muito mais do que o custo
- **Ação**: Considere reduzir o preço de venda para recuperar vendas

```
⚠️ Margem de lucro muito baixa (15.2%). Preço de venda pode estar pouco atrativo.
```
- **Significa**: Sua margem está muito apertada
- **Ação**: Produto pode estar em promoção ou preço está abaixo do mercado

---

## 📊 Tipos de Motivos

### 1. 🔴 FALTA DE ESTOQUE
- Produto em ruptura (estoque = 0)
- Risco crítico ou alto de ruptura
- Houve falta de estoque durante a queda
- **Ação**: Repor estoque urgentemente

### 2. 💵 VARIAÇÃO DE PREÇO
- Custo aumentou muito (fornecedor)
- Preço de venda aumentou muito (você)
- Promoção terminou
- **Ação**: Revisar precificação

### 3. 🔶 MÚLTIPLOS FATORES
- Estoque E preço contribuíram
- Nenhum fator é dominante
- **Ação**: Analisar ambos os aspectos

### 4. ⚪ INDEFINIDO
- Sem causa aparente
- **Ação**: Investigar outros fatores (concorrência, sazonalidade, etc.)

---

## ✅ Dados São CORRETOS!

O sistema está calculando corretamente:
- ✅ Variação de CUSTO (quanto você paga)
- ✅ Variação de PREÇO DE VENDA (quanto você cobra)
- ✅ Percentuais de aumento/diminuição
- ✅ Valores em R$ (antes → depois)

### Exemplo de Cálculo Correto:
```
Preço no Pico: R$ 8,36
Preço Atual: R$ 23,00
Variação: ((23,00 - 8,36) / 8,36) × 100 = 175,1% ✅
```

---

## 🎯 Como Usar Essas Informações

### Para Produtos com Variação de Preço:

1. **Se PREÇO DE VENDA aumentou muito:**
   - Avaliar se o aumento foi necessário
   - Considerar reduzir para recuperar vendas
   - Verificar se concorrência tem preço menor

2. **Se CUSTO aumentou muito:**
   - Negociar com fornecedor
   - Buscar fornecedores alternativos
   - Repassar aumento para preço de venda (com cuidado)

3. **Se PROMOÇÃO terminou:**
   - Considerar fazer nova promoção
   - Avaliar se preço normal está competitivo
   - Analisar margem de lucro

### Para Produtos com Falta de Estoque:

1. **Repor estoque urgentemente**
2. **Aumentar estoque ideal sugerido**
3. **Melhorar gestão de compras**

---

## 📱 Melhorias Implementadas

### ✅ Design
- Badge não sobrepõe mais o texto
- Lista de motivos com espaçamento adequado
- Emojis para identificação rápida

### ✅ Mensagens Claras
- 💰 = CUSTO (você paga ao fornecedor)
- 🏷️ = PREÇO DE VENDA (você cobra do cliente)
- Valores exatos: R$ X → R$ Y
- Percentuais precisos

### ✅ Análise Inteligente
- Detecta picos reais (não flutuações)
- Exige queda sustentada (múltiplos meses)
- Sistema de pontuação para motivos
- Detecta sazonalidade

---

## 🚀 Próximos Passos

1. **Reinicie o backend** para aplicar melhorias
2. **Acesse** `/picos-queda`
3. **Analise** os produtos com atenção aos emojis:
   - 💰 = Problema com fornecedor
   - 🏷️ = Problema com seu preço
4. **Tome ações** baseadas nos motivos identificados

---

**Lembre-se**: Os dados estão corretos! Use-os para tomar decisões informadas sobre precificação e gestão de estoque. 📊✅
