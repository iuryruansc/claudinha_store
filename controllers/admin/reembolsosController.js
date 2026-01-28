const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/handlers/async-handler');
const reembolsoService = require('../../services/admin/reembolsoService');

router.get('/reembolsos', asyncHandler(async (req, res) => {
    const reembolsos = await reembolsoService.getAllReembolsos();
    res.render('admin/reembolsos/index', { reembolsos });
}));

router.get('/reembolsos/detalhes/:id', asyncHandler(async (req, res) => {
    const id_reembolso = req.params.id;
    const reembolso = await reembolsoService.getReembolsoDetailsById(id_reembolso);
    res.render('admin/reembolsos/detalhes', { reembolso });
}));

router.get('/vendas/:id_venda/reembolso/novo', asyncHandler(async (req, res) => {
    const id_venda = req.params.id_venda;
    const itensParaReembolso = await reembolsoService.getItensParaReembolso(id_venda);
    res.json(itensParaReembolso);
}));

router.post('/reembolsos/criar', asyncHandler(async (req, res) => {
    const reembolsoData = req.body;
    const id_funcionario = req.session.userId;

    // Parsear JSON se necessário
    if (typeof reembolsoData.itens_reembolsar === 'string') {
        reembolsoData.itens_reembolsar = JSON.parse(reembolsoData.itens_reembolsar);
    } else if (Array.isArray(reembolsoData.itens_reembolsar)) {
        // Se for um array, pegar o último elemento que é a string JSON
        const jsonStr = reembolsoData.itens_reembolsar.find(item => typeof item === 'string' && item.startsWith('['));
        if (jsonStr) {
            reembolsoData.itens_reembolsar = JSON.parse(jsonStr);
        }
    }

    const reembolso = await reembolsoService.createReembolso(reembolsoData, id_funcionario);

    req.io.emit('reembolso:criado', {
        id_reembolso: reembolso.id_reembolso,
        id_venda: reembolso.id_venda,
        valor_total: reembolso.valor_total,
        tipo: reembolso.tipo,
        data_reembolso: reembolso.data_reembolso
    });

    req.flash('success_msg', `Reembolso #${reembolso.id_reembolso} processado com sucesso!`);
    res.redirect(`/admin/reembolsos/detalhes/${reembolso.id_reembolso}`);
}));

router.post('/reembolsos/:id/cancelar', asyncHandler(async (req, res) => {
    const id_reembolso = req.params.id;
    const id_funcionario = req.session.userId;

    const reembolso = await reembolsoService.cancelarReembolso(id_reembolso, id_funcionario);

    req.io.emit('reembolso:cancelado', {
        id_reembolso: reembolso.id_reembolso,
        id_venda: reembolso.id_venda
    });

    req.flash('success_msg', `Reembolso #${id_reembolso} cancelado!`);
    res.redirect(`/admin/vendas/detalhes/${reembolso.id_venda}`);
}));

module.exports = router;
