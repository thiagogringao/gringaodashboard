/**
 * Formata um valor monetário para o padrão brasileiro
 * @param {number} valor - Valor a ser formatado
 * @returns {string} Valor formatado em BRL
 */
export const formatarMoeda = (valor) => {
  if (typeof valor !== 'number' || isNaN(valor)) {
    return 'R$ 0,00';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

/**
 * Formata um número para porcentagem
 * @param {number} valor - Valor a ser formatado
 * @param {number} decimals - Número de casas decimais (padrão: 2)
 * @returns {string} Valor formatado como porcentagem
 */
export const formatarPorcentagem = (valor, decimals = 2) => {
  if (typeof valor !== 'number' || isNaN(valor)) {
    return '0%';
  }

  return `${valor.toFixed(decimals)}%`;
};

/**
 * Formata um código de barras para exibição
 * @param {string} codigo - Código de barras
 * @returns {string} Código formatado
 */
export const formatarCodigoBarras = (codigo) => {
  if (!codigo) return '';

  // Adiciona espaços a cada 3 dígitos para melhor legibilidade
  return codigo.replace(/(\d{3})(?=\d)/g, '$1 ');
};

/**
 * Valida se uma URL de imagem é válida
 * @param {string} url - URL a ser validada
 * @returns {boolean} True se a URL é válida
 */
export const validarImagemURL = (url) => {
  if (!url) return false;

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Trunca um texto se exceder o limite de caracteres
 * @param {string} texto - Texto a ser truncado
 * @param {number} limite - Limite de caracteres
 * @returns {string} Texto truncado
 */
export const truncarTexto = (texto, limite = 50) => {
  if (!texto) return '';
  if (texto.length <= limite) return texto;

  return texto.substring(0, limite) + '...';
};
