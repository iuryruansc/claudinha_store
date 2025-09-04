const Produto = require('../models/produto');
const Category = require('../models/category');
const { modelValidation } = require('../utils/data-validation');

const findProdutoById = async (id) => {
    const produto = await Produto.findByPk(id);
    modelValidation(produto);
    return produto;
};

const getViewDependencies = async () => {
    const categorias = await Category.findAll();
    return categorias;
}

const getProdutosByCategoria = async (id) => {
    const produtosPromise = Produto.findAll({ where: { id_categoria: id } });
    const categoriaPromise = Category.findByPk(id);

    const [produtos, categoria] = await Promise.all([produtosPromise, categoriaPromise]);

    return { produtos, categoria }
}

const getAllProdutos = async () => {
    const produtosPromise = Produto.findAll();
    const categoriasPromise = getViewDependencies();

    const [produtos, categorias] = await Promise.all([produtosPromise, categoriasPromise]);

    return { produtos, categorias };
};

const getEditData = async (id) => {
    const produtoPromise = findProdutoById(id);
    const categoriasPromise = getViewDependencies();

    const [produto, categorias] = await Promise.all([produtoPromise, categoriasPromise]);
    
    return { produto, categorias };
}

const createProduto = async (clienteData) => {
    return await Produto.create(clienteData);
};

const updateProduto = async (id, updateData) => {
    return await Produto.update(updateData, {
        where: {
            id_produto: id
        }
    });
};

const deleteProduto = async (id) => {
    return await Produto.destroy({
        where: {
            id_produto: id
        }
    });
};

module.exports = {
    findProdutoById,
    getViewDependencies,
    getAllProdutos,
    getProdutosByCategoria,
    getEditData,
    createProduto,
    updateProduto,
    deleteProduto
}