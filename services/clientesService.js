const Cliente = require('../models/clientes');
const { modelValidation } = require('../utils/data-validation');

const findClienteById = async (id) => {
    const cliente = await Cliente.findByPk(id);
    modelValidation(cliente);
    return cliente;
};

const getAllClientes = async () => {
    const cliente = await Cliente.findAll();
    return cliente;
};

const createCliente = async (clienteData) => {
    return await Cliente.create(clienteData);
};

const updateCliente = async (id, updateData) => {
    return await Cliente.update(updateData, {
        where: {
            id_cliente: id
        }
    });
};

const deleteCliente = async (id) => {
    return await Cliente.destroy({
        where: {
            id_cliente: id
        }
    });
};

module.exports = {
    findClienteById,
    getAllClientes,
    createCliente,
    updateCliente,
    deleteCliente
}
