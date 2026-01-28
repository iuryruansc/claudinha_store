const sequelize = require('../../database/database');
require('../../models/Associations');

async function syncDatabase(alter = false) {
  try {
    await sequelize.sync({ alter });
    console.log('All tables synchronized!');
  } catch (err) {
    console.error('Error synchronizing tables:', err);
  }
}

module.exports = syncDatabase;