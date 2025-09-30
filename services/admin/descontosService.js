const { Op, fn, col } = require('sequelize');
const connection = require('../../database/database');
const Desconto = require('../../models/desconto');
const Produto = require('../../models/produto');
const Lote = require('../../models/lote');

const getPromocoes = async (options = {}) => {
    const hoje = new Date();

    const promocoes = await Desconto.findAll({
        where: {
            ativo: true,
            data_inicio: { [Op.lte]: hoje },
            data_fim: { [Op.gte]: hoje }
        },
        include: [{
            model: Lote,
            as: 'lote',
            required: true,
            where: {
                quantidade: { [Op.gt]: 0 },
                data_validade: { [Op.gte]: hoje }
            },
            include: [{ model: Produto, as: 'produto', required: true }]
        }],
        limit: 6
    });

    return promocoes.map(promo => {

        const produto = promo.lote.produto;
        const lote = promo.lote;
        const precoOriginal = parseFloat(produto.preco_compra);
        let precoPromocional = precoOriginal;

        if (promo.tipo === 'porcentagem') {
            precoPromocional = precoOriginal * (1 - parseFloat(promo.valor) / 100);
        } else {
            precoPromocional = precoOriginal - parseFloat(promo.valor);
        }

        return {
            nome: produto.nome,
            lote: lote.numero_lote,
            precoOriginal: precoOriginal.toFixed(2),
            precoPromocional: precoPromocional.toFixed(2),
            dataInicio: promo.data_inicio,
            dataFim: promo.data_fim,
        };
    });
};

const createDesconto = async (descData) => {
    return await Desconto.create(descData);
}

const createDescontoParaLoteMaisProximo = async (data) => {
    return await connection.transaction(async (t) => {
        const lote = await Lote.findOne({
            where: {
                id_produto: data.id_produto,
                quantidade: { [Op.gt]: 0 },
                data_validade: { [Op.gte]: new Date() }
            },
            order: [['data_validade', 'ASC']],
            transaction: t
        });

        if (!lote) {
            const produto = await Produto.findByPk(data.id_produto);
            throw new Error(`Nenhum lote com estoque e validade futura encontrado para o produto "${produto.nome}".`);
        }

        const novoDesconto = await Desconto.create({
            id_lote: lote.id_lote,
            tipo: data.tipo,
            valor: data.valor,
            data_inicio: data.data_inicio,
            data_fim: data.data_fim,
            ativo: true,
            observacao: data.observacao
        }, { transaction: t });

        return novoDesconto;
    });
};

module.exports = {
    createDesconto,
    getPromocoes,
    createDescontoParaLoteMaisProximo
}