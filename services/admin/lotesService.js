const { Op } = require('sequelize');
const connection = require('../../database/database');
const Lote = require('../../models/Lote');
const Produto = require('../../models/Produto');
const MovimentacaoEstoque = require('../../models/MovimentacaoEstoque');
const { modelValidation } = require('../../utils/data/data-validation');
const { updateProdutoAfterLoteChange } = require('./produtosService');

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

    const totaisPorProdutoId = {};

    for (const lote of lotesGeral) {
        const produtoId = lote.id_produto;

        if (!totaisPorProdutoId[produtoId]) {
            totaisPorProdutoId[produtoId] = 0;
        }

        totaisPorProdutoId[produtoId] += lote.quantidade;
    }

    const hoje = new Date();
    const lotes = lotesGeral.map(lote => {
        const dataValidade = new Date(lote.data_validade);
        const diffDias = Math.ceil((dataValidade - hoje) / (1000 * 60 * 60 * 24));

        let statusValidade = 'ok';
        if (diffDias < 0) {
            statusValidade = 'vencido';
        } else if (diffDias <= 7) {
            statusValidade = 'critico';
        } else if (diffDias <= 30) {
            statusValidade = 'atencao';
        }

        const qtdTotalProduto = totaisPorProdutoId[lote.produtoId];

        let statusQuantidade = 'ok';
        if (qtdTotalProduto === 0) {
            statusQuantidade = 'zerado';
        } else if (qtdTotalProduto <= 5) {
            statusQuantidade = 'critico';
        } else if (qtdTotalProduto <= 10) {
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

const updateLote = async (id, updateData, id_funcionario) => {
    return await connection.transaction(async (t) => {
        const lote = await Lote.findByPk(id, { transaction: t });

        modelValidation(lote);

        const quantidadeAntiga = lote.quantidade;
        const quantidadeNova = updateData.quantidade;

        await lote.update(updateData, { transaction: t });

        const diferenca = quantidadeNova - quantidadeAntiga;
        if (diferenca !== 0) {

            const lotes = await Lote.findAll({
                where: {
                    id_produto: lote.id_produto
                },
                transaction: t
            });

            const totalQuantidade = lotes.reduce((soma, lote) => soma + lote.quantidade, 0);

            updateProdutoAfterLoteChange(lote.id_produto, { quantidade_estoque: totalQuantidade }, t);

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

const deleteLote = async (id, id_funcionario) => {
    return await connection.transaction(async (t) => {
        const lote = await Lote.findByPk(id, { transaction: t });
        modelValidation(lote);

        const id_produto = lote.id_produto;
        const quantidadeRemovida = lote.quantidade;

        const lotesAtuais = await Lote.findAll({
            where: {
                id_produto: id_produto
            },
            transaction: t
        });

        const totalQuantidadeAtual = lotesAtuais.reduce((soma, lote) => soma + lote.quantidade, 0);

        await MovimentacaoEstoque.create({
            id_lote: id,
            data_hora: new Date(),
            tipo: 'SAIDA_EXCLUSAO',
            quantidade: quantidadeRemovida,
            id_funcionario,
            observacao: 'Exclusão de lote.'
        }, { transaction: t });

        const totalQuantidade = totalQuantidadeAtual - quantidadeRemovida;

        updateProdutoAfterLoteChange(id_produto, { quantidade_estoque: totalQuantidade }, t);

        await lote.destroy({ transaction: t });

        return true;
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
        attributes: [
            'id_produto',
            'numero_lote',
            [connection.fn('SUM', connection.col('quantidade')), 'quantidade_total']
        ],
        where: {
            quantidade: {
                [Op.gt]: 0
            }
        },
        include: [{
            model: Produto,
            as: 'produto',
            required: true
        }],
        group: ['id_produto', 'numero_lote', 'produto.id_produto', 'produto.nome'],
        having: connection.where(
            connection.fn('SUM', connection.col('quantidade')),
            {
                [Op.lte]: limiteBaixoEstoque
            }
        )
    });

    const lotesBaixoEstoque = lotesGeral.map(lote => {
        const qtd = parseInt(lote.get('quantidade_total'));

        let statusEstoque = 'saudavel';
        if (qtd <= 5) {
            statusEstoque = 'critico';
        } else if (qtd <= 10) {
            statusEstoque = 'baixo';
        }

        return {
            id_produto: lote.id_produto,
            produto: lote.produto,
            quantidade_total: qtd,
            statusEstoque: statusEstoque,
            numero_lote: lote.numero_lote
        };
    });

    return lotesBaixoEstoque;
};

const getLotesProximosVencimento = async () => {
    const hoje = new Date();
    const dataLimite = new Date();
    dataLimite.setDate(hoje.getDate() + 30);

    const lotesGeral = await Lote.findAll({
        attributes: [
            'id_produto',
            'data_validade',
            'numero_lote',
            [connection.fn('SUM', connection.col('quantidade')), 'quantidade_total']
        ],
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
        group: ['id_produto', 'data_validade', 'numero_lote', 'produto.id_produto', 'produto.nome'],
        order: [['data_validade', 'ASC']]
    });

    const lotesProximosVencimento = lotesGeral.map(lote => {

        const dataValidade = new Date(lote.data_validade);
        const qtd = parseInt(lote.get('quantidade_total'));
        const diasParaVencer = Math.ceil((dataValidade - hoje) / (1000 * 60 * 60 * 24));

        let statusEstoque = 'saudavel';
        if (qtd <= 5) {
            statusEstoque = 'critico';
        } else if (qtd <= 10) {
            statusEstoque = 'baixo';
        }

        return {
            id_produto: lote.id_produto,
            produto: lote.produto,
            quantidade_total: qtd,
            data_validade: lote.data_validade,
            diasParaVencer: diasParaVencer,
            statusEstoque: statusEstoque,
            numero_lote: lote.numero_lote
        };
    });

    return lotesProximosVencimento;
};


const createLoteWithMovimentacao = async (data, id_funcionario) => {
    return await connection.transaction(async (t) => {

        const produto = await Produto.findByPk(data.id_produto);

        const novoLote = await Lote.create({
            id_produto: data.id_produto,
            preco_compra: data.preco_compra,
            preco_venda: data.preco_venda,
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

        const quantidade = Number(novoLote.quantidade) || 0;
        if (quantidade !== 0) {
            await produto.increment('quantidade_estoque', { by: quantidade, transaction: t });
            await produto.reload({ transaction: t });
        }


        const precoAntigo = parseFloat(produto.preco_venda);
        const precoNovo = parseFloat(data.preco_venda);
        if (precoNovo != precoAntigo) {
            await produto.update({ preco_venda: data.preco_venda }, { transaction: t })
        }

        return novoLote;
    });
}

module.exports = {
    findLoteById,
    getViewDependencies,
    getAllLotes,
    updateLote,
    deleteLote,
    adicionarQuantidadeAoLote,
    getLowStockLotes,
    createLoteWithMovimentacao,
    getLotesProximosVencimento
}
