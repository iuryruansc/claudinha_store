const Sequelize = require('sequelize');
const connection = require('../database/database');
const Produto = require('./Produto');

const Estoque = connection.define('estoque', {
    id_estoque: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    quantidade_atual: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    localizacao: {
        type: Sequelize.STRING,
        allowNull: true
    }
}, {
    tableName: 'estoque',
    timestamps: true
});

Estoque.sync({ force: false })
    .then(() => {
        console.log("Tabela Estoque criada ou já existe.");
    })
    .catch((error) => {
        console.error("Erro ao criar a tabela Estoque:", error);
    });

Estoque.belongsTo(Produto, { foreignKey: 'id_produto' });
Produto.hasMany(Estoque, { foreignKey: 'id_produto' });

module.exports = Estoque;