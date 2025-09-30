const { Op } = require('sequelize');
const connection = require('../../database/database');
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
    const lotesGeral = await Lote.findAll({
        include: [{
            model: Produto,
            as: 'produto'
        }],
        order: [
            ['data_validade', 'ASC'],
            ['quantidade', 'ASC']
        ]
    });

    const hoje = new Date();
    const lotes = lotesGeral.map(lote => {
        const dataValidade = new Date(lote.data_validade);
        const diffDias = Math.ceil((dataValidade - hoje) / (1000 * 60 * 60 * 24));
        const qtd = lote.quantidade;

        let statusValidade = 'ok';
        if (diffDias < 0) {
            statusValidade = 'vencido';
        } else if (diffDias <= 7) {
            statusValidade = 'critico';
        } else if (diffDias <= 30) {
            statusValidade = 'atencao';
        }

        let statusQuantidade = 'ok';
        if (qtd === 0) {
            statusQuantidade = 'zerado';
        } else if (qtd <= 5) {
            statusQuantidade = 'critico';
        } else if (qtd <= 10) {
            statusQuantidade = 'baixo';
        }

        return {
            ...lote.get({ plain: true }),
            diffDias: diffDias,
            statusValidade: statusValidade,
            statusQuantidade: statusQuantidade,
        };
    });

    return { lotes };
};

const createLote = async (clienteData) => {
    return await Lote.create(clienteData);
};

const updateLote = async (id, updateData, id_funcionario) => {
    return await connection.transaction(async (t) => {
        const lote = await Lote.findByPk(id, { transaction: t });
        modelValidation(lote);

        const quantidadeAntiga = lote.quantidade;
        const quantidadeNova = updateData.quantidade;

        await lote.update(updateData, { transaction: t });

        const diferenca = quantidadeNova - quantidadeAntiga;
        if (diferenca !== 0) {
            await MovimentacaoEstoque.create({
                id_lote: id,
                data_hora: new Date(),
                tipo: diferenca > 0 ? 'ENTRADA_AJUSTE' : 'SAIDA_AJUSTE',
                quantidade: diferenca,
                id_funcionario,
                observacao: 'Ajuste de estoque via edição de lote.'
            }, { transaction: t });
        }

        return lote;
    });
};

const deleteLote = async (id) => {
    return await Lote.destroy({
        where: {
            id_lote: id
        }
    });
};

const adicionarQuantidadeAoLote = async (id_lote, quantidadeAdicional, id_funcionario, observacao) => {
    return await connection.transaction(async (t) => {
        const lote = await Lote.findByPk(id_lote, { transaction: t });
        modelValidation(lote);

        await lote.increment('quantidade', { by: quantidadeAdicional, transaction: t });

        await MovimentacaoEstoque.create({
            id_lote: id_lote,
            data_hora: new Date(),
            quantidade: quantidadeAdicional,
            tipo: 'ENTRADA_AJUSTE',
            id_funcionario,
            observacao: observacao || 'Adição manual de estoque'
        }, { transaction: t });

        await lote.reload({ transaction: t });
        return lote;
    });
};

const getLowStockLotes = async () => {
    const limiteBaixoEstoque = 10;

    const lotesGeral = await Lote.findAll({
        where: {
            quantidade: {
                [Op.gt]: 0,
                [Op.lte]: limiteBaixoEstoque
            }
        },
        include: [{
            model: Produto,
            as: 'produto',
            required: true
        }],
        order: [['quantidade', 'ASC']]
    });

    const lotesBaixoEstoque = lotesGeral.map(lote => {
        const hoje = new Date();
        const dataValidade = lote.data_validade ? new Date(lote.data_validade) : null;
        const qtd = lote.quantidade;

        const diasParaVencer = (dataValidade && dataValidade > hoje)
            ? Math.ceil((dataValidade - hoje) / (1000 * 60 * 60 * 24))
            : null;

        let statusEstoque = 'saudavel';
        if (qtd <= 5) {
            statusEstoque = 'critico';
        } else if (qtd <= 10) {
            statusEstoque = 'baixo';
        }

        return {
            ...lote.get({ plain: true }),
            diasParaVencer: (diasParaVencer !== null && diasParaVencer <= 30) ? diasParaVencer : null,
            statusEstoque: statusEstoque
        };
    });

    return lotesBaixoEstoque;
};

const getLotesProximosVencimento = async () => {
    const hoje = new Date();
    const dataLimite = new Date();
    dataLimite.setDate(hoje.getDate() + 30);

    const lotesGeral = await Lote.findAll({
        where: {
            quantidade: { [Op.gt]: 0 },
            data_validade: {
                [Op.between]: [hoje, dataLimite]
            }
        },
        include: [{
            model: Produto,
            as: 'produto',
            required: true
        }],
        order: [['data_validade', 'ASC']]
    });

    const lotesProximosVencimento = lotesGeral.map(lote => {
        const dataValidade = new Date(lote.data_validade);
        const qtd = lote.quantidade;

        const diasParaVencer = Math.ceil((dataValidade - hoje) / (1000 * 60 * 60 * 24));

        let statusEstoque = 'saudavel';
        if (qtd <= 5) {
            statusEstoque = 'critico';
        } else if (qtd <= 10) {
            statusEstoque = 'baixo';
        }

        return {
            ...lote.get({ plain: true }),
            diasParaVencer: diasParaVencer,
            statusEstoque: statusEstoque
        };
    });

    return lotesProximosVencimento;
};


const createLoteWithMovimentacao = async (data, id_funcionario) => {
    return await connection.transaction(async (t) => {

        const produto = await Produto.findByPk(data.id_produto);

        const novoLote = await Lote.create({
            id_produto: data.id_produto,
            preco_produto: data.preco_produto,
            numero_lote: data.numero_lote,
            quantidade: data.quantidade,
            data_validade: data.data_validade,
            localizacao: data.localizacao
        }, { transaction: t });

        await MovimentacaoEstoque.create({
            id_lote: novoLote.id_lote,
            data_hora: new Date(),
            tipo: 'entrada',
            quantidade: novoLote.quantidade,
            id_funcionario,
            observacao: 'Entrada via cadastro de lote'
        }, { transaction: t });

        const precoAntigo = parseFloat(produto.preco_compra);
        const precoNovo = parseFloat(data.preco_produto);

        if (precoNovo != precoAntigo) {
            await produto.update({ preco_compra: data.preco_produto }, { transaction: t })
        }

        return novoLote;
    });
}

module.exports = {
    findLoteById,
    getViewDependencies,
    getAllLotes,
    createLote,
    updateLote,
    deleteLote,
    adicionarQuantidadeAoLote,
    getLowStockLotes,
    createLoteWithMovimentacao,
    getLotesProximosVencimento
}
