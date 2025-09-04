const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/handlers/async-handler');
const { stringValidation, enumValidation, numberValidation, dateValidation } = require('../utils/data-validation');
const { parseIntValue, parseFloatValue, parseDateValue } = require('../utils/data-parsers');
const formatDate = require('../utils/date-formatter');
const { getViewDependencies, getAllCaixas, createCaixa, getEditData, updateCaixa, deleteCaixa } = require('../services/caixasService');

router.get('/caixas/new', asyncHandler(async (req, res) => {
    const {pdvs, funcionarios} = await getViewDependencies();
    res.render('admin/caixas/new', { pdvs, funcionarios });
}));

router.get('/caixas', asyncHandler(async (req, res) => {
    const {caixas, pdvs, funcionarios} = await getAllCaixas();
    res.render('admin/caixas/index', { caixas, pdvs, funcionarios, formatDate })
}));

router.get('/caixas/edit/:id_caixa', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_caixa);
    numberValidation(parsedId);

    const {caixa, pdvs, funcionarios} = await getEditData(parsedId);

    res.render('admin/caixas/edit', { caixa, pdvs, funcionarios })
}));

router.post('/caixas/save', asyncHandler(async (req, res) => {
    const [parsedIdPdv, parsedIdFun] = parseIntValue(req.body.id_pdv, req.body.id_funcionario);
    const [parsedSaldoInicial, parsedSaldoFinal] = parseFloatValue(req.body.saldo_inicial, req.body.saldo_final);
    const { status } = req.body;
    const parsedDataAbertura = req.body.data_abertura ? parseDateValue(req.body.data_abertura) : undefined;
    const parsedDataFechamento = req.body.data_fechamento ? parseDateValue(req.body.data_fechamento) : null;

    numberValidation(parsedIdPdv, parsedIdFun, parsedSaldoInicial, parsedSaldoFinal);
    stringValidation(status);
    dateValidation(parsedDataAbertura, parsedDataFechamento);
    enumValidation(status, 'aberto', 'fechado');

    await createCaixa({
        id_pdv: parsedIdPdv,
        id_funcionario: parsedIdFun,
        data_abertura: parsedDataAbertura,
        data_fechamento: parsedDataFechamento,
        saldo_inicial: parsedSaldoInicial,
        saldo_final: parsedSaldoFinal,
        status
    });

    res.redirect('/admin/caixas');
}));

router.post('/caixas/delete/:id_caixa', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_caixa);
    
    numberValidation(parsedId);

    await deleteCaixa(parsedId);

    res.redirect('/admin/caixas');
}));

router.post('/caixas/update/:id_caixa', asyncHandler(async (req, res) => {
    const [parsedIdCaixa] = parseIntValue(req.params.id_caixa);
    const [parsedIdPdv, parsedIdFun] = parseIntValue(req.body.id_pdv, req.body.id_funcionario);
    const [parsedSaldoInicial, parsedSaldoFinal] = parseFloatValue(req.body.saldo_inicial, req.body.saldo_final);
    const { status } = req.body;
    const parsedDataAbertura = req.body.data_abertura ? parseDateValue(req.body.data_abertura) : undefined;
    const parsedDataFechamento = req.body.data_fechamento ? parseDateValue(req.body.data_fechamento) : null;

    numberValidation(parsedIdCaixa, parsedIdPdv, parsedIdFun, parsedSaldoInicial, parsedSaldoFinal);
    stringValidation(status);
    dateValidation(parsedDataAbertura, parsedDataFechamento);
    enumValidation(status, 'aberto', 'fechado');

    await updateCaixa(parsedIdCaixa, {
        id_pdv: parsedIdPdv,
        id_funcionario: parsedIdFun,
        data_abertura: parsedDataAbertura,
        data_fechamento: parsedDataFechamento,
        saldo_inicial: parsedSaldoInicial,
        saldo_final: parsedSaldoFinal,
        status
    });

    res.redirect('/admin/caixas');
}));

module.exports = router;
