import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { fetchLojaFisicaPicosQueda } from '../../services/api';
import SearchBar from '../../components/SearchBar/SearchBar';
import Pagination from '../../components/Pagination/Pagination';
import Loading from '../../components/Loading/Loading';
import EmptyState from '../../components/EmptyState/EmptyState';
import ImageTooltip from '../../components/ImageTooltip/ImageTooltip';
import styles from './PicosQueda.module.css';

const PicosQueda = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [thresholdPercent, setThresholdPercent] = useState(30);
  const [minPeakQuantity, setMinPeakQuantity] = useState(30);
  const [sortConfig, setSortConfig] = useState({ field: 'mesPicoQuantidade', direction: 'desc' });
  const [filtroMesPico, setFiltroMesPico] = useState('');
  const [estoqueMin, setEstoqueMin] = useState('');
  const [estoqueMax, setEstoqueMax] = useState('');
  const [motivoEstoque, setMotivoEstoque] = useState(true);
  const [motivoPreco, setMotivoPreco] = useState(true);
  const [motivoIndefinido, setMotivoIndefinido] = useState(true);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['picosQueda', { page, search, thresholdPercent, minPeakQuantity }],
    queryFn: async () => {
      return fetchLojaFisicaPicosQueda({
        page,
        limit: 50,
        thresholdPercent,
        minPeakQuantity,
        search
      });
    },
    keepPreviousData: true
  });

  const handleThresholdChange = (e) => {
    setPage(1);
    setThresholdPercent(Number(e.target.value) || 0);
  };

  const handleMinPeakChange = (e) => {
    setPage(1);
    setMinPeakQuantity(Number(e.target.value) || 0);
  };

  const handleSearch = useCallback((value) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSort = useCallback((field) => {
    setSortConfig(prevConfig => {
      if (prevConfig.field === field) {
        return {
          field,
          direction: prevConfig.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return {
        field,
        direction: field === 'totalVendas' ? 'desc' : 'asc'
      };
    });
  }, []);

  const items = data?.data || [];

  // Aplicar filtros avançados em memória
  const filtradosAvancados = items.filter((item) => {
    // Filtro mês de pico
    if (filtroMesPico) {
      const mesNome = item.mesPico?.mesNome || '';
      if (mesNome !== filtroMesPico) {
        return false;
      }
    }

    // Filtro estoque min/máx
    const estoqueAtual = parseFloat(item.estoqueAtual) || 0;
    if (estoqueMin !== '' && estoqueAtual < Number(estoqueMin)) {
      return false;
    }
    if (estoqueMax !== '' && estoqueAtual > Number(estoqueMax)) {
      return false;
    }

    // Filtro motivo provável
    const motivo = item.motivoPrincipal || 'indefinido';
    if (motivo === 'possivel_falta_estoque' && !motivoEstoque) {
      return false;
    }
    if (motivo === 'possivel_variacao_preco' && !motivoPreco) {
      return false;
    }
    if (motivo === 'indefinido' && !motivoIndefinido) {
      return false;
    }

    return true;
  });

  // Ordenação local similar ao E-commerce, mas usando campos da análise de picos
  const sortedItems = [...filtradosAvancados].sort((a, b) => {
    const { field, direction } = sortConfig;
    let aValue;
    let bValue;

    switch (field) {
      case 'codigoInterno':
        aValue = (a.codigoInterno || '').toString().toLowerCase();
        bValue = (b.codigoInterno || '').toString().toLowerCase();
        return direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      case 'descricao':
        aValue = (a.descricao || '').toString().toLowerCase();
        bValue = (b.descricao || '').toString().toLowerCase();
        return direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      case 'estoqueAtual':
        aValue = parseFloat(a.estoqueAtual) || 0;
        bValue = parseFloat(b.estoqueAtual) || 0;
        break;
      case 'mesPicoQuantidade':
        aValue = a.mesPico?.quantidade || 0;
        bValue = b.mesPico?.quantidade || 0;
        break;
      default:
        aValue = 0;
        bValue = 0;
    }

    return direction === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

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
        <h1 className={styles.title}>Picos de Vendas com Queda</h1>
        <div className={styles.placeholder} />
      </header>

      <div className={styles.content}>
        <div className={styles.filtersRow}>
          <SearchBar onSearch={handleSearch} placeholder="Buscar por código ou descrição" />

          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <label htmlFor="threshold">Queda máxima pós-pico (%)</label>
              <input
                id="threshold"
                type="number"
                min={1}
                max={100}
                value={thresholdPercent}
                onChange={handleThresholdChange}
              />
            </div>
            <div className={styles.filterGroup}>
              <label htmlFor="minPeak">Mínimo de unidades no pico</label>
              <input
                id="minPeak"
                type="number"
                min={1}
                value={minPeakQuantity}
                onChange={handleMinPeakChange}
              />
            </div>
            <div className={styles.filterGroup}>
              <label htmlFor="mesPico">Mês de pico</label>
              <select
                id="mesPico"
                value={filtroMesPico}
                onChange={(e) => setFiltroMesPico(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="Jan">Jan</option>
                <option value="Fev">Fev</option>
                <option value="Mar">Mar</option>
                <option value="Abr">Abr</option>
                <option value="Mai">Mai</option>
                <option value="Jun">Jun</option>
                <option value="Jul">Jul</option>
                <option value="Ago">Ago</option>
                <option value="Set">Set</option>
                <option value="Out">Out</option>
                <option value="Nov">Nov</option>
                <option value="Dez">Dez</option>
              </select>
            </div>
            <div className={styles.filterGroupInline}>
              <label>Estoque (mín/máx)</label>
              <div className={styles.estoqueRange}>
                <input
                  type="number"
                  placeholder="Mín"
                  value={estoqueMin}
                  onChange={(e) => setEstoqueMin(e.target.value)}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Máx"
                  value={estoqueMax}
                  onChange={(e) => setEstoqueMax(e.target.value)}
                />
              </div>
            </div>
            <div className={styles.filterGroupMotivo}>
              <label>Motivo provável</label>
              <div className={styles.motivoCheckboxes}>
                <label>
                  <input
                    type="checkbox"
                    checked={motivoEstoque}
                    onChange={(e) => setMotivoEstoque(e.target.checked)}
                  />
                  Estoque
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={motivoPreco}
                    onChange={(e) => setMotivoPreco(e.target.checked)}
                  />
                  Preço
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={motivoIndefinido}
                    onChange={(e) => setMotivoIndefinido(e.target.checked)}
                  />
                  Indefinido
                </label>
              </div>
            </div>
          </div>
        </div>

        {isLoading && <Loading />}

        {!isLoading && isError && (
          <div className={styles.error}>
            <p>Erro ao carregar análise: {error?.message || 'Erro desconhecido'}</p>
          </div>
        )}

        {!isLoading && !isError && sortedItems.length === 0 && (
          <EmptyState message="Nenhum produto encontrado com os critérios atuais." />
        )}

        {!isLoading && !isError && sortedItems.length > 0 && (
          <>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.sortable} onClick={() => handleSort('codigoInterno')}>
                      Código
                    </th>
                    <th className={styles.sortable} onClick={() => handleSort('descricao')}>
                      Descrição
                    </th>
                    <th className={styles.sortable} onClick={() => handleSort('mesPicoQuantidade')}>
                      Mês de Pico
                    </th>
                    <th>Meses após o Pico</th>
                    <th className={styles.sortable} onClick={() => handleSort('estoqueAtual')}>
                      Estoque
                    </th>
                    <th>Motivo Provável</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedItems.map((item) => (
                    <tr key={item.codigoInterno}>
                      <td>
                        <ImageTooltip src={item.imagemBase64} alt={item.descricao}>
                          <span className={styles.codigo}>{item.codigoInterno}</span>
                        </ImageTooltip>
                      </td>
                      <td>{item.descricao}</td>
                      <td>
                        {item.mesPico?.mesNome}/{item.mesPico?.ano}
                        <div className={styles.secondaryText}>
                          Pico: {item.mesPico?.quantidade} un
                        </div>
                      </td>
                      <td>
                        {item.mesesPosteriores.map((m) => (
                          <div key={`${m.ano}-${m.mesNumero}`} className={styles.secondaryText}>
                            {m.mesNome}/{m.ano}: {m.quantidade} un ({m.percentualEmRelacaoAoPico}% do pico)
                          </div>
                        ))}
                      </td>
                      <td>
                        {item.estoqueAtual}
                        <div className={styles.badgeRisco}>{item.riscoRuptura || '-'}</div>
                      </td>
                      <td>
                        <div className={styles.motivoContainer}>
                          <span
                            className={`${styles.badge} ${styles['badge-' + (item.motivoPrincipal || 'indefinido')]}`}
                          >
                            {item.motivoPrincipal === 'possivel_falta_estoque' && 'Falta de Estoque'}
                            {item.motivoPrincipal === 'possivel_variacao_preco' && 'Variação de Preço'}
                            {item.motivoPrincipal === 'multiplos_fatores' && 'Múltiplos Fatores'}
                            {item.motivoPrincipal === 'indefinido' && 'Indefinido'}
                          </span>
                          {item.motivos && item.motivos.length > 0 && (
                            <ul className={styles.motivosList}>
                              {item.motivos.map((motivo, index) => (
                                <li key={index}>{motivo}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </td>
                      <td>
                        <Link to={`/loja-fisica/${item.codigoInterno}`} className={styles.linkDetalhes}>
                          Ver detalhes
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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

export default PicosQueda;
