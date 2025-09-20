const Funcionario = require('../../models/funcionario');
const Lote = require('../../models/lote');
const Produto = require('../../models/produto');
const MovimentacaoEstoque = require('../../models/movimentacaoEstoque');

const getAllMovs = async () => {
    const movsPromise = MovimentacaoEstoque.findAll({
        include: [{ model: Lote }]
    });

    const funcionariosPromise = Funcionario.findAll();
    const produtosPromise = Produto.findAll();

    const [movs, funcionarios, produtos] = await Promise.all([
        movsPromise,
        funcionariosPromise,
        produtosPromise
    ]);

    return { movs, funcionarios, produtos };
};

const getRecentActivity = async () => {
    const movimentacoes = await MovimentacaoEstoque.findAll({
        order: [['createdAt', 'DESC']],
        limit: 5,
        include: [
            { model: Lote, include: [Produto] }
        ]
    });

    return movimentacoes.map(m => {
        const produtoNome = m.lote?.produto?.nome || 'Produto desconhecido';
        const horasAtras = calcularHorasAtras(m.createdAt);

        return {
            tipo: m.tipo,
            produto: produtoNome,
            quantidade: m.quantidade,
            horas_ago: horasAtras,
            observacao: m.observacao
        };
    });
};

function calcularHorasAtras(data) {
    const agora = new Date();
    const diffMs = agora - new Date(data);
    return Math.floor(diffMs / (1000 * 60 * 60)); // horas
}

module.exports = {
    getAllMovs,
    getRecentActivity
}