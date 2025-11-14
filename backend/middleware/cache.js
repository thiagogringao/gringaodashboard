const redisClient = require('../config/redis');

/**
 * Middleware de cache Redis
 * @param {number} ttl - Tempo de vida do cache em segundos (padrão: 300 = 5 minutos)
 * @returns {Function} Middleware do Express
 */
const cacheMiddleware = (ttl = 300) => {
  return async (req, res, next) => {
    // Apenas cache para requisições GET
    if (req.method !== 'GET') {
      return next();
    }

    // Verificar se Redis está disponível
    try {
      if (!redisClient.isReady && !redisClient.isOpen) {
        return next();
      }
    } catch (error) {
      // Se houver erro ao verificar, continuar sem cache
      return next();
    }

    // Criar chave de cache baseada na URL e query params
    const cacheKey = `cache:${req.originalUrl || req.url}`;

    try {
      // Tentar obter do cache
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        console.log(`Cache HIT: ${cacheKey}`);
        const data = JSON.parse(cachedData);
        return res.json(data);
      }

      // Se não encontrou no cache, interceptar a resposta
      console.log(`Cache MISS: ${cacheKey}`);
      const originalJson = res.json.bind(res);

      res.json = function (data) {
        // Salvar no cache apenas se a resposta for bem-sucedida
        if (res.statusCode === 200 && data) {
          redisClient.setEx(cacheKey, ttl, JSON.stringify(data))
            .catch((err) => {
              console.error('Erro ao salvar no cache:', err);
            });
        }
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Erro no middleware de cache:', error);
      // Em caso de erro, continuar sem cache
      next();
    }
  };
};

/**
 * Invalidar cache por padrão
 * @param {string} pattern - Padrão para invalidar (ex: 'cache:/api/produtos/*')
 */
const invalidateCache = async (pattern) => {
  try {
    if (!redisClient.isReady && !redisClient.isOpen) {
      return;
    }

    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`Cache invalidado: ${keys.length} chaves removidas`);
    }
  } catch (error) {
    console.error('Erro ao invalidar cache:', error);
  }
};

/**
 * Limpar todo o cache
 */
const clearAllCache = async () => {
  try {
    if (!redisClient.isReady && !redisClient.isOpen) {
      return;
    }

    await redisClient.flushAll();
    console.log('Todo o cache foi limpo');
  } catch (error) {
    console.error('Erro ao limpar cache:', error);
  }
};

module.exports = {
  cacheMiddleware,
  invalidateCache,
  clearAllCache
};

