const Sequelize = require('sequelize');
const connection = require('../database/database');

const Cliente = connection.define('cliente', {
    id_cliente: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    telefone: {
        type: Sequelize.STRING,
        allowNull: false
    },
    cpf: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
    }
}, {
    tableName: 'cliente',
    timestamps: true
});

Cliente.sync({ force: false })
    .then(() => {
        console.log("Tabela Cliente criada ou já existe.");
    })
    .catch((error) => {
        console.error("Erro ao criar a tabela Cliente:", error);
    });

module.exports = Cliente;
