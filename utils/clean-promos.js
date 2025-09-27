const cron = require('node-cron');
const ca = require('../models/desconto');
const { Op } = require('sequelize');

function startcaCleanup() {
  cron.schedule('0 0 * * *', async () => {
    try {
      const deletedCount = await ca.destroy({
        where: {
          data_fim: { [Op.lt]: new Date() }
        }
      });
      console.log(`🧹 ${deletedCount} cações expiradas removidas`);
    } catch (err) {
      console.error('Erro ao limpar cações expiradas:', err);
    }
  });
}

module.exports = startcaCleanup;
