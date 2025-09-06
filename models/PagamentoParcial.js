const Sequelize = require('sequelize');
const connection = require('../database/database');

const PagamentoParcial = connection.define('pagamentoparcial', {
    id_pagamento_parcial: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_venda: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    data_pagamento: {
        type: Sequelize.DATE,
        allowNull: false
    },
    valor_pago: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
    },
    forma_pagamento: {
        type: Sequelize.STRING,
        allowNull: false
    },
    observacao: {
        type: Sequelize.STRING,
        allowNull: true
    }
}, {
    tableName: 'pagamentoparcial',
    timestamps: true
});

PagamentoParcial.sync({ force: false })
    .then(() => {
        console.log("Tabela pagamentoparcial criada ou já existe.");
    })
    .catch((error) => {
        console.error("Erro ao criar a tabela pagamentoparcial:", error);
    });

module.exports = PagamentoParcial;
