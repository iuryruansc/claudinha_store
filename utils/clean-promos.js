const cron = require('node-cron');
const ca = require('../models/desconto');
const { Op } = require('sequelize');

function startPromoCleanup() {
  cron.schedule('0 0 * * *', async () => {
    try {
      const deletedCount = await ca.destroy({
        where: {
          data_fim: { [Op.lt]: new Date() }
        }
      });
      if (deletedCount > 0) {
        console.log(`[CRON] Limpeza de promoções concluída. ${deletedCount} promoções expiradas foram removidas.`);
      } else {
        console.log('[CRON] Nenhuma promoção expirada para limpar.');
      }
    } catch (err) {
      console.error('Erro ao limpar cações expiradas:', err);
    }
  });
}

module.exports = startPromoCleanup;
