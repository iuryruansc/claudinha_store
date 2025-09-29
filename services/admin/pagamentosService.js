const connection = require('../../database/database');
const { Op, where } = require('sequelize');
const Cliente = require('../../models/cliente');
const ItemVenda = require('../../models/itemVenda');
const Produto = require('../../models/produto');
const Pagamento = require('../../models/pagamento');
const Venda = require('../../models/venda');
const PagamentoParcial = require('../../models/pagamentoParcial');
const ParcelaPagamento = require('../../models/parcelaPagamento');
const { modelValidation } = require('../../utils/data/data-validation');

const _mapVendaData = (venda) => {
    if (!venda || !venda.itemvendas || venda.itemvendas.length === 0) {
        return 'Venda sem itens registrados';
    }
    const primeiroItem = venda.itemvendas[0].produto ? venda.itemvendas[0].produto.nome : 'Produto desconhecido';
    const outrosItens = venda.itemvendas.length - 1;
    return outrosItens > 0 ? `${primeiroItem} e +${outrosItens} item(s)` : primeiroItem;
};

const findPagamentoById = async (id) => {
    const pagamento = await Pagamento.findByPk(id);
    modelValidation(pagamento);
    return pagamento;
};

const getViewDependencies = async () => {
    const vendas = await Venda.findAll();
    return vendas;
}

const getAllPagamentos = async () => {
    const pagamentosPromise = Pagamento.findAll();
    const vendasPromise = getViewDependencies();

    const [pagamentos, vendas] = await Promise.all([pagamentosPromise, vendasPromise]);

    return { pagamentos, vendas };
};

const registrarPagamentoPendente = async (dadosPagamento) => {
    return await connection.transaction(async (t) => {
        const { id_venda, valor_pago, forma_pagamento } = dadosPagamento;

        const venda = await Venda.findByPk(id_venda, {
            include: [{ model: PagamentoParcial, as: 'pagamentoparcials' }],
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        if (!venda || venda.status !== 'PENDENTE') {
            throw new Error('Venda não encontrada ou já está concluída.');
        }

        const totalJaPago = venda.pagamentoparcials.reduce((acc, p) => acc + parseFloat(p.valor_pago), 0);
        const saldoDevedor = parseFloat(venda.valor_total) - totalJaPago;
        const valorAPagar = parseFloat(valor_pago);

        if (valorAPagar <= 0) {
            throw new Error('O valor do pagamento deve ser positivo.');
        }
        if (valorAPagar > saldoDevedor + 0.005) {
            throw new Error(`O valor pago (R$ ${valorAPagar.toFixed(2)}) não pode ser maior que o saldo devedor (R$ ${saldoDevedor.toFixed(2)}).`);
        }

        await PagamentoParcial.create({
            id_venda: id_venda,
            data_pagamento: new Date(),
            valor_pago: valorAPagar,
            forma_pagamento: forma_pagamento
        }, { transaction: t });

        await _finalizarVendaSeQuitada(id_venda, t);

        return venda;
    });
};

const quitarParcelas = async (parcelasIds) => {
    return await connection.transaction(async (t) => {
        await ParcelaPagamento.update(
            {
                status: 'pago',
                data_pagamento: new Date()
            },
            {
                where: {
                    id_parcelapagamento: { [Op.in]: parcelasIds }
                },
                transaction: t
            }
        );

        const primeiraParcela = await ParcelaPagamento.findByPk(parcelasIds[0], {
            include: [{ model: Pagamento, as: 'pagamento' }],
            transaction: t
        });

        if (!primeiraParcela) {
            throw new Error("Parcela de referência não encontrada para verificação.");
        }
        const id_venda = primeiraParcela.pagamento.id_venda;

        await _finalizarVendaSeQuitada(id_venda, t);
    });
};

const _finalizarVendaSeQuitada = async (id_venda, t) => {
    const venda = await Venda.findByPk(id_venda, {
        include: [
            { model: PagamentoParcial, as: 'pagamentoparcials' },
            { model: Pagamento, as: 'pagamentos', include: [{ model: ParcelaPagamento, as: 'parcelapagamentos' }] }
        ],
        transaction: t
    });

    let totalPago = 0;
    totalPago += venda.pagamentoparcials.reduce((sum, p) => sum + parseFloat(p.valor_pago), 0);
    totalPago += venda.pagamentos.reduce((sum, p) => sum + parseFloat(p.valor_total), 0);

    if (parseFloat(venda.valor_total) - totalPago <= 0.005) {

        for (const pp of venda.pagamentoparcials) {
            await Pagamento.create({
                id_venda: venda.id_venda,
                forma_pagamento: pp.forma_pagamento,
                valor_total: pp.valor_pago,
                parcelas: 1
            }, { transaction: t });
        }

        if (venda.pagamentoparcials.length > 0) {
            await PagamentoParcial.destroy({ where: { id_venda: id_venda }, transaction: t });
        }

        await venda.update({ status: 'CONCLUIDA' }, { transaction: t });
    }
};

const getHistoricoPagamentos = async (options = {}) => {
    const whereClause = {};

    if (options.ano && options.mes) {
        const dataInicio = new Date(options.ano, options.mes - 1, 1);
        const dataFim = new Date(options.ano, options.mes, 0, 23, 59, 59);

        whereClause.pagamento = { createdAt: { [Op.between]: [dataInicio, dataFim] } };
        whereClause.pagamentoParcial = { data_pagamento: { [Op.between]: [dataInicio, dataFim] } };
        whereClause.parcela = { data_vencimento: { [Op.between]: [dataInicio, dataFim] } };
    }

    const [pagamentos, pagamentosParciais, parcelas] = await Promise.all([
        Pagamento.findAll({
            where: whereClause.pagamento,
            include: [
                { model: Venda, as: 'venda', include: [{ model: Cliente, as: 'cliente' }, { model: ItemVenda, as: 'itemvendas', include: [{ model: Produto, as: 'produto' }] }] },
                { model: ParcelaPagamento, as: 'parcelapagamentos' }
            ],
            order: [['id_venda', 'DESC'], ['createdAt', 'DESC']]
        }),
        PagamentoParcial.findAll({
            where: whereClause.pagamentoParcial,
            include: [{ model: Venda, as: 'venda', include: [{ model: Cliente, as: 'cliente' }, { model: ItemVenda, as: 'itemvendas', include: [{ model: Produto, as: 'produto' }] }] }],
            order: [['id_venda', 'DESC'], ['data_pagamento', 'DESC']]
        }),
        ParcelaPagamento.findAll({
            where: whereClause.parcela,
            include: [{ model: Pagamento, as: 'pagamento', include: [{ model: Venda, as: 'venda', include: [{ model: Cliente, as: 'cliente' }, { model: ItemVenda, as: 'itemvendas', include: [{ model: Produto, as: 'produto' }] }] }] }],
            order: [[{ model: Pagamento }, { model: Venda }, 'id_venda', 'DESC'], ['data_vencimento', 'DESC']]
        })
    ]);

    const historico = [];

    pagamentos.forEach(p => {
        if (p.parcelapagamentos && p.parcelapagamentos.length > 1) return;
        historico.push({
            data: p.createdAt, tipo: 'Pagamento Integral', cliente: p.venda?.cliente?.nome || 'Anônimo',
            vendaId: p.id_venda, resumoVenda: _mapVendaData(p.venda), valor: p.valor_total,
            status: 'Completo', forma: p.forma_pagamento
        });
    });

    pagamentosParciais.forEach(p => historico.push({
        data: p.data_pagamento, tipo: 'Pagamento Parcial', cliente: p.venda?.cliente?.nome || 'Anônimo',
        vendaId: p.id_venda, resumoVenda: _mapVendaData(p.venda), valor: p.valor_pago,
        status: 'Parcial', forma: p.forma_pagamento
    }));

    parcelas.forEach(p => historico.push({
        data: p.data_vencimento, tipo: `Parcela ${p.numero_parcela}`, cliente: p.pagamento?.venda?.cliente?.nome || 'Anônimo',
        vendaId: p.pagamento?.id_venda, resumoVenda: _mapVendaData(p.pagamento?.venda), valor: p.valor_parcela,
        status: p.status, forma: p.pagamento?.forma_pagamento
    }));

    historico.sort((a, b) => {
        if (a.vendaId > b.vendaId) return -1;
        if (a.vendaId < b.vendaId) return 1;
        return new Date(b.data) - new Date(a.data);
    });

    return historico;
};

const getContasAReceber = async () => {
    const vendasPendentes = await Venda.findAll({
        where: { status: 'PENDENTE' },
        include: [
            { model: Cliente, as: 'cliente' },
            { model: PagamentoParcial, as: 'pagamentoparcials' },
            { model: Pagamento, as: 'pagamentos', include: [{ model: ParcelaPagamento, as: 'parcelapagamentos' }] }
        ],
        order: [['data_hora', 'ASC']]
    });

    return vendasPendentes.map(venda => {
        let totalPago = 0;
        if (venda.pagamentoparcials) totalPago += venda.pagamentoparcials.reduce((acc, p) => acc + parseFloat(p.valor_pago), 0);
        if (venda.pagamentos) totalPago += venda.pagamentos.reduce((acc, p) => acc + parseFloat(p.valor_total), 0);

        return {
            id_venda: venda.id_venda, data_hora: venda.data_hora, cliente: venda.cliente ? venda.cliente.nome : 'Anônimo',
            valor_total: venda.valor_total, total_pago: totalPago, saldo_devedor: parseFloat(venda.valor_total) - totalPago,
            parcelas: venda.pagamentos.flatMap(p => p.parcelapagamentos)
        };
    });
};

const getParcelasAReceber = async () => {
    const hoje = new Date();
    const parcelas = await ParcelaPagamento.findAll({
        where: { status: { [Op.ne]: 'pago' } },
        include: [{ model: Pagamento, as: 'pagamento', include: [{ model: Venda, as: 'venda', include: [{ model: Cliente, as: 'cliente' }, { model: ItemVenda, as: 'itemvendas', include: [{ model: Produto, as: 'produto' }] }, { model: PagamentoParcial, as: 'pagamentoparcials' }] }] }],
        order: [['data_vencimento', 'ASC']]
    });

    const vendasComParcelas = parcelas.reduce((acc, parcela) => {
        const venda = parcela.pagamento.venda;
        const vendaId = venda.id_venda;

        if (!acc[vendaId]) {
            const totalPagoParcial = venda.pagamentoparcials.reduce((sum, p) => sum + parseFloat(p.valor_pago), 0);
            acc[vendaId] = {
                venda: venda, cliente: venda.cliente ? venda.cliente.nome : 'Anônimo', resumoVenda: _mapVendaData(venda),
                saldoDevedor: parseFloat(venda.valor_total) - totalPagoParcial, parcelas: []
            };
        }
        parcela.dataValues.atrasada = parcela.status === 'pendente' && new Date(parcela.data_vencimento) < hoje;
        acc[vendaId].parcelas.push(parcela);
        return acc;
    }, {});

    return Object.values(vendasComParcelas);
};

const getPeriodosDisponiveis = async () => {
    const [results] = await connection.query(`
        SELECT DISTINCT YEAR(data) AS ano, MONTH(data) AS mes FROM (
            SELECT createdAt AS data FROM pagamento
            UNION ALL
            SELECT data_pagamento AS data FROM pagamentoparcial
            UNION ALL
            SELECT data_vencimento AS data FROM parcelapagamento
        ) AS datas
        ORDER BY ano DESC, mes DESC
    `);

    const periodos = results.reduce((acc, row) => {
        const { ano, mes } = row;
        if (!acc[ano]) {
            acc[ano] = [];
        }
        acc[ano].push(mes);
        return acc;
    }, {});

    return periodos;
};

module.exports = {
    findPagamentoById,
    getViewDependencies,
    getAllPagamentos,
    registrarPagamentoPendente,
    quitarParcelas,
    getHistoricoPagamentos,
    getContasAReceber,
    getParcelasAReceber,
    getPeriodosDisponiveis
}