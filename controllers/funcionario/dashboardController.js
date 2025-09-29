const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/handlers/async-handler');
const Venda = require('../../models/venda');
const Pagamento = require('../../models/pagamento');
const PagamentoParcial = require('../../models/pagamentoParcial');
const Pdv = require('../../models/pdv');
const Caixa = require('../../models/caixa')
const { Op } = require('sequelize');
const { openCaixa, closeCaixa } = require('../../services/admin/caixasService');

router.get('/dashboard', asyncHandler(async (req, res) => {
    const userId = req.session.userId;
    const user = req.session.user;

    const caixaAtivo = await Caixa.findOne({
        where: { id_funcionario: userId, data_fechamento: null },
        include: [{ model: Pdv, as: 'pdv' }]
    });

    let resumoCaixa = null;
    let pdvsDisponiveis = [];

    if (caixaAtivo) {
        const vendasNoCaixa = await Venda.findAll({ where: { id_caixa: caixaAtivo.id_caixa } });
        const idsVendas = vendasNoCaixa.map(v => v.id_venda);

        const [pagamentos, pagamentosParciais] = await Promise.all([
            Pagamento.findAll({ where: { id_venda: { [Op.in]: idsVendas } } }),
            PagamentoParcial.findAll({ where: { id_venda: { [Op.in]: idsVendas } } })
        ]);

        const todosPagamentos = [...pagamentos, ...pagamentosParciais];
        const totalRecebidoDinheiro = todosPagamentos
            .filter(p => p.forma_pagamento === 'dinheiro')
            .reduce((acc, p) => acc + parseFloat(p.valor_total || p.valor_pago), 0);

        resumoCaixa = {
            numVendas: vendasNoCaixa.length,
            saldoEsperado: parseFloat(caixaAtivo.saldo_inicial) + totalRecebidoDinheiro
        };

    } else {
        pdvsDisponiveis = await Pdv.findAll({ where: { status: 'ativo' } });
    }

    res.render('funcionario/dashboard', {
        caixa: caixaAtivo,
        resumoCaixa,
        pdvs: pdvsDisponiveis,
        user
    });
}));

router.post('/caixa/abrir', asyncHandler(async (req, res) => {
    const { id_pdv, saldo_inicial } = req.body;
    const id_funcionario = req.session.userId;

    if (!id_pdv || !saldo_inicial) {
        req.flash('error_msg', 'PDV e Saldo Inicial são obrigatórios.');
        return res.redirect('/funcionario/dashboard');
    }

    await openCaixa({
        id_pdv,
        saldo_inicial,
        id_funcionario
    });

    req.flash('success_msg', 'Caixa aberto com sucesso! Boas vendas.');
    res.redirect('/funcionario/dashboard');
}));

router.post('/caixa/fechar', asyncHandler(async (req, res) => {
    const { id_caixa, saldo_final } = req.body;
    
    if (!id_caixa || !saldo_final) {
        req.flash('error_msg', 'Saldo final é obrigatório para fechar o caixa.');
        return res.redirect('/funcionario/dashboard');
    }
    await closeCaixa({
        id_caixa,
        saldo_final
    });

    req.flash('success_msg', 'Caixa fechado com sucesso!');
    res.redirect('/funcionario/dashboard');
}));

module.exports = router;