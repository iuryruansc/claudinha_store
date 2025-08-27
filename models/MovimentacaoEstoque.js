const Sequelize = require('sequelize');
const connection = require('../database/database');
const Estoque = require('./Estoque');
const Funcionario = require('./Funcionarios');

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


MovimentacaoEstoque.belongsTo(Estoque, { foreignKey: 'id_estoque' });
MovimentacaoEstoque.belongsTo(Funcionario, { foreignKey: 'id_funcionario' });
Estoque.hasMany(MovimentacaoEstoque, { foreignKey: 'id_estoque' });
Funcionario.hasMany(MovimentacaoEstoque, { foreignKey: 'id_funcionario' });

module.exports = MovimentacaoEstoque;