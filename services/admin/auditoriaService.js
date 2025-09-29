const Funcionario = require('../../models/funcionario')
const Venda = require('../../models/venda');
const Cliente = require('../../models/cliente');
const Lote = require('../../models/lote');
const Produto = require('../../models/produto');
const MovimentacaoEstoque = require('../../models/movimentacaoEstoque');

const getAuditLog = async (options = {}) => {
    const page = parseInt(options.page, 10) || 1;
    const limit = parseInt(options.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const whereVenda = {};
    const whereMov = {};

    if (options.id_funcionario) {
        whereVenda.id_funcionario = options.id_funcionario;
        whereMov.id_funcionario = options.id_funcionario;
    }

    const vendaPromise = (options.tipo && options.tipo !== 'venda') 
        ? Promise.resolve({ rows: [], count: 0 })
        : Venda.findAndCountAll({ where: whereVenda, limit, offset, order: [['data_hora', 'DESC']], include: [{ model: Cliente, as: 'cliente' }, { model: Funcionario, as: 'funcionario' }] });

    const movimentacaoPromise = (options.tipo && ['entrada', 'saida'].indexOf(options.tipo) === -1)
        ? Promise.resolve({ rows: [], count: 0 })
        : MovimentacaoEstoque.findAndCountAll({ where: whereMov, limit, offset, order: [['data_hora', 'DESC']], include: [{ model: Lote, as: 'lote', include: [{ model: Produto, as: 'produto' }] }, { model: Funcionario, as: 'funcionario' }] });


    const [vendasResult, movimentacoesResult] = await Promise.all([vendaPromise, movimentacaoPromise]);

    let atividades = [];

    vendasResult.rows.forEach(v => {
        atividades.push({
            tipo: 'venda', icone: 'bi-cart-check-fill', cor: 'text-success', data: v.data_hora,
            usuario: v.funcionario?.nome || 'Sistema',
            detalhes: `Venda <a href="/admin/vendas/detalhes/${v.id_venda}">#${v.id_venda}</a> registrada para <strong>${v.cliente?.nome || 'Anônimo'}</strong> no valor de <strong>${parseFloat(v.valor_total).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</strong>.`
        });
    });

    movimentacoesResult.rows.forEach(mov => {
        if (mov.tipo === 'SAIDA_VENDA') return;
        const ehEntrada = mov.quantidade > 0;
        atividades.push({
            tipo: ehEntrada ? 'entrada' : 'saida',
            icone: ehEntrada ? 'bi-box-arrow-in-down' : 'bi-box-arrow-up',
            cor: ehEntrada ? 'text-primary' : 'text-danger', data: mov.data_hora,
            usuario: mov.funcionario?.nome || 'Sistema',
            detalhes: `<strong>${Math.abs(mov.quantidade)} unidade(s)</strong> de <strong>${mov.lote?.produto?.nome || ''}</strong>. Motivo: ${mov.tipo.toLowerCase().replace('_', ' ')}.`
        });
    });

    atividades.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    const totalItems = vendasResult.count + movimentacoesResult.count;

    return {
        logs: atividades,
        pagination: {
            totalItems: totalItems,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page,
            limit: limit
        }
    };
};

module.exports = { getAuditLog };