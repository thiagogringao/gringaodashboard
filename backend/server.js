const express = require('express');
const cors = require('cors');
require('dotenv').config();

const produtosRoutes = require('./routes/produtos');
const authRoutes = require('./routes/auth');
const backupRoutes = require('./routes/backup');
const filtrosRoutes = require('./routes/filtros');
const errorHandler = require('./middleware/errorHandler');
const backupScheduler = require('./jobs/backupScheduler');
const backupService = require('./services/backupService');

// Inicializar banco de dados de autenticação
require('./config/authDatabase');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Permitir requisições sem origin (como Postman) ou de localhost/127.0.0.1
    if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      callback(null, true);
    } else {
      callback(null, origin); // Permitir qualquer origem em desenvolvimento
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Log de requisições para debug
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/filtros', filtrosRoutes);

// Rota para executar backup manual
app.post('/api/backup/run', async (req, res) => {
  try {
    const result = await backupService.runFullBackup();
    res.json({
      success: true,
      message: 'Backup executado com sucesso',
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao executar backup',
      error: error.message
    });
  }
});

// Rota para status do backup
app.get('/api/backup/status', async (req, res) => {
  try {
    const lastSync = await backupService.getLastSync();
    res.json({
      success: true,
      lastSync
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao obter status do backup',
      error: error.message
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor rodando' });
});

// Middleware de erro (deve ser o último)
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`\n========================================`);
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`========================================\n`);
  
  // Inicializar backup service
  await backupService.initialize();
  
  // Executar backup incremental no primeiro acesso (SEMPRE)
  console.log('🔄 Verificando necessidade de backup...');
  try {
    const needsBackup = await backupService.needsBackup();
    
    if (needsBackup) {
      console.log('📦 Cache SQLite precisa ser atualizado');
      console.log('⚠️ Execute: npm run backup (ou use fix-backend.bat)');
      console.log('⚠️ Aplicação continuará, mas pode ter dados desatualizados\n');
    } else {
      console.log('✅ Cache SQLite atualizado, backup não necessário\n');
    }
  } catch (error) {
    console.error('⚠️ Erro ao verificar cache:', error.message);
    console.log('⚠️ Execute o backup manualmente se necessário\n');
  }
  
  // Iniciar agendador de backups
  if (process.env.ENABLE_BACKUP_SCHEDULER !== 'false') {
    backupScheduler.start();
  }
});
