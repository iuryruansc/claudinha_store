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

Pdv.sync({ force: false })
    .then(() => {
        console.log("Tabela PDV criada ou já existe.");
    })
    .catch((error) => {
        console.error("Erro ao criar a tabela PDV:", error);
    });

module.exports = Pdv;