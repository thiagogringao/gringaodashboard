import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchEcommerceProdutos } from '../../services/api';
import ProductTable from '../../components/ProductTable/ProductTable';
import SearchBar from '../../components/SearchBar/SearchBar';
import Pagination from '../../components/Pagination/Pagination';
import Loading from '../../components/Loading/Loading';
import EmptyState from '../../components/EmptyState/EmptyState';
import styles from './EcommerceCatalog.module.css';

const EcommerceCatalog = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ field: 'totalVendas', direction: 'desc' });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['ecommerce-produtos', page, search],
    queryFn: () => fetchEcommerceProdutos({ page, search })
  });

  const handleSearch = useCallback((searchTerm) => {
    setSearch(searchTerm);
    setPage(1); // Reset para primeira página ao buscar
  }, []);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSort = useCallback((field) => {
    setSortConfig(prevConfig => {
      // Se clicar no mesmo campo, inverte a direção
      if (prevConfig.field === field) {
        return {
          field,
          direction: prevConfig.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      // Se clicar em novo campo, começa com ordem crescente (exceto totalVendas)
      return {
        field,
        direction: field === 'totalVendas' ? 'desc' : 'asc'
      };
    });
  }, []);

  // Ordenar produtos localmente
  const sortedProdutos = data?.data ? [...data.data].sort((a, b) => {
    const { field, direction } = sortConfig;
    let aValue = a[field];
    let bValue = b[field];

    // Tratamento especial para campos específicos
    if (field === 'codigo' || field === 'descricao' || field === 'fornecedor' || field === 'mesPico') {
      // Ordenação alfabética
      aValue = (aValue || '').toString().toLowerCase();
      bValue = (bValue || '').toString().toLowerCase();
      return direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    // Ordenação numérica
    aValue = parseFloat(aValue) || 0;
    bValue = parseFloat(bValue) || 0;
    return direction === 'asc' ? aValue - bValue : bValue - aValue;
  }) : [];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Catálogo E-commerce</h1>
      </header>

      <div className={styles.content}>
        <SearchBar onSearch={handleSearch} placeholder="Buscar produtos..." />

        {isLoading && <Loading />}

        {!isLoading && isError && (
          <div className={styles.error}>
            <p>Erro ao carregar produtos: {error?.message || 'Erro desconhecido'}</p>
          </div>
        )}

        {!isLoading && !isError && sortedProdutos.length === 0 && (
          <EmptyState message="Nenhum produto encontrado" />
        )}

        {!isLoading && !isError && sortedProdutos.length > 0 && (
          <>
            <ProductTable
              produtos={sortedProdutos}
              tipo="ecommerce"
              onSort={handleSort}
              sortConfig={sortConfig}
            />

            <Pagination
              currentPage={page}
              totalPages={data.pagination?.totalPages || 1}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default EcommerceCatalog;
