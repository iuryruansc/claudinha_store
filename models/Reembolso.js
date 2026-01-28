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
    valor_reembolso: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    motivo: {
        type: Sequelize.STRING,
        allowNull: true
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