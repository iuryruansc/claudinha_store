const fs = require('fs');
const path = require('path');
const mysqldump = require('mysqldump');
const cron = require('node-cron');

const BACKUP_DIR = path.join(__dirname, '..', '..', 'backups');

function ensureDir() {
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
}

async function createBackup() {
    ensureDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.sql`;
    const filepath = path.join(BACKUP_DIR, filename);

    try {
        await mysqldump({
            connection: {
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASS,
                database: process.env.DB_NAME,
            },
            dumpToFile: filepath,
        });
        console.log(`Backup criado: ${filepath}`);
    } catch (err) {
        console.error('Erro ao criar backup:', err);
    }
}

function start() {
    // Agendado para rodar todo dia às 02:00 (hora de São Paulo)
    cron.schedule('0 2 * * *', () => {
        console.log('Agendador: iniciando backup diário...');
        createBackup();
    }, { timezone: 'America/Sao_Paulo' });

    console.log('Backup scheduler iniciado (daily at 02:00).');
}

module.exports = { start, createBackup };
