const Estoque = require('../models/estoque');
const Produto = require('../models/produto');
const { modelValidation } = require('../utils/data-validation');

const findEstoqueById = async (id) => {
    const estoque = await Estoque.findByPk(id);
    modelValidation(estoque);
    return estoque;
};

const getViewDependencies = async () => {
    const produtos = await Produto.findAll();
    return produtos;
}

const getAllEstoques = async () => {
    const estoquesPromise = Estoque.findAll();
    const produtosPromise = getViewDependencies();

    const [estoques, produtos] = await Promise.all([estoquesPromise, produtosPromise])

    return { estoques, produtos };
};

const getEditData = async (id) => {
    const estoquePromise = findEstoqueById(id);
    const produtosPromise = getViewDependencies()

    const [estoque, produtos] = await Promise.all([estoquePromise, produtosPromise]);
    
    return { estoque, produtos };
}

const createEstoque = async (clienteData) => {
    return await Estoque.create(clienteData);
};

const updateEstoque = async (id, updateData) => {
    return await Estoque.update(updateData, {
        where: {
            id_estoque: id
        }
    });
};

const deleteEstoque = async (id) => {
    return await Estoque.destroy({
        where: {
            id_estoque: id
        }
    });
};

module.exports = {
    findEstoqueById,
    getViewDependencies,
    getAllEstoques,
    getEditData,
    createEstoque,
    updateEstoque,
    deleteEstoque
}