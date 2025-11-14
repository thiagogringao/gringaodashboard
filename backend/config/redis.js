const redis = require('redis');
require('dotenv').config();

// Configuração do Redis (v4 API)
const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('Redis: Máximo de tentativas de reconexão atingido');
        return new Error('Máximo de tentativas de reconexão atingido');
      }
      return Math.min(retries * 100, 3000);
    }
  },
  password: process.env.REDIS_PASSWORD || undefined
});

// Tratamento de erros
redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Redis: Conectando...');
});

redisClient.on('ready', () => {
  console.log('Redis: Cliente pronto para uso');
});

redisClient.on('reconnecting', () => {
  console.log('Redis: Reconectando...');
});

// Conectar ao Redis
redisClient.connect().catch((err) => {
  console.error('Redis: Erro ao conectar:', err);
  console.warn('Redis: Aplicação continuará sem cache');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  if (redisClient.isOpen) {
    await redisClient.quit();
    console.log('Redis: Conexão fechada');
  }
});

module.exports = redisClient;

