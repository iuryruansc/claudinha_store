const Sequelize = require('sequelize');
const connection = require('../database/database');
const Produto = require('./produto');

const Estoque = connection.define('estoque', {
    id_estoque: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_produto: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    quantidade_atual: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    localizacao: {
        type: Sequelize.STRING,
        allowNull: false
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