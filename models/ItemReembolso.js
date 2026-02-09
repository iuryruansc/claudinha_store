const Sequelize = require('sequelize');
const connection = require('../database/database');

const ItemReembolso = connection.define('itemreembolsos', {
    id_item_reembolso: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_reembolso: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    id_item_venda: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    id_produto: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    id_lote: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    quantidade: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    preco_unitario: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
    },
    desconto_tipo: {
        type: Sequelize.ENUM('none', 'porcentagem', 'valor_fixo'),
        allowNull: true,
        defaultValue: 'none'
    },
    desconto_valor: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0
    }
}, {
    tableName: 'itemreembolsos',
    timestamps: false
});

module.exports = ItemReembolso;
