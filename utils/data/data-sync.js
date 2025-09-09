const sequelize = require('../../database/database');
require('../../models/associations');

async function syncDatabase(force = false) {
  try {
    await sequelize.sync({ force });
    console.log('All tables synchronized!');
  } catch (err) {
    console.error('Error synchronizing tables:', err);
  }
}

module.exports = syncDatabase;