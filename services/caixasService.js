const Caixa = require('../models/caixa');
const Pdv = require('../models/pdvs');
const Funcionario = require('../models/funcionarios');
const { modelValidation } = require('../utils/data-validation');

const findCaixaById = async (id) => {
    const caixa = await Caixa.findByPk(id);
    modelValidation(caixa);
    return caixa;
};

const getViewDependencies = async () => {
    const [pdvs, funcionarios] = await Promise.all([
        Pdv.findAll(),
        Funcionario.findAll()
    ]);
    return { pdvs, funcionarios };
};

const getAllCaixas = async () => {
    const caixaPromise = Caixa.findAll();
    const dependenciesPromise = getViewDependencies()

    const [caixas, dependencies] = await Promise.all([caixaPromise, dependenciesPromise]);
    
    return { caixas, ...dependencies };
};

const getEditData = async (id) => {
    const caixaPromise = findCaixaById(id);
    const dependenciesPromise = getViewDependencies();

    const [caixa, dependencies] = await Promise.all([caixaPromise, dependenciesPromise]);

    return { caixa, ...dependencies };
}

const createCaixa = async (caixaData) => {
    return await Caixa.create(caixaData);
};

const updateCaixa = async (id, updateData) => {
    return await Caixa.update(updateData, {
        where: {
            id_caixa: id
        }
    });
};

const deleteCaixa = async (id) => {
    await Caixa.destroy({
        where: {
            id_caixa: id
        }
    });
};

module.exports = {
    findCaixaById,
    getViewDependencies,
    getAllCaixas,
    getEditData,
    createCaixa,
    updateCaixa,
    deleteCaixa
};