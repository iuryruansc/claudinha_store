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

Category.sync({ force: false })
  .then(() => {
    console.log("Tabela Categoria criada ou já existe.");
  })
  .catch((error) => {
    console.error("Erro ao criar a tabela Categoria:", error);
  });

module.exports = Category;
