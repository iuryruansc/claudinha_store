const Sequelize = require('sequelize');
const connection = require('../database/database');

const ParcelaPagamento = connection.define('parcelapagamento', {
    id_parcelapagamento: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_pagamento: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    numero_parcela: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    valor_parcela: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
    },
    data_vencimento: {
        type: Sequelize.DATE,
        allowNull: false
    },
    data_pagamento: {
        type: Sequelize.DATE,
        allowNull: true
    },
    status: {
        type: Sequelize.ENUM('pendente', 'pago', 'atrasado'),
        allowNull: false
    }
}, {
    tableName: 'parcelapagamento',
    timestamps: true
});

ParcelaPagamento.sync({ force: false })
    .then(() => {
        console.log("Tabela ParcelaPagamento criada ou já existe.");
    })
    .catch((error) => {
        console.error("Erro ao criar a tabela ParcelaPagamento:", error);
    });

module.exports = ParcelaPagamento;
