import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchProdutoDetalhe } from '../../services/api';
import Loading from '../../components/Loading/Loading';
import ProductImage from '../../components/ProductImage/ProductImage';
import styles from './ProductDetail.module.css';

const ProductDetail = () => {
  const { tipo, codigo } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['produto-detalhe', tipo, codigo],
    queryFn: () => fetchProdutoDetalhe(tipo, codigo)
  });

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const getMesNome = (mesNum) => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return meses[mesNum - 1] || '';
  };

  const getRiscoColor = (risco) => {
    const colors = {
      critico: '#e74c3c',
      alto: '#e67e22',
      medio: '#f39c12',
      baixo: '#27ae60'
    };
    return colors[risco] || '#95a5a6';
  };

  const getTipoRecomendacaoColor = (tipo) => {
    const colors = {
      urgente: '#e74c3c',
      alerta: '#e67e22',
      atencao: '#f39c12',
      oportunidade: '#27ae60',
      sazonalidade: '#004B87',
      info: '#3498db'
    };
    return colors[tipo] || '#95a5a6';
  };

  if (isLoading) return <Loading />;

  if (isError) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>Erro ao carregar produto: {error.message}</p>
          <button onClick={() => navigate(-1)} className={styles.button}>
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const produto = data?.data;
  const isEcommerce = tipo === 'ecommerce';

  const getImageSrc = () => {
    if (isEcommerce) {
      return produto.imagemURL;
    } else {
      return produto.imagemBase64;
    };
  };

  const buildEstudoQuedaTexto = () => {
    if (!produto || !produto.analisePreditiva || !produto.historicoVendas || produto.historicoVendas.length === 0) {
      return '';
    }

    const { analisePreditiva, historicoVendas } = produto;

    const mesPico = analisePreditiva.mesPico;
    const tendencia = analisePreditiva.tendencia;
    const ruptura = analisePreditiva.ruptura;

    const mesesOrdenados = [...historicoVendas].sort((a, b) => {
      if (a.ano === b.ano) return a.mes - b.mes;
      return a.ano - b.ano;
    });

    const picoIdx = mesesOrdenados.findIndex(
      (m) => m.mes === mesPico.mes && m.ano === mesPico.ano
    );

    let texto = '';

    if (picoIdx !== -1) {
      const pico = mesesOrdenados[picoIdx];
      const after1 = mesesOrdenados[picoIdx + 1];
      const after2 = mesesOrdenados[picoIdx + 2];

      texto += `O pico de vendas deste produto ocorreu em ${getMesNome(pico.mes)}/${pico.ano}, com ${pico.quantidade} unidades vendidas. `;

      // Intensidade do pico em relação aos demais meses
      const outrosMeses = mesesOrdenados.filter((_, idx) => idx !== picoIdx);
      const mediaOutros = outrosMeses.length > 0
        ? outrosMeses.reduce((acc, v) => acc + (v.quantidade || 0), 0) / outrosMeses.length
        : 0;

      if (mediaOutros > 0) {
        const fatorPico = (pico.quantidade / mediaOutros).toFixed(1);
        texto += `Esse pico representa cerca de ${fatorPico}x a média de vendas dos demais meses analisados. `;
      }

      if (after1 || after2) {
        const ref = pico.quantidade || 1;
        const q1 = after1 ? after1.quantidade : 0;
        const q2 = after2 ? after2.quantidade : 0;
        const p1 = after1 ? ((q1 / ref) * 100).toFixed(1) : null;
        const p2 = after2 ? ((q2 / ref) * 100).toFixed(1) : null;

        if (after1 && after2) {
          texto += `Nos meses seguintes, as vendas caíram para ${q1} un. (${p1}% do pico) em ${getMesNome(after1.mes)}/${after1.ano} e ${q2} un. (${p2}% do pico) em ${getMesNome(after2.mes)}/${after2.ano}. `;
        } else if (after1) {
          texto += `No mês seguinte, as vendas caíram para ${q1} un. (${p1}% do pico) em ${getMesNome(after1.mes)}/${after1.ano}. `;
        }
      }
    }

    if (tendencia && tendencia.descricao) {
      texto += `A tendência geral nos últimos meses é de ${tendencia.descricao.toLowerCase()}. `;
    }

    if (ruptura && ruptura.mensagem) {
      texto += `Em relação ao estoque, o sistema identificou ${ruptura.mensagem.toLowerCase()}. `;
      if (typeof ruptura.diasEstoque === 'number' && ruptura.diasEstoque > 0) {
        texto += `Com o estoque atual, estimamos aproximadamente ${ruptura.diasEstoque} dias de cobertura considerando o ritmo recente de vendas. `;
      }
    }

    if (analisePreditiva.mesPico && analisePreditiva.mesPico.motivosPossiveis && analisePreditiva.mesPico.motivosPossiveis.length > 0) {
      texto += 'Possíveis fatores que explicam o pico incluem: ';
      texto += analisePreditiva.mesPico.motivosPossiveis.join(', ');
      texto += '. ';
    }

    return texto;
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Voltar ao Catálogo
        </button>

        <div className={styles.productContainer}>
          <div className={styles.imageSection}>
            <ProductImage
              src={getImageSrc()}
              alt={isEcommerce ? produto.nome : produto.descricao}
              className={styles.image}
            />
          </div>

          <div className={styles.infoSection}>
            <div className={styles.header}>
              <span className={styles.codigo}>
                Código: {isEcommerce ? produto.codigo : produto.codigoInterno}
              </span>
              {produto.margem > 0 && (
                <span className={styles.badge}>{produto.margem}% de margem</span>
              )}
            </div>

            <h1 className={styles.title}>
              {isEcommerce ? produto.nome : produto.descricao}
            </h1>

            {!isEcommerce && produto.descricaoResumida && (
              <p className={styles.descricaoResumida}>
                {produto.descricaoResumida}
              </p>
            )}

            <div className={styles.prices}>
              <div className={styles.priceRow}>
                <span className={styles.label}>Preço de Venda:</span>
                <span className={styles.priceVenda}>
                  {formatarMoeda(isEcommerce ? produto.preco : produto.precoVenda)}
                </span>
              </div>
              <div className={styles.priceRow}>
                <span className={styles.label}>Preço de Custo:</span>
                <span className={styles.precoCusto}>
                  {formatarMoeda(produto.precoCusto)}
                </span>
              </div>
              <div className={styles.priceRow}>
                <span className={styles.label}>Margem de Lucro:</span>
                <span className={styles.margem}>{produto.margem}%</span>
              </div>
            </div>

            {!isEcommerce && produto.codigoBarras && (
              <div className={styles.info}>
                <span className={styles.label}>Código de Barras:</span>
                <span className={styles.value}>{produto.codigoBarras}</span>
              </div>
            )}

            {/* Estudo da Queda de Vendas - focado em loja física */}
            {!isEcommerce && (
              <div className={styles.estudoQuedaSection}>
                <h2 className={styles.sectionTitle}>🧠 Estudo da Queda de Vendas</h2>
                <p className={styles.estudoTexto}>
                  {buildEstudoQuedaTexto()}
                </p>
              </div>
            )}

            <div className={styles.estoque}>
              <span className={styles.label}>Estoque:</span>
              <span
                className={
                  produto.estoque > 0 ? styles.emEstoque : styles.semEstoque
                }
              >
                {produto.estoque > 0
                  ? `${produto.estoque} unidades`
                  : 'Sem estoque'}
              </span>
            </div>

            {/* Estoque ideal sugerido (apenas para loja física) */}
            {!isEcommerce && produto.estoqueIdealSugerido > 0 && (
              <div className={styles.info}>
                <span className={styles.label}>Estoque ideal sugerido:</span>
                <span
                  className={styles.value}
                  title="Calculado com base no consumo médio recente, risco de ruptura e proximidade do mês de pico/sazonalidade."
                >
                  {produto.estoqueIdealSugerido} unidades
                </span>
              </div>
            )}

            {!isEcommerce && produto.fornecedor && (
              <div className={styles.info}>
                <span className={styles.label}>Fornecedor:</span>
                <span className={styles.value}>{produto.fornecedor}</span>
              </div>
            )}
          </div>
        </div>

        {/* Análise Preditiva e Recomendações - PARA AMBOS (Loja Física e E-commerce) */}
        {produto.analisePreditiva && produto.analisePreditiva.status === 'completo' && (
          <>
            {/* Cards de Análise */}
            <div className={styles.analiseCards}>
              {/* Card Mês de Pico */}
              <div className={styles.analiseCard}>
                <div className={styles.cardIcon}>📅</div>
                <h3 className={styles.cardTitle}>Mês de Pico</h3>
                <div className={styles.cardValue}>{produto.analisePreditiva.mesPico.nome}</div>
                <div className={styles.cardSubtitle}>{produto.analisePreditiva.mesPico.quantidade} unidades vendidas</div>
                <div className={styles.cardMotivos}>
                  <strong>Possíveis motivos:</strong>
                  <div className={styles.motivosList}>
                    {produto.analisePreditiva.mesPico.motivosPossiveis.map((motivo, idx) => (
                      <span key={idx} className={styles.motivoTag}>{motivo}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Tendência */}
              <div className={styles.analiseCard}>
                <div className={styles.cardIcon}>
                  {produto.analisePreditiva.tendencia.direcao === 'crescimento' ? '📈' : 
                   produto.analisePreditiva.tendencia.direcao === 'queda' ? '📉' : '➡️'}
                </div>
                <h3 className={styles.cardTitle}>Tendência</h3>
                <div className={styles.cardValue} style={{
                  color: produto.analisePreditiva.tendencia.direcao === 'crescimento' ? '#27ae60' :
                         produto.analisePreditiva.tendencia.direcao === 'queda' ? '#e74c3c' : '#95a5a6'
                }}>
                  {produto.analisePreditiva.tendencia.descricao}
                </div>
                <div className={styles.cardSubtitle}>Últimos 3 meses vs anteriores</div>
              </div>

              {/* Card Previsão */}
              <div className={styles.analiseCard}>
                <div className={styles.cardIcon}>🔮</div>
                <h3 className={styles.cardTitle}>Previsão</h3>
                <div className={styles.cardValue}>{produto.analisePreditiva.previsao.proximoMes} unidades</div>
                <div className={styles.cardSubtitle}>
                  Próximo mês (confiança: {produto.analisePreditiva.previsao.confianca})
                </div>
              </div>

              {/* Card Risco de Ruptura */}
              <div className={styles.analiseCard}>
                <div className={styles.cardIcon}>⚠️</div>
                <h3 className={styles.cardTitle}>Risco de Ruptura</h3>
                <div className={styles.cardValue} style={{
                  color: getRiscoColor(produto.analisePreditiva.ruptura.risco)
                }}>
                  {produto.analisePreditiva.ruptura.risco.toUpperCase()}
                </div>
                <div className={styles.cardSubtitle}>{produto.analisePreditiva.ruptura.mensagem}</div>
              </div>
            </div>

            {/* Recomendações */}
            {produto.analisePreditiva.recomendacoes && produto.analisePreditiva.recomendacoes.length > 0 && (
              <div className={styles.recomendacoesSection}>
                <h2 className={styles.sectionTitle}>💡 Recomendações Inteligentes</h2>
                
                {/* Card de Valor Total do Estoque */}
                <div 
                  className={styles.recomendacaoCard}
                  style={{ borderLeftColor: '#3498db', marginBottom: '16px' }}
                >
                  <div className={styles.recIcone}>💰</div>
                  <div className={styles.recConteudo}>
                    <h4 className={styles.recTitulo}>Valor Total do Estoque</h4>
                    <p className={styles.recMensagem}>
                      Você possui <strong>{produto.estoque} unidades</strong> em estoque, 
                      com valor total de <strong>{formatarMoeda(produto.estoque * produto.precoCusto)}</strong> em custo.
                      {produto.precoVenda && (
                        <> Valor potencial de venda: <strong>{formatarMoeda(produto.estoque * (isEcommerce ? produto.preco : produto.precoVenda))}</strong>.</>
                      )}
                    </p>
                  </div>
                </div>

                <div className={styles.recomendacoes}>
                  {produto.analisePreditiva.recomendacoes.map((rec, idx) => (
                    <div 
                      key={idx} 
                      className={styles.recomendacaoCard}
                      style={{ borderLeftColor: getTipoRecomendacaoColor(rec.tipo) }}
                    >
                      <div className={styles.recIcone}>{rec.icone}</div>
                      <div className={styles.recConteudo}>
                        <h4 className={styles.recTitulo}>{rec.titulo}</h4>
                        <p className={styles.recMensagem}>{rec.mensagem}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Histórico de Vendas (12 meses) */}
            {produto.historicoVendas && produto.historicoVendas.length > 0 && (
              <div className={styles.historicoSection}>
                <h2 className={styles.sectionTitle}>📊 Histórico de Vendas (12 meses)</h2>
                <div className={styles.historicoTable}>
                  <table>
                    <thead>
                      <tr>
                        <th>Mês/Ano</th>
                        <th>Quantidade Vendida</th>
                        <th>Nº de Vendas</th>
                        <th>Preço Médio</th>
                        <th>Custo Médio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {produto.historicoVendas.map((venda, idx) => {
                        // Calcular variação de custo para o tooltip
                        const custoAnterior = idx < produto.historicoVendas.length - 1 
                          ? produto.historicoVendas[idx + 1].custoMedio 
                          : venda.custoMedio;
                        const variacao = custoAnterior > 0 
                          ? ((venda.custoMedio - custoAnterior) / custoAnterior * 100).toFixed(1)
                          : 0;
                        const mesAnterior = idx < produto.historicoVendas.length - 1
                          ? getMesNome(produto.historicoVendas[idx + 1].mes)
                          : getMesNome(venda.mes);
                        
                        const tooltipText = venda.custoAlterado 
                          ? `⚠️ Variação de Custo Detectada!\n\nCusto atual: ${formatarMoeda(venda.custoMedio)}\nCusto anterior (${mesAnterior}): ${formatarMoeda(custoAnterior)}\nVariação: ${variacao > 0 ? '+' : ''}${variacao}%\n\nEste custo foi alterado em relação ao mês anterior. Possíveis causas:\n• Reajuste do fornecedor\n• Mudança de fornecedor\n• Variação cambial\n• Alteração de frete/impostos`
                          : '';

                        return (
                          <tr key={idx}>
                            <td>{getMesNome(venda.mes)}/{venda.ano}</td>
                            <td><strong>{venda.quantidade}</strong> unidades</td>
                            <td>{venda.numeroVendas} vendas</td>
                            <td>{formatarMoeda(venda.precoMedio)}</td>
                            <td 
                              className={venda.custoAlterado ? styles.custoAlterado : ''}
                              title={tooltipText}
                            >
                              {venda.custoMedio > 0 ? formatarMoeda(venda.custoMedio) : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
