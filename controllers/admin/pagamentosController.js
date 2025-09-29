const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/handlers/async-handler');
const pagamentosService = require('../../services/admin/pagamentosService');

router.get('/pagamentos', asyncHandler(async (req, res) => {
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth() + 1;

    const anoSelecionado = parseInt(req.query.ano, 10) || anoAtual;
    const mesSelecionado = parseInt(req.query.mes, 10) || mesAtual;

    const [historico, periodosDisponiveis] = await Promise.all([
        pagamentosService.getHistoricoPagamentos({ ano: anoSelecionado, mes: mesSelecionado }),
        pagamentosService.getPeriodosDisponiveis()
    ]);

    res.render('admin/pagamentos/index', {
        historico,
        periodosDisponiveis,
        anoSelecionado,
        mesSelecionado
    });
}));

router.get('/pagamentos/contas-a-receber', asyncHandler(async (req, res) => {
    const contas = await pagamentosService.getContasAReceber();
    res.render('admin/pagamentos/contas-a-receber', { contas });
}));

router.get('/pagamentos/parcelas-a-receber', asyncHandler(async (req, res) => {
    const vendas = await pagamentosService.getParcelasAReceber();
    res.render('admin/pagamentos/parcelas-a-receber', { vendas });
}));

router.post('/parcelas/quitar', asyncHandler(async (req, res) => {
    const { parcelasIds } = req.body;
    if (!parcelasIds || parcelasIds.length === 0) {
        throw new Error('Nenhuma parcela foi selecionada para quitação.');
    }
    const ids = Array.isArray(parcelasIds) ? parcelasIds : [parcelasIds];
    await pagamentosService.quitarParcelas(ids);
    res.redirect('/admin/pagamentos/parcelas-a-receber');
}));

router.post('/pagamentos/registrar', asyncHandler(async (req, res) => {
    const dadosPagamento = {
        id_venda: req.body.id_venda,
        valor_pago: req.body.valor_pago,
        forma_pagamento: req.body.forma_pagamento
    };
    if (!dadosPagamento.id_venda || !dadosPagamento.valor_pago || !dadosPagamento.forma_pagamento) {
        throw new Error('Dados de pagamento incompletos.');
    }
    await pagamentosService.registrarPagamentoPendente(dadosPagamento);
    res.redirect('/admin/pagamentos/contas-a-receber');
}));

module.exports = router;
