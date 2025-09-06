const Funcionario = require('../models/funcionario');
const Estoque = require('../models/estoque');
const Produto = require('../models/produto');
const MovimentacaoEstoque = require('../models/movimentacaoEstoque');

const getAllMovs = async () => {
    const movsPromise = MovimentacaoEstoque.findAll({
        include: [{ model: Estoque }]
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