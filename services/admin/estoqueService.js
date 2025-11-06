const { Op, Sequelize } = require('sequelize');
const Lote = require('../../models/Lote');
const Produto = require('../../models/Produto');

async function getNiveisEstoque(produtoIds) {
    const whereProduto = produtoIds && produtoIds.length ? { id_produto: { [Op.in]: produtoIds } } : {};

    const produtosComTotais = await Produto.findAll({
        attributes: [
            'id_produto',
            'nome',
            [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('lote.quantidade')), 0), 'novaQuantidade']
        ],
        include: [{
            model: Lote,
            as: 'lote',
            attributes: []
        }],
        where: whereProduto,
        group: ['Produto.id_produto', 'Produto.nome']
    });

    const resultadoFormatado = produtosComTotais.map(item => {
        const data = item.get({ plain: true });
        const qtd = parseInt(data.novaQuantidade, 10) || 0;

        let statusEstoque = 'ok';
        if (qtd === 0) {
            statusEstoque = 'zerado';
        } else if (qtd <= 5) {
            statusEstoque = 'critico';
        } else if (qtd <= 10) {
            statusEstoque = 'baixo';
        }

        return {
            id_produto: data.id_produto,
            nome: data.nome,
            novaQuantidade: qtd,
            statusEstoque
        };
    });

    return resultadoFormatado;
}

module.exports = {
    getNiveisEstoque
};