const Fornecedor = require('../../models/Fornecedor');
const { modelValidation } = require('../../utils/data/data-validation');

const findFornecedorById = async (id) => {
    const fornecedor = await Fornecedor.findByPk(id);
    modelValidation(fornecedor);
    return fornecedor;
};

const getAllFornecedores = async () => {
    const fornecedores = await Fornecedor.findAll();
    return fornecedores;
};

const createFornecedor = async (fornecedorData) => {
    return await Fornecedor.create(fornecedorData);
};

const updateFornecedor = async (id, updateData) => {
    return await Fornecedor.update(updateData, {
        where: {
            id_fornecedor: id
        }
    });
};

const deleteFornecedor = async (id) => {
    return await Fornecedor.destroy({
        where: {
            id_fornecedor: id
        }
    });
};

module.exports= {
    findFornecedorById,
    getAllFornecedores,
    createFornecedor,
    updateFornecedor,
    deleteFornecedor
}
