const Sequelize = require('sequelize');
const connection = require('../database/database');

const Fornecedor = connection.define('fornecedores', {
  id_fornecedor: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome_fornecedor: {
    type: Sequelize.STRING,
    allowNull: false
  }
}, {
    tableName: 'fornecedores',
    timestamps: true
});

module.exports = Fornecedor;
