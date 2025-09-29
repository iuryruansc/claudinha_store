const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/handlers/async-handler');
const relatoriosService = require('../../services/admin/relatoriosService');

router.get('/relatorios/vendas', asyncHandler(async (req, res) => {
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0];

    const filters = {
        dataInicio: req.query.dataInicio || primeiroDiaMes,
        dataFim: req.query.dataFim || ultimoDiaMes
    };

    const relatorio = await relatoriosService.getRelatorioVendas(filters);

    res.render('admin/relatorios/vendas', {
        relatorio,
        filters
    });
}));

router.get('/relatorios/produtos', asyncHandler(async (req, res) => {
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0];

    const filters = {
        dataInicio: req.query.dataInicio || primeiroDiaMes,
        dataFim: req.query.dataFim || ultimoDiaMes
    };

    const relatorio = await relatoriosService.getRelatorioProdutos(filters);

    res.render('admin/relatorios/produtos', {
        relatorio,
        filters
    });
}));

module.exports = router;