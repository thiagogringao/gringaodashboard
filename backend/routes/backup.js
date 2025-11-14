const express = require('express');
const router = express.Router();
const sqliteBackupService = require('../services/sqliteBackupService');

// POST /api/backup/full - Executar backup completo
router.post('/full', async (req, res) => {
  try {
    console.log('🔄 Iniciando backup completo via API...');
    const result = await sqliteBackupService.backupFullLojaFisica();
    
    res.json({
      success: true,
      message: 'Backup completo executado com sucesso',
      ...result
    });
  } catch (error) {
    console.error('❌ Erro no backup:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao executar backup',
      error: error.message
    });
  }
});

// GET /api/backup/stats - Obter estatísticas do backup
router.get('/stats', (req, res) => {
  try {
    const stats = sqliteBackupService.getBackupStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Erro ao obter stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter estatísticas',
      error: error.message
    });
  }
});

module.exports = router;
