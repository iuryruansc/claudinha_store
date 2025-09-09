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

module.exports = {
    getAllMovs
}