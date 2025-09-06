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
        references: {
            model: 'venda',
            key: 'id_venda'
        }
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
    }
}, {
    tableName: 'itemvenda',
    timestamps: false
});

ItemVenda.sync({ force: false })
    .then(() => {
        console.log("Tabela ItemVenda criada ou já existe.");
    })
    .catch((error) => {
        console.error("Erro ao criar a tabela ItemVenda:", error);
    });

module.exports = ItemVenda;
