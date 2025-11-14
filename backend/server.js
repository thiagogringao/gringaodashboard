const express = require('express');
const cors = require('cors');
require('dotenv').config();

const produtosRoutes = require('./routes/produtos');
const authRoutes = require('./routes/auth');
const backupRoutes = require('./routes/backup');
const errorHandler = require('./middleware/errorHandler');
const backupScheduler = require('./jobs/backupScheduler');
const backupService = require('./services/backupService');

// Inicializar banco de dados de autenticação
require('./config/authDatabase');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
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
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor rodando' });
});

// Middleware de erro (deve ser o último)
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
  
  // Inicializar backup service
  await backupService.initialize();
  
  // Executar backup inicial
  if (process.env.RUN_INITIAL_BACKUP === 'true') {
    console.log('Executando backup inicial...');
    await backupService.runFullBackup();
  }
  
  // Iniciar agendador de backups
  if (process.env.ENABLE_BACKUP_SCHEDULER !== 'false') {
    backupScheduler.start();
  }
});
