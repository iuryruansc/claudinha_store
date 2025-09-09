const Sequelize = require('sequelize');
const connection = require('../database/database');

const Pagamento = connection.define('pagamento', {
    id_pagamento: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_venda: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    forma_pagamento: {
        type: Sequelize.ENUM('dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'outro'),
        allowNull: false
    },
    valor_total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
    },
    parcelas: {
        type: Sequelize.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'pagamento',
    timestamps: true
});

module.exports = Pagamento;
