const Sequelize = require('sequelize');
const connection = require('../database/database');

const Reembolso = connection.define('reembolsos', {
    id_reembolso: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_venda: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    id_funcionario: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    valor_total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
    },
    motivo: {
        type: Sequelize.STRING(500),
        allowNull: true
    },
    tipo: {
        type: Sequelize.ENUM('PARCIAL', 'TOTAL'),
        allowNull: false,
        defaultValue: 'PARCIAL'
    },
    status: {
        type: Sequelize.ENUM('PROCESSANDO', 'CONCLUIDO', 'CANCELADO'),
        allowNull: false,
        defaultValue: 'PROCESSANDO'
    },
    data_reembolso: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    }
}, {
    tableName: 'reembolsos',
    timestamps: true
});

module.exports = Reembolso;