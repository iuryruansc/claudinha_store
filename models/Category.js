const Sequelize = require('sequelize');
const connection = require('../database/database');

const Category = connection.define('categoria', {
  id_categoria: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: Sequelize.STRING,
    allowNull: false
  }
}, {
    tableName: 'categoria',
    timestamps: true
});

module.exports = Category;
