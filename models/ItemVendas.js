const Sequelize = require('sequelize');
const connection = require('../database/database');
const Vendas = require('./vendas');
const Produto = require('./produto');

const ItemVendas = connection.define('itemvenda', {
    id_item: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_venda: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    id_produto: {
        type: Sequelize.INTEGER,
        allowNull: true
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
    timestamps: true
});

ItemVendas.sync({ force: false })
    .then(() => {
        console.log("Tabela ItemVenda criada ou já existe.");
    })
    .catch((error) => {
        console.error("Erro ao criar a tabela ItemVenda:", error);
    });

ItemVendas.belongsTo(Vendas, { foreignKey: 'id_venda' });
ItemVendas.belongsTo(Produto, { foreignKey: 'id_produto' });
Vendas.hasMany(ItemVendas, { foreignKey: 'id_venda' });
Produto.hasMany(ItemVendas, { foreignKey: 'id_produto' });

module.exports = ItemVendas;