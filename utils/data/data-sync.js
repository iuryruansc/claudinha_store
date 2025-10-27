const sequelize = require('../../database/database');
require('../../models/Associations');

async function syncDatabase(force = false) {
  try {
    await sequelize.sync({ force });
    console.log('All tables synchronized!');
  } catch (err) {
    console.error('Error synchronizing tables:', err);
  }
}

module.exports = syncDatabase;