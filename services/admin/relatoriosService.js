const { Op } = require('sequelize');
const Venda = require('../../models/venda');
const Funcionario = require('../../models/funcionario')
const Cliente = require('../../models/cliente');
const ItemVenda = require('../../models/itemVenda');
const Produto = require('../../models/produto');

const getRelatorioVendas = async (options = {}) => {
    const whereClause = {};
    if (options.dataInicio && options.dataFim) {
        whereClause.data_hora = {
            [Op.between]: [new Date(options.dataInicio), new Date(options.dataFim + 'T23:59:59')]
        };
    }

    const vendas = await Venda.findAll({
        where: whereClause,
        include: [
            { model: Cliente, as: 'cliente' },
            { model: Funcionario, as: 'funcionario' },
            { model: ItemVenda, as: 'itemvendas', include: [{ model: Produto, as: 'produto' }] }
        ],
        order: [['data_hora', 'DESC']]
    });

    let faturamentoBruto = 0;
    let custoTotal = 0;
    let totalItensVendidos = 0;

    vendas.forEach(venda => {
        faturamentoBruto += parseFloat(venda.valor_total);
        venda.itemvendas.forEach(item => {
            totalItensVendidos += item.quantidade;
            if (item.produto) { 
                custoTotal += (item.produto.preco_compra || 0) * item.quantidade;
            }
        });
    });

    const numVendas = vendas.length;
    const lucroBruto = faturamentoBruto - custoTotal;
    const ticketMedio = numVendas > 0 ? faturamentoBruto / numVendas : 0;
    const margemLucro = faturamentoBruto > 0 ? (lucroBruto / faturamentoBruto) * 100 : 0;

    return {
        vendas,
        kpis: { 
            faturamentoBruto,
            lucroBruto,
            numVendas,
            ticketMedio,
            totalItensVendidos,
            margemLucro
        }
    };
};

const getRelatorioProdutos = async (options = {}) => {
    const whereVenda = {};
    if (options.dataInicio && options.dataFim) {
        whereVenda.data_hora = {
            [Op.between]: [new Date(options.dataInicio), new Date(options.dataFim + 'T23:59:59')]
        };
    }

    const itensVendidos = await ItemVenda.findAll({
        include: [
            {
                model: Venda,
                as: 'venda',
                where: whereVenda,
                attributes: []
            },
            {
                model: Produto,
                as: 'produto',
                paranoid: false 
            }
        ]
    });

    const relatorio = itensVendidos.reduce((acc, item) => {
        if (!item.produto) return acc;

        const id = item.produto.id_produto;
        if (!acc[id]) {
            acc[id] = {
                id_produto: id,
                nome: item.produto.nome,
                quantidadeVendida: 0,
                faturamento: 0,
                custo: 0,
            };
        }

        const quantidade = item.quantidade;
        const precoVenda = parseFloat(item.preco_unitario);
        const precoCompra = parseFloat(item.produto.preco_compra || 0);

        acc[id].quantidadeVendida += quantidade;
        acc[id].faturamento += quantidade * precoVenda;
        acc[id].custo += quantidade * precoCompra;

        return acc;
    }, {});

    const resultadoFinal = Object.values(relatorio).map(produto => {
        const lucro = produto.faturamento - produto.custo;
        return {
            ...produto,
            lucro,
            margem: produto.faturamento > 0 ? (lucro / produto.faturamento) * 100 : 0
        };
    });

    resultadoFinal.sort((a, b) => b.faturamento - a.faturamento);

    return resultadoFinal;
};


module.exports = { 
    getRelatorioVendas,
    getRelatorioProdutos
 };