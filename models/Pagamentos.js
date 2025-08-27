const Sequelize = require('sequelize');
const connection = require('../database/database');
const Vendas = require('./Vendas');

const Pagamentos = connection.define('pagamento', {
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

Pagamentos.sync({ force: false })
    .then(() => {
        console.log("Tabela Pagamento criada ou já existe.");
    })
    .catch((error) => {
        console.error("Erro ao criar a tabela Pagamento:", error);
    });

Pagamentos.belongsTo(Vendas, { foreignKey: 'id_venda' });
Vendas.hasMany(Pagamentos, { foreignKey: 'id_venda' });

module.exports = Pagamentos;