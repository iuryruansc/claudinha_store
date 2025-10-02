const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/handlers/async-handler');
const vendaService = require('../../services/admin/vendasService');
const Caixa = require('../../models/caixa');
const Pdv = require('../../models/pdv');
const { getDashboardData } = require('../../services/admin/dashboardService');

const verificarCaixaAberto = asyncHandler(async (req, res, next) => {
    const caixaAtivo = await Caixa.findOne({
        where: { id_funcionario: req.session.userId, data_fechamento: null },
        include: [{ model: Pdv, as: 'pdv' }]
    });

    if (!caixaAtivo) {
        req.flash('error_msg', 'Você precisa abrir um caixa antes de registrar uma nova venda.');
        return res.redirect('/funcionario/dashboard');
    }

    res.locals.caixa = caixaAtivo;
    req.id_caixa = caixaAtivo.id_caixa;
    next();
});

router.get('/vendas/new', verificarCaixaAberto, asyncHandler(async (req, res) => {
    const viewData = await vendaService.getViewDependencies();
    const { clientes, produtos } = await vendaService.getViewDependencies();
    const formasPagamento = [
        { id_forma_pagamento: 'dinheiro', nome: 'Dinheiro' },
        { id_forma_pagamento: 'cartao_credito', nome: 'Cartão de Crédito' },
        { id_forma_pagamento: 'cartao_debito', nome: 'Cartão de Débito' },
        { id_forma_pagamento: 'pix', nome: 'PIX' },
        { id_forma_pagamento: 'outro', nome: 'Outro' }
    ];

    viewData.modal = 'partials/modals/venda-modal.ejs';

    res.render('funcionario/vendas/new', { viewData, formasPagamento, clientes, produtos });
}));

router.post('/vendas/save', verificarCaixaAberto, asyncHandler(async (req, res) => {
    const vendaData = req.body;
    const id_funcionario = req.session.userId;
    const id_caixa = req.id_caixa;

    const itensValidos = vendaData.itens && vendaData.itens.length > 0;
    const pagamentosValidos = (vendaData.pagamentos || []).filter(p => parseFloat(p.valor) > 0);

    if (!itensValidos) {
        req.flash('error_msg', 'Adicione pelo menos um item para registrar a venda.');
        return res.redirect('/admin/vendas/new');
    }

    if (pagamentosValidos.length === 0 && parseFloat(vendaData.valor_total) > 0) {
        req.flash('error_msg', 'Adicione pelo menos uma forma de pagamento para a venda.');
        return res.redirect('/admin/vendas/new');
    }

    const venda = await vendaService.createVenda(vendaData, id_funcionario, id_caixa);

    const novosDadosDashboard = await getDashboardData(id_funcionario);

    const payload = {
        novaVenda: {
            id: venda.id_venda,
            vendedor: req.session.user.nome,
            cliente: vendaData.nome_cliente || 'Anônimo',
            valor: venda.valor_total,
            status: venda.status,
            timestamp: new Date()
        },

        resumoCaixa: novosDadosDashboard.resumoCaixa,
        resumoPendencias: novosDadosDashboard.resumoPendencias,
        alertasEstoque: novosDadosDashboard.lotesBaixoEstoque,
        novaAtividade: {
            texto: `<strong>${req.session.user.nome}</strong> registrou a venda <strong>#${venda.id_venda}</strong> no valor de <strong>${venda.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>.`,
            icone: 'bi-cart-check-fill',
            cor: 'text-success',
            tempoAtras: 'agora mesmo'
        }
    };

    req.io.emit('dashboard:vendaRealizada', payload);

    req.flash('success_msg', `Venda #${venda.id_venda} registrada com sucesso!`);
    res.redirect('/funcionario/vendas/new');
}));

router.get('/vendas/produtos/codigobarras/:codigo', asyncHandler(async (req, res) => {
    const codigo_barras = req.params.codigo;

    const resultado = await vendaService.findProdutoLotePorCodigoBarras(codigo_barras);

    return res.json(resultado);
}));

router.get('/vendas/produtos/:id_produto/lote', asyncHandler(async (req, res) => {
    try {
        const id_produto = parseInt(req.params.id_produto, 10);

        if (isNaN(id_produto)) {
            return res.status(400).json({ error: 'ID de produto inválido.' });
        }

        const loteProcessado = await vendaService.findLoteParaVenda(id_produto);

        if (!loteProcessado) {
            return res.status(404).json({ error: 'Nenhum lote disponível encontrado para este produto.' });
        }

        return res.json(loteProcessado);


    } catch (err) {
        console.error('Erro ao buscar lote/desconto', err);
        return res.status(500).json({ error: 'Erro interno' });
    }
}));

module.exports = router;