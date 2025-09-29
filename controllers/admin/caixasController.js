const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/handlers/async-handler');
const { numberValidation } = require('../../utils/data/data-validation');
const { parseIntValue, parseFloatValue } = require('../../utils/data/data-parsers');
const formatDate = require('../../utils/data/date-formatter');
const {  getAllCaixas, deleteCaixa, findCaixaById, openCaixa, closeCaixa, findCaixaDetailsById } = require('../../services/admin/caixasService');

router.get('/caixas', asyncHandler(async (req, res) => {
    const { caixas } = await getAllCaixas();
    res.render('admin/caixas/index', { caixas, formatDate })
}));

router.post('/caixas/delete/:id_caixa', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_caixa);
    const caixa = await findCaixaById(req.params.id_caixa);

    if (caixa.status === 'aberto') {
        return res.status(400).json({
            error: {
                message: 'Não é possível excluir um caixa que ainda está aberto.'
            }
        });
    }

    numberValidation(parsedId);

    await deleteCaixa(parsedId);

    res.redirect('/admin/caixas');
}));

router.post('/caixa/abrir', asyncHandler(async (req, res) => {
    const [parsedIdPdv] = parseIntValue(req.body.id_pdv);
    const [parsedSaldoInicial] = parseFloatValue(req.body.saldo_inicial);

    numberValidation(parsedIdPdv, parsedSaldoInicial);

    const caixa = await openCaixa({
        id_pdv: parsedIdPdv,
        id_funcionario: req.session.cargo === 'admin' ? 1 : req.session.userId,
        saldo_inicial: parsedSaldoInicial
    });

    req.session.caixaId = caixa.id_caixa;
    await new Promise((resolve, reject) => {
        req.session.save(err => err ? reject(err) : resolve());
    });

    return res.redirect('/admin/dashboard');
}));

router.post('/caixa/fechar', asyncHandler(async (req, res) => {
    const [parsedIdCaixa] = parseIntValue(req.body.id_caixa);
    const [parsedSaldoFinal] = parseFloatValue(req.body.saldo_final);

    numberValidation(parsedIdCaixa, parsedSaldoFinal);

    await closeCaixa({
        id_caixa: parsedIdCaixa,
        saldo_final: parsedSaldoFinal
    });

    delete req.session.caixaId;
    await new Promise((resolve, reject) => {
        req.session.save(err => err ? reject(err) : resolve());
    });

    res.redirect('/admin/dashboard');
}));

router.get('/caixas/detalhes/:id', asyncHandler(async (req, res) => {
    const { caixa, resumoFinanceiro } = await findCaixaDetailsById(req.params.id);
    res.render('admin/caixas/detalhes', { caixa, resumoFinanceiro, formatDate });
}));

module.exports = router;
