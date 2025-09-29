const connection = require('../../database/database');
const { Op } = require('sequelize');
const Venda = require('../../models/venda');
const Funcionario = require('../../models/funcionario')
const Cliente = require('../../models/cliente');
const ItemVenda = require('../../models/itemVenda');
const Lote = require('../../models/lote');
const Desconto = require('../../models/desconto');
const Produto = require('../../models/produto');
const Pagamento = require('../../models/pagamento');
const PagamentoParcial = require('../../models/pagamentoParcial');
const ParcelaPagamento = require('../../models/parcelaPagamento');
const MovimentacaoEstoque = require('../../models/movimentacaoEstoque');
const { modelValidation } = require('../../utils/data/data-validation');

const findVendaById = async (id) => {
    const venda = await Venda.findByPk(id, {
        include: [{ model: ItemVenda }]
    });
    modelValidation(venda);
    return venda;
};

const getViewDependencies = async () => {
    const hoje = new Date()

    const produtosPromise = await Produto.findAll({
        include: [{
            model: Lote,
            as: 'lote',
            where: {
                data_validade: { [Op.gte]: hoje },
                quantidade: { [Op.gt]: 0 }
            },
            required: true,
            attributes: []
        }],
        order: [['nome', 'ASC']]
    });

    const clientesPromise = await Cliente.findAll();

    const [produtos, clientes] = await Promise.all([produtosPromise, clientesPromise])
    return { produtos, clientes };
};

const getAllVendas = async () => {
    const vendasPromise = Venda.findAll({
        include: [
            {
                model: ItemVenda,
                include: [{
                    model: Produto,
                }]
            },
            {
                model: Cliente,
            }
        ],
        order: [['data_hora', 'DESC']]
    });
    const dependenciesPromise = getViewDependencies();

    const [vendas, dependencies] = await Promise.all([vendasPromise, dependenciesPromise]);

    return { vendas, ...dependencies };
};

const findProdutoLotePorCodigoBarras = async (codigo_barras) => {
    const produto = await Produto.findOne({ where: { codigo_barras } });
    modelValidation(produto);

    const loteProcessado = await findLoteParaVenda(produto.id_produto);

    return {
        produto,
        lote: loteProcessado
    };
};

const findLoteParaVenda = async (id_produto) => {
    const hoje = new Date();

    const lote = await Lote.findOne({
        where: {
            id_produto,
            quantidade: { [Op.gt]: 0 },
            data_validade: { [Op.gte]: hoje }
        },
        order: [['data_validade', 'ASC']],
        include: [
            { model: Produto, as: 'produto' },
            { model: Desconto, as: 'descontos' }
        ]
    });

    if (!lote) {
        return null;
    }

    const precoOriginal = parseFloat(lote.preco_produto) || 0;
    let precoFinal = precoOriginal;
    let descontoAplicado = null;

    if (lote.descontos && lote.descontos.length > 0) {
        const descontoAtivo = lote.descontos.find(d =>
            d.ativo && new Date(d.data_inicio) <= hoje && new Date(d.data_fim) >= hoje
        );

        if (descontoAtivo) {
            if (descontoAtivo.tipo === 'porcentagem') {
                precoFinal = precoOriginal * (1 - parseFloat(descontoAtivo.valor) / 100);
            } else {
                precoFinal = precoOriginal - parseFloat(descontoAtivo.valor);
            }
            descontoAplicado = descontoAtivo;
        }
    }

    return {
        id_lote: lote.id_lote,
        preco_produto: precoOriginal,
        preco_final: parseFloat(precoFinal.toFixed(2)),
        desconto: descontoAplicado,
        produto: lote.produto
    };
};

const createVenda = async (vendaData, id_funcionario, id_caixa) => {
    return await connection.transaction(async (t) => {

        const pagamentosValidos = (vendaData.pagamentos || []).filter(pg => parseFloat(pg.valor) > 0);

        const itens = vendaData.itens.map(item => ({
            ...item,
            quantidade: parseInt(item.quantidade, 10),
            preco: parseFloat(item.preco)
        }));
        const pagamentos = pagamentosValidos.map(pg => ({
            ...pg,
            valor: parseFloat(pg.valor),
            parcelas: parseInt(pg.parcelas, 10)
        }));

        const venda = await Venda.create({
            valor_total: 0,
            id_cliente: vendaData.id_cliente || null,
            id_funcionario,
            id_caixa,
            status: 'PENDENTE'
        }, { transaction: t });

        for (const item of itens) {
            let quantidadePendente = item.quantidade;
            while (quantidadePendente > 0) {
                const lote = await Lote.findOne({
                    where: {
                        id_produto: item.id_produto,
                        quantidade: { [Op.gt]: 0 },
                        data_validade: { [Op.gte]: new Date() }
                    },
                    order: [['data_validade', 'ASC']],
                    include: [{ model: Desconto, as: 'descontos' }],
                    transaction: t
                });

                if (!lote) {
                    const produto = await Produto.findByPk(item.id_produto);
                    throw new Error(`Estoque insuficiente para ${produto.nome}`);
                }

                const precoOriginal = parseFloat(lote.preco_produto);
                let precoUnitarioCorreto = precoOriginal;
                const descontoAtivo = lote.descontos?.find(d =>
                    d.ativo && new Date(d.data_inicio) <= new Date() && new Date(d.data_fim) >= new Date()
                );

                if (descontoAtivo) {
                    precoUnitarioCorreto = (descontoAtivo.tipo === 'porcentagem')
                        ? precoOriginal * (1 - parseFloat(descontoAtivo.valor) / 100)
                        : precoOriginal - parseFloat(descontoAtivo.valor);
                }

                const quantidadeARetirar = Math.min(quantidadePendente, lote.quantidade);
                await lote.decrement('quantidade', { by: quantidadeARetirar, transaction: t });

                await ItemVenda.create({
                    id_venda: venda.id_venda,
                    id_lote: lote.id_lote,
                    id_produto: item.id_produto,
                    quantidade: quantidadeARetirar,
                    preco_unitario: precoUnitarioCorreto.toFixed(2)
                }, { transaction: t });

                await MovimentacaoEstoque.create({
                    id_lote: lote.id_lote,
                    id_venda: venda.id_venda,
                    data_hora: new Date(),
                    tipo: 'SAIDA_VENDA',
                    quantidade: -quantidadeARetirar,
                    id_funcionario
                }, { transaction: t });

                quantidadePendente -= quantidadeARetirar;
            }
        }

        const itensRevalidados = await ItemVenda.findAll({ where: { id_venda: venda.id_venda }, transaction: t });
        const valor_total_final_correto = itensRevalidados.reduce((acc, iv) => acc + (parseFloat(iv.preco_unitario) * iv.quantidade), 0);

        await venda.update({ valor_total: valor_total_final_correto }, { transaction: t });

        let totalPago = 0;
        for (const pg of pagamentos) {
            totalPago += pg.valor;
            const formaPagamentoString = pg.id_forma_pagamento.toLowerCase().replace(' ', '_');

            if (formaPagamentoString === 'cartao_credito') {
                const novoPagamento = await Pagamento.create({
                    id_venda: venda.id_venda,
                    forma_pagamento: formaPagamentoString,
                    valor_total: pg.valor,
                    parcelas: pg.parcelas || 1
                }, { transaction: t });

                if (pg.parcelas > 1) {
                    const valorParcela = (pg.valor / pg.parcelas).toFixed(2);
                    for (let i = 1; i <= pg.parcelas; i++) {
                        let dataVencimento = new Date();
                        dataVencimento.setMonth(dataVencimento.getMonth() + i);
                        await ParcelaPagamento.create({
                            id_pagamento: novoPagamento.id_pagamento,
                            numero_parcela: i,
                            valor_parcela: valorParcela,
                            data_vencimento: dataVencimento,
                            status: 'pendente'
                        }, { transaction: t });
                    }
                }
            } else {
                await PagamentoParcial.create({
                    id_venda: venda.id_venda,
                    data_pagamento: new Date(),
                    valor_pago: pg.valor,
                    forma_pagamento: formaPagamentoString
                }, { transaction: t });
            }
        }

        const restante = valor_total_final_correto - totalPago;

        if (restante <= 0.005) {
            await venda.update({ status: 'CONCLUIDA' }, { transaction: t });
            const pagamentosParciais = await PagamentoParcial.findAll({ where: { id_venda: venda.id_venda }, transaction: t });
            for (const pp of pagamentosParciais) {
                await Pagamento.create({
                    id_venda: venda.id_venda,
                    forma_pagamento: pp.forma_pagamento,
                    valor_total: pp.valor_pago,
                    parcelas: 1
                }, { transaction: t });
            }
            await PagamentoParcial.destroy({ where: { id_venda: venda.id_venda }, transaction: t });
        }

        return venda;
    });
};

const findVendaDetailsById = async (id_venda) => {
    const venda = await Venda.findByPk(id_venda, {
        include: [
            { model: Cliente, as: 'cliente' },
            { model: Funcionario, as: 'funcionario' },
            {
                model: ItemVenda,
                as: 'itemvendas',
                include: [{ model: Produto, as: 'produto' }]
            },
            {
                model: Pagamento,
                as: 'pagamentos',
                include: [{ model: ParcelaPagamento, as: 'parcelapagamentos' }]
            },
            { model: PagamentoParcial, as: 'pagamentoparcials' }
        ]
    });

    if (!venda) {
        const error = new Error('Venda não encontrada.');
        error.statusCode = 404;
        throw error;
    }

    let totalPago = 0;

    if (venda.pagamentoparcials && venda.pagamentoparcials.length > 0) {
        totalPago += venda.pagamentoparcials.reduce((acc, p) => acc + parseFloat(p.valor_pago), 0);
    }

    if (venda.pagamentos && venda.pagamentos.length > 0) {
        venda.pagamentos.forEach(p => {
            if (p.parcelas === 1) {
                totalPago += parseFloat(p.valor_total);
            }
            else if (p.parcelapagamentos && p.parcelapagamentos.length > 0) {
                totalPago += p.parcelapagamentos
                    .filter(parcela => parcela.status === 'pago')
                    .reduce((acc, parcela) => acc + parseFloat(parcela.valor_parcela), 0);
            }
        });
    }

    const saldo = parseFloat(venda.valor_total) - totalPago;

    return { venda, totalPago, saldo };
};

module.exports = {
    findVendaById,
    getAllVendas,
    getViewDependencies,
    createVenda,
    findLoteParaVenda,
    findProdutoLotePorCodigoBarras,
    findVendaDetailsById
}