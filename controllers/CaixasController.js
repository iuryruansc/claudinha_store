const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/handlers/async-handler');
const { modelValidation, stringValidation, enumValidation, numberValidation, dateValidation } = require('../utils/data-validation');
const { parseIntValue, parseFloatValue, parseDateValue } = require('../utils/data-parsers');
const Caixa = require('../models/Caixa');
const Pdv = require('../models/Pdvs');
const Funcionario = require('../models/Funcionarios');
const  formatDate = require('../utils/date-formatter');

router.get('/caixas/new', asyncHandler(async (req, res) => {
    const [pdvs, funcionarios] = await Promise.all([
        Pdv.findAll(),
        Funcionario.findAll()
    ]);
    res.render('admin/caixas/new', { pdvs, funcionarios});
}));

router.get('/caixas', asyncHandler(async (req, res) => {
    const [caixas, pdvs, funcionarios] = await Promise.all([
        Caixa.findAll(),
        Pdv.findAll(),
        Funcionario.findAll()
    ]);
    res.render('admin/caixas/index', { caixas, pdvs, funcionarios, formatDate })
}));

router.get('/caixas/edit/:id_caixa', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_caixa);

    numberValidation(parsedId);

        const [caixa, pdvs, funcionarios] = await Promise.all([
        Caixa.findByPk(parsedId),
        Pdv.findAll(),
        Funcionario.findAll()
    ]);

    modelValidation(caixa);

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

    await Caixa.create({
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

    const caixa = await Caixa.findByPk(parsedId);
    modelValidation(caixa);

    await caixa.destroy()

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

    const caixa = await Caixa.findByPk(parsedIdCaixa);
    modelValidation(caixa);

    await caixa.update({
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
