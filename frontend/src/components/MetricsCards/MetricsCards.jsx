import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchLojaFisicaMetrics, fetchLojaFisicaMetricsDetails } from '../../services/api';
import ProductModal from '../ProductModal/ProductModal';
import api from '../../services/api';
import styles from './MetricsCards.module.css';

const MetricsCards = ({ tipo = 'loja-fisica' }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [modalProducts, setModalProducts] = useState([]);
  const [modalTitle, setModalTitle] = useState('');
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Determinar qual função de API usar baseado no tipo
  const fetchMetrics = tipo === 'ecommerce' 
    ? async () => {
        const response = await api.get('/api/produtos/ecommerce/metrics');
        return response.data;
      }
    : fetchLojaFisicaMetrics;

  const { data, isLoading, error } = useQuery({
    queryKey: [`${tipo}-metrics`],
    queryFn: fetchMetrics,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1
  });

  // Debug
  if (error) {
    console.error('Erro ao carregar métricas:', error);
  }
  
  if (data) {
    console.log('Métricas carregadas:', data);
  }

  // Se houver erro, mostrar mensagem
  if (error) {
    return (
      <div className={styles.cardsContainer}>
        <div className={styles.card} style={{ borderTopColor: '#e74c3c' }}>
          <div className={styles.cardContent}>
            <p style={{ color: '#e74c3c' }}>
              Erro ao carregar métricas. Verifique o console.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  const formatarNumero = (valor) => {
    return new Intl.NumberFormat('pt-BR').format(valor);
  };

  const handleCardClick = async (type) => {
    setLoadingDetails(true);
    setModalType(type);
    
    let title = '';
    switch (type) {
      case 'margem-negativa':
        title = '⚠️ Produtos com Margem Negativa';
        break;
      case 'produtos-parados':
        title = '📦 Produtos Parados (Sem Vendas)';
        break;
      case 'top-lucrativos':
        title = '🔥 Top 20 Produtos Mais Lucrativos';
        break;
      default:
        title = 'Produtos';
    }
    
    setModalTitle(title);
    setModalOpen(true);
    
    try {
      // Usar API correta baseado no tipo
      const url = tipo === 'ecommerce' 
        ? `/api/produtos/ecommerce/metrics/${type}`
        : `/api/produtos/loja-fisica/metrics/${type}`;
      
      const response = await api.get(url);
      setModalProducts(response.data.data || []);
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error);
      setModalProducts([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalProducts([]);
    setModalType(null);
  };

  if (isLoading) {
    return (
      <div className={styles.cardsContainer}>
        <div className={styles.card}>
          <div className={styles.cardSkeleton}></div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardSkeleton}></div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardSkeleton}></div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardSkeleton}></div>
        </div>
      </div>
    );
  }

  const metrics = data?.data || {};

  return (
    <div className={styles.cardsContainer}>
      {/* Card 1: Capital Investido */}
      <div className={styles.card} style={{ borderTopColor: '#3498db' }}>
        <div className={styles.cardIcon}>💰</div>
        <div className={styles.cardContent}>
          <h3 className={styles.cardTitle}>Capital Investido</h3>
          <p className={styles.cardValue}>{formatarMoeda(metrics.capitalInvestido || 0)}</p>
          <p className={styles.cardSubtitle}>
            {formatarNumero(metrics.totalProdutos || 0)} produtos em estoque
          </p>
        </div>
      </div>

      {/* Card 2: Produtos com Margem Negativa */}
      <div 
        className={`${styles.card} ${styles.clickable}`} 
        style={{ borderTopColor: '#e74c3c' }}
        onClick={() => handleCardClick('margem-negativa')}
      >
        <div className={styles.cardIcon}>⚠️</div>
        <div className={styles.cardContent}>
          <h3 className={styles.cardTitle}>Margem Negativa</h3>
          <p className={styles.cardValue}>{metrics.produtosMargemNegativa || 0}</p>
          <p className={styles.cardSubtitle}>
            Prejuízo: {formatarMoeda(metrics.prejuizoPotencial || 0)}
          </p>
        </div>
        <div className={styles.clickHint}>Clique para ver detalhes</div>
      </div>

      {/* Card 3: Produtos Parados */}
      <div 
        className={`${styles.card} ${styles.clickable}`} 
        style={{ borderTopColor: '#f39c12' }}
        onClick={() => handleCardClick('produtos-parados')}
      >
        <div className={styles.cardIcon}>📦</div>
        <div className={styles.cardContent}>
          <h3 className={styles.cardTitle}>Produtos Parados</h3>
          <p className={styles.cardValue}>{metrics.produtosParados || 0}</p>
          <p className={styles.cardSubtitle}>
            {formatarMoeda(metrics.valorParado || 0)} parado
          </p>
        </div>
        <div className={styles.clickHint}>Clique para ver detalhes</div>
      </div>

      {/* Card 4: Top 20 Mais Lucrativos */}
      <div 
        className={`${styles.card} ${styles.clickable}`} 
        style={{ borderTopColor: '#27ae60' }}
        onClick={() => handleCardClick('top-lucrativos')}
      >
        <div className={styles.cardIcon}>🔥</div>
        <div className={styles.cardContent}>
          <h3 className={styles.cardTitle}>Top 20 Lucrativos</h3>
          <p className={styles.cardValue}>{metrics.percentualTop20 || 0}%</p>
          <p className={styles.cardSubtitle}>
            do lucro total
          </p>
        </div>
        <div className={styles.clickHint}>Clique para ver detalhes</div>
      </div>

      {/* Modal de Produtos */}
      <ProductModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={modalTitle}
        products={loadingDetails ? [] : modalProducts}
        type={modalType}
        tipo={tipo}
      />
    </div>
  );
};

export default MetricsCards;
