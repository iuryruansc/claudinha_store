const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const connection = require('../database/database');

const Usuario = connection.define('usuario', {
    id_usuario: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: Sequelize.STRING,
        allowNull: false
    },
    senha: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    tableName: 'usuario',
    timestamps: true,
    hooks: {
        beforeCreate: async (usuario) => {
            if(usuario.senha) {
                const salt = await bcrypt.genSalt(10);
                usuario.senha = await bcrypt.hash(usuario.senha, salt);
            }
        }, 
        beforeUpdate: async (usuario) => {
            if (usuario.changed('senha')) {
                const salt = await bcrypt.genSalt(10);
                usuario.senha = await bcrypt.hash(usuario.senha, salt);
            }
        }
    }
});

module.exports = Usuario;