const connection = require('../../database/database');
const Produto = require('../../models/Produto');
const Category = require('../../models/Category');
const Fornecedor = require('../../models/Fornecedor');
const Marca = require('../../models/Marca');
const Lote = require('../../models/Lote');
const { modelValidation } = require('../../utils/data/data-validation');

const findProdutoById = async (id) => {
    const produto = await Produto.findByPk(id);
    modelValidation(produto);
    return produto;
};

const getViewDependencies = async () => {
    const categoriasPromise = Category.findAll();
    const fornecedoresPromise = Fornecedor.findAll();
    const marcasPromise = Marca.findAll();

    const [categorias, fornecedores, marcas] = await Promise.all([
        categoriasPromise,
        fornecedoresPromise,
        marcasPromise
    ]);

    return { categorias, fornecedores, marcas };
}

const getProdutoByCodigoBarras = async (codigo_barras) => {
    const produto = await Produto.findOne({ where: { codigo_barras } });
    modelValidation(produto);
    return produto;
}

const getProdutosByCategoria = async (id) => {
    const produtosPromise = Produto.findAll({ where: { id_categoria: id } });
    const categoriaPromise = Category.findByPk(id);

    const [produtos, categoria] = await Promise.all([produtosPromise, categoriaPromise]);

    return { produtos, categoria }
}

const getProdutosByFornecedor = async (id) => {
    const produtosPromise = Produto.findAll({ where: { id_fornecedor: id } });
    const fornecedorPromise = Fornecedor.findByPk(id);

    const [produtos, fornecedor] = await Promise.all([produtosPromise, fornecedorPromise]);

    return { produtos, fornecedor }
}

const getProdutosByMarca = async (id) => {
    const produtosPromise = Produto.findAll({ where: { id_marca: id } });
    const marcaPromise = Marca.findByPk(id);

    const [produtos, marca] = await Promise.all([produtosPromise, marcaPromise]);

    return { produtos, marca }
}

const getAllProdutos = async () => {
    const produtosPromise = Produto.findAll();
    const dependenciesPromise = getViewDependencies();

    const [produtos, { categorias, fornecedores, marcas }] = await Promise.all([
        produtosPromise,
        dependenciesPromise
    ]);

    return { produtos, categorias, fornecedores, marcas };
};

const getEditData = async (id) => {
    const produtoPromise = findProdutoById(id);
    const dependenciesPromise = getViewDependencies();

    const [produto, { categorias, fornecedores, marcas }] = await Promise.all([
        produtoPromise,
        dependenciesPromise
    ]);

    return { produto, categorias, fornecedores, marcas };
}

const createProduto = async (clienteData) => {
    return await Produto.create(clienteData);
};

const updateProduto = async (id, updateData) => {
    return await connection.transaction(async (t) => {
        const produtoResult = await Produto.update(updateData, {
            where: { id_produto: id },
            transaction: t
        });

        if (updateData.hasOwnProperty('preco_venda')) {
            const novoPreco = Number(updateData.preco_venda);
            await Lote.update(
                { preco_venda: novoPreco },
                {
                    where: { id_produto: id },
                    transaction: t
                }
            );
        }

        return produtoResult;
    });
};

const updateProdutoAfterLoteChange = async (id, updateData, transaction) => {
    return await Produto.update(updateData, {
        where: { id_produto: id },
        transaction
    });
}

const deleteProduto = async (id) => {
    return await Produto.destroy({
        where: {
            id_produto: id
        }
    });
};

const produtoDetails = async (id_produto) => {
    const produto = await Produto.findByPk(id_produto, {
        include: [
            { model: Fornecedor, attributes: ['id_fornecedor', 'nome_fornecedor'] },
            { model: Marca, attributes: ['id_marca', 'nome_marca'] }
        ]
    });

    if (!produto) throw new Error('Produto não encontrado');

    const lotes = await Lote.findAll({
        where: { id_produto: id_produto },
        attributes: ['id_lote', 'numero_lote', 'quantidade', 'preco_venda', 'data_validade', 'numero_lote'],
        order: [['data_validade', 'ASC']]
    });

    produto.setDataValue('lote', lotes);

    return { produto };
};

module.exports = {
    findProdutoById,
    getViewDependencies,
    getProdutoByCodigoBarras,
    getAllProdutos,
    getProdutosByCategoria,
    getProdutosByFornecedor,
    getProdutosByMarca,
    getEditData,
    createProduto,
    updateProduto,
    deleteProduto,
    produtoDetails,
    updateProdutoAfterLoteChange
}
