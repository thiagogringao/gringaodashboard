/**
 * Script para debugar produto 020728 e verificar cálculos de variação de preço
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../cache/loja_fisica.db');
const db = new Database(dbPath);

console.log('🔍 Debugando produto 020728...\n');

try {
  const produto = db.prepare('SELECT * FROM produtos WHERE codigo_interno = ?').get('020728');
  
  if (!produto) {
    console.log('❌ Produto não encontrado!');
    process.exit(1);
  }

  console.log('📦 DADOS DO PRODUTO:');
  console.log('Código:', produto.codigo_interno);
  console.log('Descrição:', produto.descricao);
  console.log('Preço Venda Atual:', produto.preco_venda);
  console.log('Preço Custo Atual:', produto.preco_custo);
  console.log('');

  if (produto.historico_12_meses) {
    const historico = JSON.parse(produto.historico_12_meses);
    
    console.log('📊 HISTÓRICO DE VENDAS (12 meses):');
    console.log('');
    
    historico.forEach((mes, index) => {
      console.log(`${index + 1}. ${mes.mesNome}/${mes.ano}`);
      console.log(`   Quantidade: ${mes.quantidade} unidades`);
      console.log(`   Preço Médio Venda: R$ ${mes.precoMedio?.toFixed(2) || '0.00'}`);
      console.log(`   Custo Médio: R$ ${mes.custoMedio?.toFixed(2) || '0.00'}`);
      console.log('');
    });

    // Encontrar o pico
    const historicoOrdenado = [...historico].sort((a, b) => {
      if (a.ano === b.ano) return a.mes - b.mes;
      return a.ano - b.ano;
    });

    let peakIndex = -1;
    let peakQuantidade = 0;
    const maxIndexParaPico = historicoOrdenado.length - 2;

    for (let i = 0; i < maxIndexParaPico; i++) {
      const quantidade = parseFloat(historicoOrdenado[i].quantidade || 0);
      if (quantidade > peakQuantidade) {
        peakQuantidade = quantidade;
        peakIndex = i;
      }
    }

    if (peakIndex >= 0) {
      const mesPico = historicoOrdenado[peakIndex];
      console.log('🔥 MÊS DE PICO:');
      console.log(`   ${mesPico.mesNome}/${mesPico.ano}`);
      console.log(`   Quantidade: ${mesPico.quantidade} unidades`);
      console.log(`   Preço Médio Venda no Pico: R$ ${mesPico.precoMedio?.toFixed(2) || '0.00'}`);
      console.log(`   Custo Médio no Pico: R$ ${mesPico.custoMedio?.toFixed(2) || '0.00'}`);
      console.log('');

      console.log('💰 CÁLCULOS DE VARIAÇÃO:');
      
      const precoVendaPico = parseFloat(mesPico.precoMedio || 0);
      const precoVendaAtual = parseFloat(produto.preco_venda || 0);
      const custoPico = parseFloat(mesPico.custoMedio || 0);
      const custoAtual = parseFloat(produto.preco_custo || 0);

      console.log('');
      console.log('PREÇO DE VENDA:');
      console.log(`   No Pico: R$ ${precoVendaPico.toFixed(2)}`);
      console.log(`   Atual: R$ ${precoVendaAtual.toFixed(2)}`);
      if (precoVendaPico > 0 && precoVendaAtual > 0) {
        const variacaoVenda = ((precoVendaAtual - precoVendaPico) / precoVendaPico) * 100;
        console.log(`   Variação: ${variacaoVenda.toFixed(1)}%`);
      } else {
        console.log(`   ⚠️  Não é possível calcular (um dos valores é 0)`);
      }

      console.log('');
      console.log('CUSTO DE COMPRA:');
      console.log(`   No Pico: R$ ${custoPico.toFixed(2)}`);
      console.log(`   Atual: R$ ${custoAtual.toFixed(2)}`);
      if (custoPico > 0 && custoAtual > 0) {
        const variacaoCusto = ((custoAtual - custoPico) / custoPico) * 100;
        console.log(`   Variação: ${variacaoCusto.toFixed(1)}%`);
      } else {
        console.log(`   ⚠️  Não é possível calcular (um dos valores é 0)`);
      }
    }
  }

} catch (error) {
  console.error('❌ Erro:', error.message);
  console.error(error);
} finally {
  db.close();
}
