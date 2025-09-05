const Venda = require('../models/vendas');
const Caixa = require('../models/caixa');
const Cliente = require('../models/clientes');
const Funcionario = require('../models/funcionarios');
const { modelValidation } = require('../utils/data-validation');

const findVendaById = async (id) => {
    const venda = await Venda.findByPk(id);
    modelValidation(venda);
    return venda;
};

const getViewDependencies = async () => {
    const [caixas, clientes, funcionarios] = await Promise.all([
        Caixa.findAll(),
        Cliente.findAll(),
        Funcionario.findAll()
    ]);
    return { caixas, clientes, funcionarios };
};

const getAllVendas = async () => {
    const vendasPromise = Venda.findAll();
    const dependenciesPromise = getViewDependencies();

    const [vendas, dependencies] = await Promise.all([vendasPromise, dependenciesPromise]);

    return { vendas, ...dependencies };
};

const getEditData = async (id) => {
    const vendaPromise = findVendaById(id);
    const dependenciesPromise = getViewDependencies()

    const [venda, dependencies] = await Promise.all([vendaPromise, dependenciesPromise]);
    
    return { venda, ...dependencies };
}

const createVenda = async (VendaData) => {
    return await Venda.create(VendaData);
};

const updateVenda = async (id, updateData) => {
    return await Venda.update(updateData, {
        where: {
            id_venda: id
        }
    });
};

const deleteVenda = async (id) => {
    return await Venda.destroy({
        where: {
            id_venda: id
        }
    });
};

module.exports = {
    findVendaById,
    getAllVendas,
    getEditData,
    getViewDependencies,
    createVenda,
    updateVenda,
    deleteVenda
}