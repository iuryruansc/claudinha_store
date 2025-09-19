const Sequelize = require('sequelize');
const connection = require('../database/database');

const Marca = connection.define('marcas', {
  id_marca: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome_marca: {
    type: Sequelize.STRING,
    allowNull: false
  }
}, {
    tableName: 'marcas',
    timestamps: true
});

module.exports = Marca;
