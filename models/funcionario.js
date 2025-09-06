const Sequelize = require('sequelize');
const connection = require('../database/database');

const Funcionario = connection.define('funcionario', {
    id_funcionario: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: Sequelize.STRING,
        allowNull: false
    },
    cpf: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false
    },
    cargo: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    tableName: 'funcionario',
    timestamps: true
});

Funcionario.sync({ force: false })
    .then(() => {
        console.log("Tabela Funcionario criada ou já existe.");
    })
    .catch((error) => {
        console.error("Erro ao criar a tabela Funcionario:", error);
    });

module.exports = Funcionario;
