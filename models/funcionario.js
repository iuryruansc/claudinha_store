const Sequelize = require('sequelize');
const bcrypt = require('bcrypt')
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
    timestamps: true,
    hooks: {
        beforeCreate: async (funcionario) => {
            if(funcionario.cpf) {
                const salt = await bcrypt.genSalt(10);
                funcionario.cpf = await bcrypt.hash(funcionario.cpf, salt);
            }
        }, 
        beforeUpdate: async (funcionario) => {
            if (funcionario.changed('cpf')) {
                const salt = await bcrypt.genSalt(10);
                funcionario.cpf = await bcrypt.hash(funcionario.cpf, salt);
            }
        }
    }
});

module.exports = Funcionario;
