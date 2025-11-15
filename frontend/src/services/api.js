import axios from 'axios';

// Usar URL relativa quando em desenvolvimento (com proxy do Vite)
// ou URL absoluta quando VITE_API_URL estiver definida
const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Aumentado para 30 segundos para queries mais complexas
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erro na requisição API:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      request: error.request,
      config: {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        method: error.config?.method
      }
    });
    
    if (error.response) {
      // Servidor respondeu com status de erro
      throw new Error(error.response.data.message || 'Erro ao processar requisição');
    } else if (error.request) {
      // Requisição foi feita mas não houve resposta
      throw new Error('Servidor não está respondendo. Verifique se o backend está rodando.');
    } else {
      // Erro ao configurar a requisição
      throw new Error('Erro ao fazer requisição: ' + error.message);
    }
  }
);

// Funções de API

export const fetchEcommerceProdutos = async ({ page = 1, search = '', limit = 100 }) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    situacao: 'ativo'
  });

  if (search) {
    params.append('search', search);
  }

  try {
    const response = await api.get(`/api/produtos/ecommerce?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar produtos e-commerce:', error);
    throw error;
  }
};

export const fetchLojaFisicaProdutos = async ({ page = 1, search = '', fornecedor = '', categoria = '', limit = 100 }) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });

  if (search) {
    params.append('search', search);
  }

  if (fornecedor) {
    params.append('fornecedor', fornecedor);
  }

  if (categoria) {
    params.append('categoria', categoria);
  }

  try {
    const response = await api.get(`/api/produtos/loja-fisica?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar produtos loja física:', error);
    throw error;
  }
};

export const fetchProdutoDetalhe = async (tipo, codigo) => {
  const response = await api.get(`/api/produtos/${tipo}/${codigo}`);
  return response.data;
};

export const fetchLojaFisicaPicosQueda = async ({ page = 1, limit = 50, thresholdPercent = 30, minPeakQuantity = 30 }) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    thresholdPercent: thresholdPercent.toString(),
    minPeakQuantity: minPeakQuantity.toString()
  });

  const response = await api.get(`/api/produtos/loja-fisica/picos-queda?${params.toString()}`);
  return response.data;
};

export const fetchLojaFisicaAbaixoEstoqueIdeal = async ({ page = 1, limit = 100, search = '' }) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });

  if (search) {
    params.append('search', search);
  }

  const response = await api.get(`/api/produtos/loja-fisica/abaixo-estoque-ideal?${params.toString()}`);
  return response.data;
};

// Buscar lista de fornecedores
export const fetchFornecedores = async () => {
  try {
    const response = await api.get('/api/filtros/fornecedores');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar fornecedores:', error);
    throw error;
  }
};

// Buscar lista de categorias
export const fetchCategorias = async () => {
  try {
    const response = await api.get('/api/filtros/categorias');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    throw error;
  }
};

// Buscar métricas da loja física
export const fetchLojaFisicaMetrics = async () => {
  try {
    const response = await api.get('/api/produtos/loja-fisica/metrics');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    throw error;
  }
};

// Buscar detalhes das métricas (produtos específicos)
export const fetchLojaFisicaMetricsDetails = async (type) => {
  try {
    const response = await api.get(`/api/produtos/loja-fisica/metrics/${type}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar detalhes das métricas:', error);
    throw error;
  }
};

export default api;
