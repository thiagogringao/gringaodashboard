import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchLojaFisicaAbaixoEstoqueIdeal } from '../../services/api';
import SearchBar from '../../components/SearchBar/SearchBar';
import Pagination from '../../components/Pagination/Pagination';
import Loading from '../../components/Loading/Loading';
import EmptyState from '../../components/EmptyState/EmptyState';
import ImageTooltip from '../../components/ImageTooltip/ImageTooltip';
import styles from './SugestaoCompras.module.css';

const SugestaoCompras = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['sugestao-compras', { page, search }],
    queryFn: async () => {
      return fetchLojaFisicaAbaixoEstoqueIdeal({ page, search });
    },
    keepPreviousData: true
  });

  const handleSearch = useCallback((value) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const items = data?.data || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  console.log('[SugestaoCompras] Data recebida:', { 
    success: data?.success,
    totalItens: items.length, 
    totalGeral: pagination.total,
    primeiroItem: items[0]
  });

  // Agrupar produtos por fornecedor
  const gruposPorFornecedor = items.reduce((acc, item) => {
    const fornecedor = item.fornecedor || 'Sem fornecedor definido';
    if (!acc[fornecedor]) {
      acc[fornecedor] = [];
    }
    acc[fornecedor].push(item);
    return acc;
  }, {});

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate(-1)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </button>
        <h1 className={styles.title}>Sugestão de Compras</h1>
        <div className={styles.placeholder} />
      </header>

      <div className={styles.content}>
        <div className={styles.filtersRow}>
          <SearchBar onSearch={handleSearch} placeholder="Buscar por código ou descrição" />
        </div>

        {isLoading && <Loading />}

        {!isLoading && isError && (
          <div className={styles.error}>
            <p>Erro ao carregar sugestões: {error?.message || 'Erro desconhecido'}</p>
          </div>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <EmptyState message="Nenhum produto abaixo do estoque ideal sugerido." />
        )}

        {!isLoading && !isError && items.length > 0 && (
          <>
            {Object.entries(gruposPorFornecedor).map(([fornecedor, produtos]) => {
              const totalValorFornecedor = produtos.reduce(
                (sum, item) => sum + (item.valorTotalSugerido || 0),
                0
              );

              return (
                <div key={fornecedor} className={styles.fornecedorGrupo}>
                  <h2 className={styles.fornecedorTitulo}>
                    {fornecedor}{' '}
                    <span className={styles.fornecedorCount}>
                      ({produtos.length} produtos)
                    </span>
                    {totalValorFornecedor > 0 && (
                      <span className={styles.fornecedorTotal}>
                        Total sugerido: R$ {totalValorFornecedor.toFixed(2)}
                      </span>
                    )}
                  </h2>

                <div className={styles.tableContainer}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Descrição</th>
                        <th>Categoria</th>
                        <th>Estoque Atual</th>
                        <th>Estoque Ideal</th>
                        <th>Sugerido Comprar</th>
                        <th>Preço Custo</th>
                        <th>Valor Total Sugerido</th>
                        <th>Risco / Dias</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {produtos.map((item) => (
                        <tr key={item.codigoInterno}>
                          <td>
                            <div className={styles.codigoComImagem}>
                              <ImageTooltip src={item.imagemBase64} alt={item.descricao}>
                                <img 
                                  src={item.imagemBase64 || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"%3E%3Crect width="40" height="40" fill="%23f5f5f5"/%3E%3Ctext x="20" y="25" text-anchor="middle" font-size="10" fill="%23999"%3E?%3C/text%3E%3C/svg%3E'} 
                                  alt={item.descricao}
                                  className={styles.miniatura}
                                />
                              </ImageTooltip>
                              <span className={styles.codigo}>{item.codigoInterno}</span>
                            </div>
                          </td>
                          <td>{item.descricao}</td>
                          <td>{item.categoria || '-'}</td>
                          <td>{item.estoqueAtual}</td>
                          <td>{item.estoqueIdealSugerido}</td>
                          <td>
                            <strong>{item.quantidadeSugeridaCompra}</strong> un
                          </td>
                          <td>
                            {item.precoCusto > 0 ? `R$ ${item.precoCusto.toFixed(2)}` : '-'}
                          </td>
                          <td>
                            {item.valorTotalSugerido > 0 ? `R$ ${item.valorTotalSugerido.toFixed(2)}` : '-'}
                          </td>
                          <td>
                            <div className={styles.badgeRisco}>
                              {item.riscoRuptura || '-'}
                            </div>
                            {item.diasEstoque > 0 && (
                              <div className={styles.secondaryText}>
                                ~{item.diasEstoque} dias
                              </div>
                            )}
                          </td>
                          <td>
                            <button
                              type="button"
                              className={styles.linkDetalhes}
                              onClick={() => navigate(`/loja-fisica/${item.codigoInterno}`)}
                            >
                              Ver detalhes
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </div>
              );
            })}

            <Pagination
              currentPage={page}
              totalPages={pagination.totalPages || 1}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default SugestaoCompras;
