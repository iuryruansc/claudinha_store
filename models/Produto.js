const Sequelize = require('sequelize');
const connection = require('../database/database');
const Category = require('./category');

const Produto = connection.define('produto', {
    id_produto: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: Sequelize.STRING,
        allowNull: false
    },
    preco: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    descricao: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    id_categoria: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    codigo_barras: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    }
}, {
    tableName: 'produto',
    timestamps: true
});

Produto.sync({ force: false })
    .then(() => {
        console.log("Tabela Produto criada ou já existe.");
    })
    .catch((error) => {
        console.error("Erro ao criar a tabela Produto:", error);
    });

Produto.belongsTo(Category, { foreignKey: 'id_categoria' });
Category.hasMany(Produto, { foreignKey: 'id_categoria' });

module.exports = Produto;
