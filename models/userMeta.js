const Sequelize = require('sequelize');
const connection = require('../database/database');

const UserMeta = connection.define('usermeta', {
    id_usermeta: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        ref: {
            model: 'usuario',
            key: 'id_usuario'
        }
    },
    token: {
        type: Sequelize.STRING,
        allowNull: false
    },
    expiresAt: {
        type: Sequelize.DATE,
        allowNull: false
    }
}, {
    tableName: 'usermeta',
    timestamps: true
});

module.exports = UserMeta;