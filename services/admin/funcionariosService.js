const Funcionario = require('../../models/funcionario');
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
    return await Funcionario.update(updateData, {
        where: {
            id_funcionario: id
        }
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
