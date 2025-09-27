const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/handlers/async-handler');
const { enumValidation, numberValidation } = require('../../utils/data/data-validation');
const { parseDateValue, parseFloatValue } = require('../../utils/data/data-parsers');
const { createDesconto } = require('../../services/admin/descontosService');

router.post('/descontos/save', asyncHandler(async (req, res) => {
    const [parsedValor] = parseFloatValue(req.body.valor);
    const { tipo, observacao } = req.body;

    enumValidation(tipo, 'porcentagem', 'valor_fixo');
    numberValidation(parsedValor);

    await createDesconto({
        id_produto: req.body.id_produto,
        tipo,
        valor: parsedValor,
        data_inicio: req.body.data_inicio ? parseDateValue(req.body.data_inicio) : undefined,
        data_fim: req.body.data_fim ? parseDateValue(req.body.data_fim) : undefined,
        ativo: true,
        observacao: observacao
    })

    res.sendSuccess('Desconto criado com sucesso');
}));

module.exports = router;