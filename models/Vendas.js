const Sequelize = require('sequelize');
const connection = require('../database/database');
const Clientes = require('./Clientes');
const Funcionarios = require('./Funcionarios');
const Caixa = require('./Caixa');

const Vendas = connection.define('venda', {
    id_venda: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    data_hora: {
        type: Sequelize.DATE,
        allowNull: true,
    },
    id_cliente: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    id_funcionario: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    id_caixa: {
        type: Sequelize.INTEGER,
        allowNull: true,
    }
}, {
    tableName: 'venda',
    timestamps: true
});

Vendas.sync({ force: false })
    .then(() => {
        console.log("Tabela Venda criada ou já existe.");
    })
    .catch((error) => {
        console.error("Erro ao criar a tabela Venda:", error);
    });

Vendas.belongsTo(Clientes, { foreignKey: 'id_cliente' });
Vendas.belongsTo(Funcionarios, { foreignKey: 'id_funcionario' });
Vendas.belongsTo(Caixa, { foreignKey: 'id_caixa' });
Clientes.hasMany(Vendas, { foreignKey: 'id_cliente' });
Funcionarios.hasMany(Vendas, { foreignKey: 'id_funcionario' });
Caixa.hasMany(Vendas, { foreignKey: 'id_caixa' });

module.exports = Vendas;