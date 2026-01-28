const Sequelize = require('sequelize');
const connection = require('../database/database');

const ItemVenda = connection.define('itemvenda', {
    id_item: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_venda: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    id_lote: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    id_produto: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'produto',
            key: 'id_produto'
        }
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
    tableName: 'itemvenda',
    timestamps: false
});

module.exports = ItemVenda;
