const sequelize = require('sequelize');

const connection = new sequelize.Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'mysql', // or 'postgres', 'sqlite', 'mariadb', 'mssql'
    timezone: '-03:00', // Adjust the timezone as needed
});

module.exports = connection;
