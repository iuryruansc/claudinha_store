const Sequelize = require('sequelize');
const connection = require('../database/database');

const Caixa = connection.define('caixa', {
    id_caixa: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_pdv: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    id_funcionario: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    data_abertura: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW
    },
    data_fechamento: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
    },
    saldo_inicial: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
    },
    saldo_final: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
    },
    status: {
        type: Sequelize.ENUM('aberto', 'fechado'),
        allowNull: false,
    }
}, {
    tableName: 'caixa',
    timestamps: true
});

module.exports = Caixa;
