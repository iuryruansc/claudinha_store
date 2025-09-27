const connection = require('../../database/database');
const { Op } = require('sequelize');
const Venda = require('../../models/venda');
const Cliente = require('../../models/cliente');
const ItemVenda = require('../../models/itemVenda');
const Lote = require('../../models/lote');
const Desconto = require('../../models/desconto');
const Produto = require('../../models/produto');
const Pagamento = require('../../models/pagamento');
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
        include: [{ model: ItemVenda }]
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
            data_validade: { [Op.gte]: hoje },
            quantidade: { [Op.gt]: 0 }
        },
        order: [['data_validade', 'ASC']]
    });

    if (!lote) {
        return null;
    }

    const desconto = await Desconto.findOne({
        where: {
            id_produto,
            ativo: true,
            data_inicio: { [Op.lte]: hoje },
            data_fim: { [Op.gte]: hoje }
        },
        order: [['valor', 'DESC']]
    });

    const precoOriginal = parseFloat(lote.preco_produto) || 0;
    let precoFinal = precoOriginal;
    let descontoPayload = null;

    if (desconto) {
        const tipo = desconto.tipo;
        const valorDesconto = parseFloat(desconto.valor) || 0;

        if (tipo === 'porcentagem') {
            precoFinal = precoOriginal * (1 - valorDesconto / 100);
        } else if (tipo === 'valor_fixo') {
            precoFinal = precoOriginal - valorDesconto;
        }

        if (precoFinal < 0) precoFinal = 0;

        descontoPayload = {
            id_desconto: desconto.id_desconto,
            tipo: desconto.tipo,
            valor: parseFloat(desconto.valor),
            data_inicio: desconto.data_inicio,
            data_fim: desconto.data_fim,
            observacao: desconto.observacao
        };
    }
    
    return {
        id_lote: lote.id_lote,
        preco_produto: precoOriginal,
        preco_final: parseFloat(precoFinal.toFixed(2)),
        quantidade: lote.quantidade,
        data_validade: lote.data_validade,
        desconto: descontoPayload
    };
};

const createVenda = async (vendaData) => {

};

const updateStockAndMovimentacao = async (t, id_produto, quantityChange, id_venda, id_funcionario, tipo) => {

};

module.exports = {
    findVendaById,
    getAllVendas,
    getViewDependencies,
    createVenda,
    findLoteParaVenda,
    findProdutoLotePorCodigoBarras
}