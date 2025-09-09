const Sequelize = require('sequelize');
const connection = require('../database/database');

const Produto = connection.define('produto', {
    id_produto: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: Sequelize.STRING,
        allowNull: false
    },
    preco: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    descricao: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    id_categoria: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    codigo_barras: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    }
}, {
    tableName: 'produto',
    timestamps: true
});

module.exports = Produto;
