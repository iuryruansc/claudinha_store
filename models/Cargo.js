const sequelize = require('sequelize');
const connection = require('../database/database');

const Cargo = connection.define('cargos', {
    id_cargo: {type: sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    nome_cargo: {type: sequelize.STRING,alowNull: false}
    },
{
    tableName: 'cargos',
    timestamps: false        
});
module.exports = Cargo;
