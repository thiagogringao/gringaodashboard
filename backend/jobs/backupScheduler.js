const cron = require('node-cron');
const backupService = require('../services/backupService');

/**
 * Agendador de backups incrementais
 */
class BackupScheduler {
  constructor() {
    this.jobs = [];
  }

  /**
   * Inicializar agendamentos
   */
  start() {
    console.log('Iniciando agendador de backups...');

    // Backup incremental diário às 3h da manhã
    const incrementalJob = cron.schedule('0 3 * * *', async () => {
      console.log('Executando backup incremental diário...');
      try {
        await backupService.runFullBackup();
      } catch (error) {
        console.error('Erro no backup incremental diário:', error);
      }
    }, {
      scheduled: false
    });

    this.jobs.push(incrementalJob);

    // Iniciar job
    incrementalJob.start();

    console.log('Agendador de backups iniciado:');
    console.log('  - Backup incremental: Diariamente às 3h da manhã');
  }

  /**
   * Parar todos os agendamentos
   */
  stop() {
    this.jobs.forEach(job => job.stop());
    console.log('Agendador de backups parado');
  }
}

module.exports = new BackupScheduler();

