import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchFornecedores, fetchCategorias } from '../../services/api';
import styles from './Filtros.module.css';

const Filtros = ({ onFilterChange, initialFornecedor = '', initialCategoria = '' }) => {
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState(initialFornecedor);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(initialCategoria);
  const [isExpanded, setIsExpanded] = useState(false);

  // Buscar fornecedores
  const { data: fornecedoresData } = useQuery({
    queryKey: ['fornecedores'],
    queryFn: fetchFornecedores,
    staleTime: 1000 * 60 * 60 // 1 hora
  });

  // Buscar categorias
  const { data: categoriasData } = useQuery({
    queryKey: ['categorias'],
    queryFn: fetchCategorias,
    staleTime: 1000 * 60 * 60 // 1 hora
  });

  const fornecedores = fornecedoresData?.data || [];
  const categorias = categoriasData?.data || [];

  const handleFornecedorChange = (e) => {
    const valor = e.target.value;
    setFornecedorSelecionado(valor);
    onFilterChange({ fornecedor: valor, categoria: categoriaSelecionada });
  };

  const handleCategoriaChange = (e) => {
    const valor = e.target.value;
    setCategoriaSelecionada(valor);
    onFilterChange({ fornecedor: fornecedorSelecionado, categoria: valor });
  };

  const handleLimpar = () => {
    setFornecedorSelecionado('');
    setCategoriaSelecionada('');
    onFilterChange({ fornecedor: '', categoria: '' });
  };

  const temFiltrosAtivos = fornecedorSelecionado || categoriaSelecionada;

  return (
    <div className={styles.filtrosContainer}>
      <button 
        className={styles.toggleButton}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className={styles.icon}>🔍</span>
        <span>Filtros</span>
        {temFiltrosAtivos && <span className={styles.badge}>{
          (fornecedorSelecionado ? 1 : 0) + (categoriaSelecionada ? 1 : 0)
        }</span>}
        <span className={`${styles.arrow} ${isExpanded ? styles.arrowUp : ''}`}>▼</span>
      </button>

      {isExpanded && (
        <div className={styles.filtrosContent}>
          <div className={styles.filtrosGrid}>
            <div className={styles.filtroItem}>
              <label htmlFor="fornecedor" className={styles.label}>
                <span className={styles.labelIcon}>🏢</span>
                Fornecedor
              </label>
              <select
                id="fornecedor"
                value={fornecedorSelecionado}
                onChange={handleFornecedorChange}
                className={styles.select}
              >
                <option value="">Todos os fornecedores</option>
                {fornecedores.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filtroItem}>
              <label htmlFor="categoria" className={styles.label}>
                <span className={styles.labelIcon}>📁</span>
                Categoria
              </label>
              <select
                id="categoria"
                value={categoriaSelecionada}
                onChange={handleCategoriaChange}
                className={styles.select}
              >
                <option value="">Todas as categorias</option>
                {categorias.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {temFiltrosAtivos && (
            <div className={styles.filtrosActions}>
              <button onClick={handleLimpar} className={styles.limparButton}>
                <span>✕</span> Limpar Filtros
              </button>
              <div className={styles.filtrosAtivos}>
                {fornecedorSelecionado && (
                  <span className={styles.filtroTag}>
                    🏢 {fornecedorSelecionado}
                    <button onClick={() => {
                      setFornecedorSelecionado('');
                      onFilterChange({ fornecedor: '', categoria: categoriaSelecionada });
                    }}>×</button>
                  </span>
                )}
                {categoriaSelecionada && (
                  <span className={styles.filtroTag}>
                    📁 {categoriaSelecionada}
                    <button onClick={() => {
                      setCategoriaSelecionada('');
                      onFilterChange({ fornecedor: fornecedorSelecionado, categoria: '' });
                    }}>×</button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Filtros;
