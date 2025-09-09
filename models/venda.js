const Sequelize = require('sequelize');
const connection = require('../database/database');

const Venda = connection.define('venda', {
    id_venda: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    data_hora: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW
    },
    id_cliente: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    id_funcionario: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    id_caixa: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    valor_total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
    },
    status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'PENDENTE'
    }
}, {
    tableName: 'venda',
    timestamps: true
});

module.exports = Venda;
