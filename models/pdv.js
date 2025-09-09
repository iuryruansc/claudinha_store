const Sequelize = require('sequelize');
const connection = require('../database/database');

const Pdv = connection.define('pdv', {
    id_pdv: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    identificacao: {
        type: Sequelize.STRING,
        allowNull: false
    },
    descricao: {
        type: Sequelize.STRING,
        allowNull: false
    },
    status: {
        type: Sequelize.ENUM('ativo', 'inativo'),
        allowNull: false,
    }
}, {
    tableName: 'pdv',
    timestamps: true
});

module.exports = Pdv;