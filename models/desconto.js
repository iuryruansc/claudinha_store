const Sequelize = require('sequelize');
const connection = require('../database/database');

const Desconto = connection.define('desconto', {
    id_desconto: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_lote: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    tipo: {
        type: Sequelize.ENUM('porcentagem', 'valor_fixo'),
        allowNull: false
    },
    valor: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
    },
    data_inicio: {
        type: Sequelize.DATE,
        allowNull: false
    },
    data_fim: {
        type: Sequelize.DATE,
        allowNull: false
    },
    ativo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
    },
    observacao: {
        type: Sequelize.TEXT,
        allowNull: true
    }
}, {
    tableName: 'descontos',
    timestamps: true
});

module.exports = Desconto;
