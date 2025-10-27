const { Op } = require('sequelize');
const Venda = require('../../models/Venda');
const Cliente = require('../../models/Cliente');
const Caixa = require('../../models/Caixa')
const Lote = require('../../models/Lote');
const Funcionario = require('../../models/Funcionario');
const Produto = require('../../models/Produto');
const Pagamento = require('../../models/Pagamento');
const PagamentoParcial = require('../../models/PagamentoParcial');
const ParcelaPagamento = require('../../models/ParcelaPagamento');
const MovimentacaoEstoque = require('../../models/MovimentacaoEstoque');
const { calcularTempoAtras } = require('../../utils/data/date-calc');
const { getLowStockLotes, getLotesProximosVencimento } = require('../../services/admin/lotesService');
const { getPdvsAtivos } = require('../../services/admin/pdvsService');
const { getPromocoes } = require('../../services/admin/descontosService');

const getFeed = async () => {

    const ultimasVendas = await Venda.findAll({
        limit: 4,
        order: [['data_hora', 'DESC']],
        include: [
            { model: Cliente, as: 'cliente' },
            { model: Funcionario, as: 'funcionario' }
        ]
    });

    const ultimasMovimentacoes = await MovimentacaoEstoque.findAll({
        limit: 4,
        order: [['data_hora', 'DESC']],
        include: [{ model: Lote, as: 'lote', include: [{ model: Produto, as: 'produto' }] }]
    });

    let atividades = [];

    ultimasVendas.forEach(v => {
        const nomeFuncionario = v.funcionario?.nome || 'Funcionário Desconhecido';
        atividades.push({
            tipo: 'venda',
            icone: 'bi-cart-check-fill',
            cor: 'text-success',
            texto: `<strong>${nomeFuncionario}</strong> registrou a venda <strong>#${v.id_venda}</strong> no valor de <strong>${v.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>.`,
            data: v.data_hora
        });
    });

    ultimasMovimentacoes.forEach(mov => {

        if (mov.tipo === 'SAIDA_VENDA') return;

        const ehEntrada = mov.quantidade > 0;
        atividades.push({
            tipo: ehEntrada ? 'entrada' : 'saida',
            icone: ehEntrada ? 'bi-box-arrow-in-down' : 'bi-box-arrow-up',
            cor: ehEntrada ? 'text-primary' : 'text-danger',
            texto: `${ehEntrada ? 'Entrada' : 'Saída'} de <strong>${Math.abs(mov.quantidade)} unidade(s)</strong> de <strong>${mov.lote?.produto?.nome || ''}</strong>. Motivo: ${mov.tipo.toLowerCase().replace('_', ' ')}.`,
            data: mov.data_hora
        });
    });

    atividades.sort((a, b) => new Date(b.data) - new Date(a.data));
    atividades = atividades.slice(0, 5);

    atividades.forEach(a => {
        a.tempoAtras = calcularTempoAtras(a.data);
    });

    return atividades;
}

const getUltimasVendasStatus = async (limit = 5) => {
    const vendas = await Venda.findAll({
        limit: limit,
        order: [['data_hora', 'DESC']],
        include: [{
            model: Cliente,
            as: 'cliente',
            attributes: ['nome']
        }]
    });
    return vendas;
};

const getResumoPendencias = async () => {
    const vendasPendentes = await Venda.findAll({
        where: { status: 'PENDENTE' },
        include: [
            { model: PagamentoParcial, as: 'pagamentoparcials' },
            { model: Pagamento, as: 'pagamentos' }
        ]
    });

    let totalContasAReceber = 0;
    vendasPendentes.forEach(venda => {
        let totalPago = 0;
        totalPago += venda.pagamentoparcials.reduce((acc, p) => acc + parseFloat(p.valor_pago), 0);
        totalPago += venda.pagamentos.reduce((acc, p) => acc + parseFloat(p.valor_total), 0);
        totalContasAReceber += parseFloat(venda.valor_total) - totalPago;
    });

    const { count, rows } = await ParcelaPagamento.findAndCountAll({
        where: {
            status: { [Op.ne]: 'pago' }
        }
    });

    const totalParcelasAReceber = rows.reduce((acc, p) => acc + parseFloat(p.valor_parcela), 0);

    return {
        countContas: vendasPendentes.length,
        totalContas: totalContasAReceber,
        countParcelas: count,
        totalParcelas: totalParcelasAReceber,
        totalPendencias: totalContasAReceber + totalParcelasAReceber
    };
};

const getDashboardData = async (userId) => {
    const [
        atividades,
        lotesBaixoEstoque,
        lotesProximosVencimento,
        ultimasVendas,
        pdvs,
        promoList,
        resumoPendencias,
        caixaAtivo,
        lotesParaModal
    ] = await Promise.all([
        getFeed(),
        getLowStockLotes(),
        getLotesProximosVencimento(),
        getUltimasVendasStatus(5),
        getPdvsAtivos(),
        getPromocoes({ omitSemLote: true }),
        getResumoPendencias(),
        Caixa.findOne({ where: { data_fechamento: null, id_funcionario: userId } }),
        Lote.findAll({
            where: { quantidade: { [Op.gt]: 0 } },
            include: [{ model: Produto, as: 'produto' }],
            order: [[{ model: Produto }, 'nome', 'ASC']]
        })
    ]);

    let resumoCaixa = null;
    if (caixaAtivo) {
        const vendasNoCaixa = await Venda.findAll({
            where: { id_caixa: caixaAtivo.id_caixa }
        });

        const pagamentosNoCaixa = await Pagamento.findAll({
            where: { id_venda: { [Op.in]: vendasNoCaixa.map(v => v.id_venda) } }
        });
        const pagamentosParciaisNoCaixa = await PagamentoParcial.findAll({
            where: { id_venda: { [Op.in]: vendasNoCaixa.map(v => v.id_venda) } }
        });
        const todosPagamentos = [...pagamentosNoCaixa, ...pagamentosParciaisNoCaixa];

        const totalRecebidoDinheiro = todosPagamentos
            .filter(p => p.forma_pagamento === 'dinheiro')
            .reduce((acc, p) => acc + parseFloat(p.valor_total || p.valor_pago), 0);

        const totalRecebidoCartao = todosPagamentos
            .filter(p => ['cartao_credito', 'cartao_debito'].includes(p.forma_pagamento))
            .reduce((acc, p) => acc + parseFloat(p.valor_total || p.valor_pago), 0);

        const totalRecebidoPix = todosPagamentos
            .filter(p => p.forma_pagamento === 'pix')
            .reduce((acc, p) => acc + parseFloat(p.valor_total || p.valor_pago), 0);

        resumoCaixa = {
            totalVendas: vendasNoCaixa.reduce((acc, v) => acc + parseFloat(v.valor_total), 0),
            totalRecebidoDinheiro,
            totalRecebidoCartao,
            totalRecebidoPix,
            saldoEsperado: parseFloat(caixaAtivo.saldo_inicial) + totalRecebidoDinheiro
        };
    }

    return {
        atividades,
        lotesBaixoEstoque,
        lotesProximosVencimento,
        ultimasVendas,
        pdvs,
        promoList,
        resumoPendencias,
        caixa: caixaAtivo,
        resumoCaixa,
        lotes: lotesParaModal
    };
};

module.exports = {
    getFeed,
    getUltimasVendasStatus,
    getResumoPendencias,
    getDashboardData
}