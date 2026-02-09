(async () => {
    try {
        const { createBackup } = require('../services/backup/backupService');
        await createBackup();
        console.log('Backup manual concluído.');
    } catch (e) {
        console.error('Erro no backup manual:', e);
        process.exit(1);
    }
})();