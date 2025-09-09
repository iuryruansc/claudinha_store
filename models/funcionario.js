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
        unique: true
    },
    cargo: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    tableName: 'funcionario',
    timestamps: true
});

module.exports = Funcionario;
