const Sequelize = require('sequelize');
const connection = require('../database/database');

const Lote = connection.define('lote', {
    id_lote: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_produto: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    //inclusoes do novo campo
    preco_compra:{
        type: Sequelize.FLOAT,
        allowNull: false
    },
    //altracão do campo existente
    preco_venda: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    numero_lote: {
        type: Sequelize.STRING,
        allowNull: false
    },
    quantidade: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    data_validade: {
        type: Sequelize.DATE,
        allowNull: false
    },
    localizacao: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    tableName: 'lote',
    timestamps: true
});

module.exports = Lote;
