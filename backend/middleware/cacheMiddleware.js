const NodeCache = require('node-cache');

// Cache em memória com TTL de 5 minutos
const cache = new NodeCache({ 
  stdTTL: 300, // 5 minutos
  checkperiod: 60, // Verificar expiração a cada 60 segundos
  useClones: false // Não clonar objetos (melhor performance)
});

/**
 * Middleware de cache HTTP
 * Armazena respostas em memória e retorna instantaneamente
 */
const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // Só cachear GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Criar chave única baseada na URL completa
    const key = `__express__${req.originalUrl || req.url}`;
    
    // Tentar buscar do cache
    const cachedResponse = cache.get(key);
    
    if (cachedResponse) {
      console.log(`[Cache] ✅ HIT: ${key}`);
      
      // Adicionar headers de cache
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Cache-Control', `public, max-age=${duration}`);
      
      // Retornar resposta cacheada
      return res.json(cachedResponse);
    }

    console.log(`[Cache] ❌ MISS: ${key}`);
    res.setHeader('X-Cache', 'MISS');

    // Interceptar o método json() para cachear a resposta
    const originalJson = res.json.bind(res);
    
    res.json = (body) => {
      // Só cachear respostas de sucesso
      if (res.statusCode === 200 && body.success) {
        cache.set(key, body, duration);
        console.log(`[Cache] 💾 Salvando: ${key} (TTL: ${duration}s)`);
      }
      
      // Adicionar headers de cache
      res.setHeader('Cache-Control', `public, max-age=${duration}`);
      res.setHeader('ETag', `W/"${Date.now()}"`);
      
      return originalJson(body);
    };

    next();
  };
};

/**
 * Limpar cache manualmente
 */
const clearCache = (pattern) => {
  if (pattern) {
    const keys = cache.keys();
    const keysToDelete = keys.filter(key => key.includes(pattern));
    keysToDelete.forEach(key => cache.del(key));
    console.log(`[Cache] 🗑️ Limpou ${keysToDelete.length} entradas com padrão: ${pattern}`);
  } else {
    cache.flushAll();
    console.log('[Cache] 🗑️ Cache completamente limpo');
  }
};

/**
 * Estatísticas do cache
 */
const getCacheStats = () => {
  return {
    keys: cache.keys().length,
    hits: cache.getStats().hits,
    misses: cache.getStats().misses,
    ksize: cache.getStats().ksize,
    vsize: cache.getStats().vsize
  };
};

module.exports = {
  cacheMiddleware,
  clearCache,
  getCacheStats,
  cache
};

