const { Op } = require('sequelize');
const connection = require('../../database/database');
const Venda = require('../../models/Venda');
const Reembolso = require('../../models/Reembolso');
const ItemReembolso = require('../../models/ItemReembolso');
const ItemVenda = require('../../models/ItemVenda');
const Lote = require('../../models/Lote');
const Produto = require('../../models/Produto');
const MovimentacaoEstoque = require('../../models/MovimentacaoEstoque');
const Cliente = require('../../models/Cliente');
const Funcionario = require('../../models/Funcionario');

// Função auxiliar para recalcular quantidade total do produto
const updateProdutoQuantidade = async (id_produto, transaction) => {
    const lotes = await Lote.findAll({
        where: { id_produto },
        transaction
    });

    const totalQuantidade = lotes.reduce((sum, lote) => sum + lote.quantidade, 0);

    await Produto.update(
        { quantidade_estoque: totalQuantidade },
        { where: { id_produto }, transaction }
    );
};

const createReembolso = async (reembolsoData, id_funcionario) => {
    return await connection.transaction(async (t) => {
        const { id_venda, itens_reembolsar, motivo, tipo } = reembolsoData;

        // Buscar venda
        const venda = await Venda.findByPk(id_venda, { transaction: t });
        if (!venda) {
            throw new Error('Venda não encontrada');
        }

        // Buscar itens da venda
        const itensVenda = await ItemVenda.findAll({
            where: { id_venda },
            transaction: t
        });

        // Validar e calcular valor total do reembolso
        let valorTotalReembolso = 0;
        const itensParaReembolsar = [];

        for (const itemReembolso of itens_reembolsar) {
            const itemVenda = itensVenda.find(iv => iv.id_item === parseInt(itemReembolso.id_item_venda));
            if (!itemVenda) {
                throw new Error(`Item de venda não encontrado: ${itemReembolso.id_item_venda}`);
            }

            const qtdReembolso = parseInt(itemReembolso.quantidade);
            if (qtdReembolso <= 0 || qtdReembolso > itemVenda.quantidade) {
                throw new Error(`Quantidade inválida para item ${itemVenda.id_item}`);
            }

            // Calcular valor com desconto
            let precoItem = itemVenda.preco_unitario * qtdReembolso;
            let descontoItem = 0;

            if (itemVenda.desconto_tipo === 'porcentagem' && parseFloat(itemVenda.desconto_valor) > 0) {
                descontoItem = precoItem * (parseFloat(itemVenda.desconto_valor) / 100);
            } else if (itemVenda.desconto_tipo === 'valor_fixo' && parseFloat(itemVenda.desconto_valor) > 0) {
                descontoItem = parseFloat(itemVenda.desconto_valor);
            }

            const valorItemComDesconto = precoItem - descontoItem;
            valorTotalReembolso += valorItemComDesconto;

            itensParaReembolsar.push({
                itemVenda,
                quantidade: qtdReembolso,
                valorComDesconto: valorItemComDesconto
            });
        }

        // Criar reembolso
        const reembolso = await Reembolso.create({
            id_venda,
            id_funcionario,
            valor_total: parseFloat(valorTotalReembolso.toFixed(2)),
            motivo,
            tipo,
            status: 'PROCESSANDO'
        }, { transaction: t });

        // Criar items do reembolso e retornar ao estoque
        for (const itemReembolso of itensParaReembolsar) {
            const iv = itemReembolso.itemVenda;

            // Criar registro do item reembolsado
            await ItemReembolso.create({
                id_reembolso: reembolso.id_reembolso,
                id_item_venda: iv.id_item,
                id_produto: iv.id_produto,
                id_lote: iv.id_lote,
                quantidade: itemReembolso.quantidade,
                preco_unitario: iv.preco_unitario,
                desconto_tipo: iv.desconto_tipo || 'none',
                desconto_valor: iv.desconto_valor || 0
            }, { transaction: t });

            // Retornar quantidade ao lote
            const lote = await Lote.findByPk(iv.id_lote, { transaction: t });
            if (lote) {
                await lote.increment('quantidade', {
                    by: itemReembolso.quantidade,
                    transaction: t
                });

                // Registrar movimentação de estoque
                await MovimentacaoEstoque.create({
                    id_lote: iv.id_lote,
                    id_reembolso: reembolso.id_reembolso,
                    data_hora: new Date(),
                    tipo: 'ENTRADA_REEMBOLSO',
                    quantidade: itemReembolso.quantidade,
                    id_funcionario
                }, { transaction: t });

                // Recalcular quantidade total do produto
                await updateProdutoQuantidade(iv.id_produto, t);
            }
        }

        // Atualizar status do reembolso
        await reembolso.update({ status: 'CONCLUIDO' }, { transaction: t });

        return reembolso;
    });
};

const getAllReembolsos = async () => {
    const reembolsos = await Reembolso.findAll({
        include: [
            {
                model: Venda,
                as: 'venda',
                include: [
                    { model: Cliente, as: 'cliente' },
                    {
                        model: ItemVenda,
                        as: 'itemvendas',
                        include: [{ model: Produto, as: 'produto' }]
                    }
                ]
            },
            { model: Funcionario, as: 'funcionario' },
            {
                model: ItemReembolso,
                as: 'itemreembolsos',
                include: [
                    { model: Produto, as: 'produto' },
                    { model: Lote, as: 'lote' }
                ]
            }
        ],
        order: [['data_reembolso', 'DESC']]
    });

    return reembolsos;
};

const getReembolsoDetailsById = async (id_reembolso) => {
    const reembolso = await Reembolso.findByPk(id_reembolso, {
        include: [
            {
                model: Venda,
                as: 'venda',
                include: [
                    { model: Cliente, as: 'cliente' },
                    {
                        model: ItemVenda,
                        as: 'itemvendas',
                        include: [{ model: Produto, as: 'produto' }]
                    }
                ]
            },
            { model: Funcionario, as: 'funcionario' },
            {
                model: ItemReembolso,
                as: 'itemreembolsos',
                include: [
                    { model: Produto, as: 'produto' },
                    { model: Lote, as: 'lote' }
                ]
            }
        ]
    });

    if (!reembolso) {
        throw new Error('Reembolso não encontrado');
    }

    return reembolso;
};

const getItensParaReembolso = async (id_venda) => {
    const venda = await Venda.findByPk(id_venda, {
        include: [
            {
                model: ItemVenda,
                as: 'itemvendas',
                include: [
                    { model: Produto, as: 'produto' },
                    { model: ItemReembolso, as: 'itemreembolsos' }
                ]
            }
        ]
    });

    if (!venda) {
        throw new Error('Venda não encontrada');
    }

    // Retornar itens que ainda não foram totalmente reembolsados
    const itensDisponiveis = venda.itemvendas.map(item => {
        const qtdReembolsada = item.itemreembolsos
            ? item.itemreembolsos.reduce((sum, ir) => sum + ir.quantidade, 0)
            : 0;
        const qtdDisponivel = item.quantidade - qtdReembolsada;

        return {
            ...item.toJSON(),
            id_item_venda: item.id_item,  // Adicionar alias para o frontend
            qtd_reembolsada: qtdReembolsada,
            qtd_disponivel_reembolso: qtdDisponivel,
            pode_reembolsar: qtdDisponivel > 0
        };
    }).filter(item => item.pode_reembolsar);

    return itensDisponiveis;
};

const cancelarReembolso = async (id_reembolso, id_funcionario) => {
    return await connection.transaction(async (t) => {
        const reembolso = await Reembolso.findByPk(id_reembolso, {
            include: [{ model: ItemReembolso, as: 'itemreembolsos' }],
            transaction: t
        });

        if (!reembolso) {
            throw new Error('Reembolso não encontrado');
        }

        // Retornar itens dos lotes novamente
        for (const itemReembolso of reembolso.itemreembolsos) {
            const lote = await Lote.findByPk(itemReembolso.id_lote, { transaction: t });
            if (lote) {
                await lote.decrement('quantidade', {
                    by: itemReembolso.quantidade,
                    transaction: t
                });

                // Registrar movimentação
                await MovimentacaoEstoque.create({
                    id_lote: itemReembolso.id_lote,
                    id_reembolso,
                    data_hora: new Date(),
                    tipo: 'CANCELAMENTO_REEMBOLSO',
                    quantidade: -itemReembolso.quantidade,
                    id_funcionario
                }, { transaction: t });

                // Recalcular quantidade total do produto
                await updateProdutoQuantidade(itemReembolso.id_produto, t);
            }
        }

        // Atualizar status
        await reembolso.update({ status: 'CANCELADO' }, { transaction: t });

        return reembolso;
    });
};

module.exports = {
    createReembolso,
    getAllReembolsos,
    getReembolsoDetailsById,
    getItensParaReembolso,
    cancelarReembolso
};
