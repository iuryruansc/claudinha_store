const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/handlers/async-handler');
const formatDate = require('../utils/date-formatter');
const { getAllMovs } = require('../services/movEstoqueService');

router.get('/movimentacoes', asyncHandler(async (req, res) => {
    const {movs, funcionarios, produtos} = await getAllMovs();

    console.log(movs[1].estoque);
    

    res.render('admin/mov-estoque/index', { movs, funcionarios, produtos, formatDate })
}));

module.exports = router;