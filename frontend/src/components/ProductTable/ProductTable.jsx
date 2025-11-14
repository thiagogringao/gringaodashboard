import { memo, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ImageTooltip from '../ImageTooltip/ImageTooltip';
import ProductImage from '../ProductImage/ProductImage';
import styles from './ProductTable.module.css';

const ProductTable = memo(({ produtos, tipo, onSort, sortConfig }) => {
  const isEcommerce = tipo === 'ecommerce';
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [activeTooltip, setActiveTooltip] = useState(null);

  const handleMouseEnter = (event, produtoId) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const tooltipHeight = 300; // Altura estimada do tooltip
    const windowHeight = window.innerHeight;
    const spaceBelow = windowHeight - rect.bottom;
    
    // Se não há espaço suficiente abaixo, mostrar acima
    const shouldShowAbove = spaceBelow < tooltipHeight;
    
    setTooltipPosition({
      top: shouldShowAbove ? rect.top - tooltipHeight + 20 : rect.top + rect.height / 2,
      left: rect.left - 270 // Tooltip à esquerda (250px largura + 20px margem)
    });
    setActiveTooltip(produtoId);
  };

  const handleMouseLeave = () => {
    setActiveTooltip(null);
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const getImageSrc = (produto) => {
    if (isEcommerce) {
      return produto.imagemURL;
    } else {
      return produto.imagemBase64;
    }
  };

  const handleSort = (field) => {
    if (onSort) {
      onSort(field);
    }
  };

  const getSortIcon = (field) => {
    if (!sortConfig || sortConfig.field !== field) {
      return <span className={styles.sortIcon}>⇅</span>;
    }
    return sortConfig.direction === 'asc' 
      ? <span className={styles.sortIconActive}>↑</span>
      : <span className={styles.sortIconActive}>↓</span>;
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.thImage}>Imagem</th>
            <th className={styles.sortable} onClick={() => handleSort('codigo')}>
              Código {getSortIcon('codigo')}
            </th>
            <th className={styles.sortable} onClick={() => handleSort('descricao')}>
              Descrição {getSortIcon('descricao')}
            </th>
            {isEcommerce && (
              <>
                <th className={styles.sortable} onClick={() => handleSort('preco')}>
                  Preço Venda {getSortIcon('preco')}
                </th>
                <th className={styles.sortable} onClick={() => handleSort('precoCusto')}>
                  Preço Custo {getSortIcon('precoCusto')}
                </th>
              </>
            )}
            {!isEcommerce && (
              <>
                <th className={styles.sortable} onClick={() => handleSort('fornecedor')}>
                  Fornecedor {getSortIcon('fornecedor')}
                </th>
                <th className={styles.sortable} onClick={() => handleSort('precoVenda')}>
                  Preço Venda {getSortIcon('precoVenda')}
                </th>
              </>
            )}
            <th className={styles.sortable} onClick={() => handleSort('estoque')}>
              Estoque {getSortIcon('estoque')}
            </th>
            <th className={styles.sortable} onClick={() => handleSort('estoqueMinimo')}>
              Estoque Mín. {getSortIcon('estoqueMinimo')}
            </th>
            <th className={styles.sortable} onClick={() => handleSort('mesPico')}>
              Mês Pico {getSortIcon('mesPico')}
            </th>
            <th className={styles.thActions}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((produto) => (
            <tr key={isEcommerce ? produto.id : produto.codigoInterno}>
              <td className={styles.tdImage}>
                <ImageTooltip
                  src={getImageSrc(produto)}
                  alt={isEcommerce ? produto.nome : produto.descricao}
                >
                  <div className={styles.imageWrapper}>
                    <ProductImage
                      src={getImageSrc(produto)}
                      alt={isEcommerce ? produto.nome : produto.descricao}
                      className={styles.thumbnail}
                    />
                  </div>
                </ImageTooltip>
              </td>
              <td className={styles.codigo}>
                {isEcommerce ? produto.codigo : produto.codigoInterno}
              </td>
              <td className={styles.descricao}>
                <div className={styles.descricaoText}>
                  {isEcommerce ? produto.nome : produto.descricao}
                </div>
                {!isEcommerce && produto.descricaoResumida && (
                  <div className={styles.descricaoResumida}>
                    {produto.descricaoResumida}
                  </div>
                )}
              </td>
              {isEcommerce && (
                <>
                  <td className={styles.preco}>
                    {formatarMoeda(produto.preco || 0)}
                  </td>
                  <td className={styles.precoCusto}>
                    {produto.precoCusto > 0 ? formatarMoeda(produto.precoCusto) : '-'}
                  </td>
                </>
              )}
              {!isEcommerce && (
                <>
                  <td className={styles.fornecedor}>
                    {produto.fornecedor || '-'}
                  </td>
                  <td className={styles.preco}>
                    <div 
                      className={styles.precoWrapper}
                      title={`Origem: ${produto.tipoPreco === 'revenda' ? 'Valor Revenda' : produto.tipoPreco === 'atacado' ? 'Valor Atacado' : produto.tipoPreco === 'varejo' ? 'Valor Varejo' : 'Preço Padrão'}`}
                    >
                      {produto.precoVenda ? formatarMoeda(produto.precoVenda) : '-'}
                      {produto.tipoPreco && (
                        <span className={`${styles.tipoPrecoTag} ${styles[`tipo${produto.tipoPreco.charAt(0).toUpperCase() + produto.tipoPreco.slice(1)}`]}`}>
                          {produto.tipoPreco === 'revenda' ? 'R' : produto.tipoPreco === 'atacado' ? 'A' : produto.tipoPreco === 'varejo' ? 'V' : 'P'}
                        </span>
                      )}
                    </div>
                  </td>
                </>
              )}
              <td className={styles.estoque}>
                <span className={produto.estoque > 0 ? styles.emEstoque : styles.semEstoque}>
                  {produto.estoque > 0 ? produto.estoque : 0}
                </span>
              </td>
              {/* Estoque Mínimo e Mês Pico - AGORA PARA AMBOS */}
              <td className={styles.estoqueMinimo}>
                {produto.estoqueMinimo > 0 ? (
                  <div 
                    className={styles.estoqueMinimoWrapper}
                    onMouseEnter={(e) => handleMouseEnter(e, isEcommerce ? produto.codigo : produto.codigoInterno)}
                    onMouseLeave={handleMouseLeave}
                    title={`Estoque Mínimo: ${produto.estoqueMinimo} | Vendas: ${produto.totalVendas || 0} | Média: ${produto.mediaMensal || 0}`}
                  >
                    <span className={styles.estoqueMinimoValue}>
                      {produto.estoqueMinimo}
                    </span>
                    <div 
                      className={`${styles.tooltip} ${activeTooltip === (isEcommerce ? produto.codigo : produto.codigoInterno) ? styles.tooltipActive : ''}`}
                      style={{
                        top: `${tooltipPosition.top}px`,
                        left: `${tooltipPosition.left}px`
                      }}
                    >
                      <div className={styles.tooltipHeader}>
                        Vendas (6 meses)
                      </div>
                      <div className={styles.tooltipContent}>
                        {produto.vendasMensais && produto.vendasMensais.length > 0 ? (
                          <>
                            {produto.vendasMensais.map((venda, index) => (
                              <div key={index} className={styles.tooltipRow}>
                                <span className={styles.tooltipLabel}>{venda.mes}</span>
                                <span className={styles.tooltipValue}>{venda.quantidade}</span>
                              </div>
                            ))}
                            <div className={styles.tooltipDivider}></div>
                            <div className={styles.tooltipRow}>
                              <span className={styles.tooltipLabel}>Média</span>
                              <span className={styles.tooltipValue}>{produto.mediaMensal || 0}</span>
                            </div>
                            <div className={styles.tooltipInfo}>
                              <strong>Est. Mín: {produto.estoqueMinimo}</strong><br/>
                              <small>(Média × 1,5)</small>
                            </div>
                          </>
                        ) : (
                          <div className={styles.tooltipInfo}>
                            Sem dados de vendas disponíveis
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  '-'
                )}
              </td>
              <td className={styles.mesPico}>
                {produto.mesPico ? (
                  <span className={styles.mesPicoBadge}>{produto.mesPico}</span>
                ) : (
                  '-'
                )}
              </td>
              <td className={styles.tdActions}>
                <Link
                  to={`/${tipo}/${isEcommerce ? produto.codigo : produto.codigoInterno}`}
                  className={styles.viewButton}
                >
                  Ver detalhes
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

ProductTable.displayName = 'ProductTable';

export default ProductTable;
