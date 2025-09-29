const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/handlers/async-handler');
const { createDescontoParaLoteMaisProximo } = require('../../services/admin/descontosService');

router.post('/descontos/save', asyncHandler(async (req, res) => {
    const dadosDesconto = {
        id_produto: req.body.id_produto,
        tipo: req.body.tipo,
        valor: req.body.valor,
        data_inicio: req.body.data_inicio,
        data_fim: req.body.data_fim,
        observacao: req.body.observacao
    };

    await createDescontoParaLoteMaisProximo(dadosDesconto);

    res.redirect('/admin/dashboard');
}));

module.exports = router;