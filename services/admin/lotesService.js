const Lote = require('../../models/lote');
const Produto = require('../../models/produto');
const MovimentacaoEstoque = require('../../models/movimentacaoEstoque');
const { modelValidation } = require('../../utils/data/data-validation');

const findLoteById = async (id) => {
    const lote = await Lote.findByPk(id);
    modelValidation(lote);
    return lote;
};

const getViewDependencies = async () => {
    const produtos = await Produto.findAll();
    return produtos;
}

const getAllLotes = async () => {
    const lotesPromise = Lote.findAll();
    const produtosPromise = getViewDependencies();

    const [lotes, produtos] = await Promise.all([lotesPromise, produtosPromise])

    return { lotes, produtos };
};

const getEditData = async (id) => {
    const lotePromise = findLoteById(id);
    const produtosPromise = getViewDependencies()

    const [lote, produtos] = await Promise.all([lotePromise, produtosPromise]);

    return { lote, produtos };
}

const createLote = async (clienteData) => {
    return await Lote.create(clienteData);
};

const updateLote = async (id, updateData) => {
    return await Lote.update(updateData, {
        where: {
            id_lote: id
        }
    });
};

const deleteLote = async (id) => {
    return await Lote.destroy({
        where: {
            id_lote: id
        }
    });
};

const adicionarQuantidadeAoLote = async (id_lote, quantidadeAdicional) => {
    const lote = await Lote.findByPk(id_lote);
    modelValidation(lote);

    lote.quantidade += quantidadeAdicional;
    await lote.save();

    await MovimentacaoEstoque.create({
        id_lote: id_lote,
        data_hora: new Date(),
        quantidade: quantidadeAdicional,
        tipo: 'entrada',
        observacao: 'Adição de quantidade ao lote por administrador'
    });
    return lote;
};

const getLowStockLotes = async () => {
    const lotes = await Lote.findAll({
        include: [Produto],
        order: [['quantidade', 'ASC']],
        limit: 5
    });

    return lotes;
};

module.exports = {
    findLoteById,
    getViewDependencies,
    getAllLotes,
    getEditData,
    createLote,
    updateLote,
    deleteLote,
    adicionarQuantidadeAoLote,
    getLowStockLotes
}
