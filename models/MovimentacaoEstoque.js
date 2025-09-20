const Sequelize = require('sequelize');
const connection = require('../database/database');

const MovimentacaoEstoque = connection.define('movimentacaoestoque', {
    id_movimentacao: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_lote: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    id_venda: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    data_hora: {
        type: Sequelize.DATE,
        allowNull: false
    },
    tipo: {
        type: Sequelize.STRING,
        allowNull: false
    },
    quantidade: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    id_funcionario: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    observacao: {
        type: Sequelize.TEXT,
        allowNull: true
    }
}, {
    tableName: 'movimentacaoestoque',
    timestamps: true
});

module.exports = MovimentacaoEstoque;
