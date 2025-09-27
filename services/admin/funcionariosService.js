const connection = require('../../database/database');
const Funcionario = require('../../models/funcionario');
const Usuario = require('../../models/usuario');
const { modelValidation } = require('../../utils/data/data-validation');

const findFuncionarioById = async (id) => {
    const funcionario = await Funcionario.findByPk(id);
    modelValidation(funcionario);
    return funcionario;
};

const getAllFuncionarios = async () => {
    const funcionario = await Funcionario.findAll();
    return funcionario;
};

const createFuncionario = async (clienteData) => {
    return await Funcionario.create(clienteData);
};

const updateFuncionario = async (id, updateData) => {
    return await connection.transaction(async (t) => {
        await Funcionario.update(updateData, {
            where: {
                id_funcionario: id
            }
        }, { transaction: t });

        await Usuario.update(updateData, {
            where: {
                id_funcionario: id
            }
        }, { transaction: t });
    });

};

const deleteFuncionario = async (id) => {
    return await Funcionario.destroy({
        where: {
            id_funcionario: id
        }
    });
};

module.exports = {
    findFuncionarioById,
    getAllFuncionarios,
    createFuncionario,
    updateFuncionario,
    deleteFuncionario
}
