const Sequelize = require('sequelize');
const connection = require('../database/database');
const Pdv = require('./Pdvs');
const Funcionario = require('./Funcionarios');

const Caixa = connection.define('caixa', {
    id_caixa: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_pdv: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    id_funcionario: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    data_abertura: {
        type: Sequelize.DATE,
        allowNull: true
    },
    data_fechamento: {
        type: Sequelize.DATE,
        allowNull: true
    },
    saldo_inicial: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
    },
    saldo_final: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
    },
    status: {
        type: Sequelize.ENUM('aberto', 'fechado'),
        allowNull: true,
    }
}, {
    tableName: 'caixa',
    timestamps: true
});

Caixa.sync({ force: false })
    .then(() => {
        console.log("Tabela Caixa criada ou já existe.");
    })
    .catch((error) => {
        console.error("Erro ao criar a tabela Caixa:", error);
    });

Caixa.belongsTo(Pdv, { foreignKey: 'id_pdv' });
Caixa.belongsTo(Funcionario, { foreignKey: 'id_funcionario' });
Pdv.hasMany(Caixa, { foreignKey: 'id_pdv' });
Funcionario.hasMany(Caixa, { foreignKey: 'id_funcionario' });

module.exports = Caixa;