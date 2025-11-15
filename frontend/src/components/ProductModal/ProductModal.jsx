import { useEffect } from 'react';
import ProductImageTooltip from '../ProductImageTooltip/ProductImageTooltip';
import styles from './ProductModal.module.css';

const ProductModal = ({ isOpen, onClose, title, products, type, tipo = 'loja-fisica' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const getRowClass = (produto) => {
    if (type === 'margem-negativa') {
      return styles.rowNegative;
    }
    if (type === 'produtos-parados') {
      return styles.rowWarning;
    }
    if (type === 'top-lucrativos') {
      return styles.rowPositive;
    }
    return '';
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.content}>
          {products.length === 0 ? (
            <p className={styles.emptyMessage}>Nenhum produto encontrado.</p>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Descrição</th>
                    <th>Estoque</th>
                    <th>Preço Venda</th>
                    <th>Preço Custo</th>
                    {type === 'margem-negativa' && <th>Prejuízo</th>}
                    {type === 'produtos-parados' && <th>Valor Parado</th>}
                    {type === 'top-lucrativos' && <th>Lucro Total</th>}
                  </tr>
                </thead>
                <tbody>
                  {products.map((produto, index) => (
                    <tr key={produto.codigo || index} className={getRowClass(produto)}>
                      <td className={styles.codigo}>
                        <ProductImageTooltip codigo={produto.codigo} tipo={tipo}>
                          {produto.codigo}
                        </ProductImageTooltip>
                      </td>
                      <td className={styles.descricao}>{produto.descricao}</td>
                      <td className={styles.center}>{produto.estoque}</td>
                      <td className={styles.right}>{formatarMoeda(produto.precoVenda)}</td>
                      <td className={styles.right}>{formatarMoeda(produto.precoCusto)}</td>
                      {type === 'margem-negativa' && (
                        <td className={`${styles.right} ${styles.negative}`}>
                          {formatarMoeda(produto.prejuizo)}
                        </td>
                      )}
                      {type === 'produtos-parados' && (
                        <td className={`${styles.right} ${styles.warning}`}>
                          {formatarMoeda(produto.valorParado)}
                        </td>
                      )}
                      {type === 'top-lucrativos' && (
                        <td className={`${styles.right} ${styles.positive}`}>
                          {formatarMoeda(produto.lucroTotal)}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <p className={styles.totalInfo}>
            Total: {products.length} produto{products.length !== 1 ? 's' : ''}
          </p>
          <button className={styles.closeFooterButton} onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
