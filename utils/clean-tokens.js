const cron = require('node-cron');
const UserMeta = require('../models/userMeta');
const { Op } = require('sequelize');

function startTokenCleanup() {
    cron.schedule('0 * * * *', async () => {
        try {
            await UserMeta.destroy({
                where: {
                    expiresAt: { [Op.lt]: Date.now() }
                }
            });
            console.log('🧹 Expired password reset tokens cleaned up');
        } catch (err) {
            console.error('Cron cleanup error:', err);
        }
    });
}

module.exports = startTokenCleanup;
