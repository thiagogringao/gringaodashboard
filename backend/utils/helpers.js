/**
 * Calcula a margem de lucro em porcentagem
 * Fórmula: ((Preço Venda - Preço Custo) / Preço Venda) × 100
 * @param {number} precoVenda - Preço de venda do produto
 * @param {number} precoCusto - Preço de custo do produto
 * @returns {number} Margem de lucro em porcentagem
 */
const calcularMargem = (precoVenda, precoCusto) => {
  if (!precoVenda || precoVenda === 0) return 0;
  if (!precoCusto || precoCusto === 0) return 0;
  return parseFloat(((precoVenda - precoCusto) / precoVenda * 100).toFixed(2));
};

/**
 * Formata um valor monetário para o padrão brasileiro
 * @param {number} valor - Valor a ser formatado
 * @returns {string} Valor formatado em BRL
 */
const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

/**
 * Sanitiza string de busca para prevenir SQL injection
 * @param {string} str - String a ser sanitizada
 * @returns {string} String sanitizada
 */
const sanitizeSearchString = (str) => {
  if (!str) return '';
  // Remove caracteres especiais perigosos, mas mantém espaços e caracteres acentuados
  return str.replace(/[;'"\\]/g, '').trim();
};

/**
 * Valida se uma URL de imagem é válida
 * @param {string} url - URL a ser validada
 * @returns {boolean} True se a URL é válida
 */
const validarImagemURL = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

module.exports = {
  calcularMargem,
  formatarMoeda,
  sanitizeSearchString,
  validarImagemURL
};
