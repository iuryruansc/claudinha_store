const connection = require('../../database/database');
const Caixa = require('../../models/caixa');
const Pdv = require('../../models/pdv');
const Funcionario = require('../../models/funcionario');
const { modelValidation } = require('../../utils/data/data-validation');

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

const openCaixa = async ({ id_pdv, id_funcionario, saldo_inicial }) => {
    return await connection.transaction(async (t) => {
        const caixa = await Caixa.create({
            id_pdv,
            id_funcionario,
            saldo_inicial,
            status: 'aberto',
            data_abertura: new Date()
        }, { transaction: t });

        await Pdv.update(
            { status: 'inativo' },
            { where: { id_pdv }, transaction: t }
        );

        return caixa
    });
}

const closeCaixa = async ({ id_caixa, saldo_final }) => {
    return await connection.transaction(async (t) => {
        const caixa = await Caixa.findByPk(id_caixa, { transaction: t });

        caixa.saldo_final = saldo_final;
        caixa.data_fechamento = new Date();
        caixa.status = 'fechado';
        await caixa.save({ transaction: t });
        
        await Pdv.update(
            { status: 'ativo' },
            { where: { id_pdv: caixa.id_pdv }, transaction: t }
        );

        return caixa;
    });
};

module.exports = {
    findCaixaById,
    getViewDependencies,
    getAllCaixas,
    getEditData,
    openCaixa,
    closeCaixa,
    updateCaixa,
    deleteCaixa
};
