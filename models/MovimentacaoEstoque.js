const Sequelize = require('sequelize');
const connection = require('../database/database');

const MovimentacaoEstoque = connection.define('movimentacaoestoque', {
    id_movimentacao: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_estoque: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    id_venda: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: 'venda',
            key: 'id_venda'
        }
    },
    data_hora: {
        type: Sequelize.DATE,
        allowNull: false
    },
    tipo: {
        type: Sequelize.STRING,
        allowNull: false
    },
    quantidade: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    id_funcionario: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    observacao: {
        type: Sequelize.TEXT,
        allowNull: true
    }
}, {
    tableName: 'movimentacaoestoque',
    timestamps: true
});

MovimentacaoEstoque.sync({ force: false })
    .then(() => {
        console.log("Tabela MovimentacaoEstoque criada ou já existe.");
    })
    .catch((error) => {
        console.error("Erro ao criar a tabela MovimentacaoEstoque:", error);
    });

module.exports = MovimentacaoEstoque;
