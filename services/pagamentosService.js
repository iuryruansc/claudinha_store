const Pagamentos = require('../models/pagamentos');
const Vendas = require('../models/vendas');
const { modelValidation } = require('../utils/data-validation');

const findPagamentoById = async (id) => {
    const pagamento = await Pagamentos.findByPk(id);
    modelValidation(pagamento);
    return pagamento;
};

const getViewDependencies = async () => {
    const vendas = await Vendas.findAll();
    return vendas;
}

const getAllPagamentos = async () => {
    const pagamentosPromise = Pagamentos.findAll();
    const vendasPromise = getViewDependencies();

    const [pagamentos, vendas] = await Promise.all([pagamentosPromise, vendasPromise]);

    return { pagamentos, vendas };
};

const getEditData = async (id) => {
    const pagamentoPromise = findPagamentoById(id);
    const vendasPromise = getViewDependencies();

    const [pagamento, vendas] = await Promise.all([pagamentoPromise, vendasPromise]);

    return { pagamento, vendas };
}

const createPagamento = async (clienteData) => {
    return await Pagamentos.create(clienteData);
};

const updatePagamento = async (id, updateData) => {
    return await Pagamentos.update(updateData, {
        where: {
            id_pagamento: id
        }
    });
};

const deletePagamento = async (id) => {
    return await Pagamentos.destroy({
        where: {
            id_pagamento: id
        }
    });
};

module.exports = {
    findPagamentoById,
    getViewDependencies,
    getAllPagamentos,
    getEditData,
    createPagamento,
    updatePagamento,
    deletePagamento
}