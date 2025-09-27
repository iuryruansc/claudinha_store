const { Op, fn, col } = require('sequelize');
const Desconto = require('../../models/desconto');
const Produto = require('../../models/produto');
const Lote = require('../../models/lote');

const getPromocoes = async (omitSemLote = false) => {
    const hoje = new Date();

    const descontos = await Desconto.findAll({
        where: {
            ativo: true,
            data_inicio: { [Op.lte]: hoje },
            data_fim: { [Op.gte]: hoje }
        },
        raw: true
    });
    if (!descontos.length) return [];

    const produtoIds = [...new Set(descontos.map(d => d.id_produto))];

    const lotesMin = await Lote.findAll({
        where: { id_produto: produtoIds },
        attributes: [
            'id_produto',
            [fn('MIN', col('preco_produto')), 'precoMin']
        ],
        group: ['id_produto'],
        raw: true
    });
    const precoMinMap = lotesMin.reduce((acc, l) => {
        acc[l.id_produto] = parseFloat(l.precoMin);
        return acc;
    }, {});

    const produtos = await Produto.findAll({
        where: { id_produto: produtoIds },
        attributes: ['id_produto', 'nome', 'preco_compra'],
        raw: true
    });
    const produtoMap = produtos.reduce((acc, p) => {
        acc[p.id_produto] = p;
        return acc;
    }, {});

    const promoList = [];
    for (const d of descontos) {
        const produto = produtoMap[d.id_produto];
        if (!produto) continue;

        
        const precoOriginal = precoMinMap[d.id_produto] ?? produto.preco_venda;
        if (precoOriginal == null || (omitSemLote && precoMinMap[d.id_produto] === undefined)) {
            
            continue;
        }

        let precoPromocional = d.tipo === 'porcentagem'
            ? precoOriginal * (1 - d.valor / 100)
            : precoOriginal - d.valor;
        precoPromocional = Math.max(precoPromocional, 0);

        promoList.push({
            nome: produto.nome,
            precoOriginal: precoOriginal.toFixed(2),
            precoPromocional: precoPromocional.toFixed(2),
            dataInicio: d.data_inicio.toISOString(),
            dataFim: d.data_fim.toISOString()
        });
    }

    return promoList;
}

const createDesconto = async (descData) => {
    return await Desconto.create(descData);
}

module.exports = {
    createDesconto,
    getPromocoes
}