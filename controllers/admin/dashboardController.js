const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/handlers/async-handler');
const formatDate = require('../../utils/data/date-formatter');
const { getRecentActivity } = require('../../services/admin/movEstoqueService');
const { getLowStockLotes } = require('../../services/admin/lotesService');

router.get('/dashboard', asyncHandler(async (req, res) => {
    const atividades = await getRecentActivity();
    const lotesBaixoEstoque = await getLowStockLotes();

    res.render('admin/dashboard', { atividades, lotesBaixoEstoque, formatDate });
}));

module.exports = router;