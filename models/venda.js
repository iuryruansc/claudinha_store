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
        allowNull: true,
    },
    id_caixa: {
        type: Sequelize.INTEGER,
        allowNull: false,
    }
}, {
    tableName: 'venda',
    timestamps: true
});

Venda.sync({ force: false })
    .then(() => {
        console.log("Tabela Venda criada ou já existe.");
    })
    .catch((error) => {
        console.error("Erro ao criar a tabela Venda:", error);
    });

module.exports = Venda;
