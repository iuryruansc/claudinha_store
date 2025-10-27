const Funcionario = require('../../models/Funcionario');
const Lote = require('../../models/Lote');
const Produto = require('../../models/Produto');
const MovimentacaoEstoque = require('../../models/MovimentacaoEstoque');

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