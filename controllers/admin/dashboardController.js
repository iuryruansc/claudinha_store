const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/handlers/async-handler');
const formatDate = require('../../utils/data/date-formatter');
const { getProdutoByCodigoBarras } = require('../../services/admin/produtosService');
const { getDashboardData } = require('../../services/admin/dashboardService');

router.get('/dashboard', asyncHandler(async (req, res) => {
    const userId = req.session.userId;

    const dashboardData = await getDashboardData(userId);

    res.render('admin/dashboard', { ...dashboardData, erro: req.query.erro, formatDate });
}));

router.get('/dashboard/entrada/iniciar', asyncHandler(async (req, res) => {
    const { codigo_barras } = req.query;

    if (!codigo_barras) {
        return res.status(400).json({ error: 'Código de barras é obrigatório.' });
    }

    const produto = await getProdutoByCodigoBarras(codigo_barras);

    res.json({ id_produto: produto.id_produto, nome: produto.nome, preco_compra: produto.preco_compra, preco_venda: produto.preco_venda });
}));

module.exports = router;