const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/handlers/async-handler');
const formatDate = require('../../utils/data/date-formatter');
const { getAllMovs } = require('../../services/admin/movEstoqueService');

router.get('/movimentacoes', asyncHandler(async (req, res) => {
    const { movs, funcionarios } = await getAllMovs();

    res.render('admin/mov-estoque/index', { movs, funcionarios, formatDate })
}));

module.exports = router;