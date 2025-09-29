const Funcionario = require('../../models/funcionario');
const Lote = require('../../models/lote');
const Produto = require('../../models/produto');
const MovimentacaoEstoque = require('../../models/movimentacaoEstoque');

const getAllMovs = async () => {
    const movsPromise = MovimentacaoEstoque.findAll({
        include: [
            {
                model: Lote,
                as: 'lote',
                include: [
                    {
                        model: Produto,
                        as: 'produto'  
                    }
                ]
            }
        ],
        order: [['data_hora', 'DESC']]
    });

    const funcionariosPromise = Funcionario.findAll();

    const [movs, funcionarios, produto] = await Promise.all([
        movsPromise,
        funcionariosPromise,
    ]);

    return { movs, funcionarios };
};

module.exports = {
    getAllMovs
}