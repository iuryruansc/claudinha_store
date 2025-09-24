const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/handlers/async-handler');
const { stringValidation, enumValidation, numberValidation, dateValidation } = require('../../utils/data/data-validation');
const { parseIntValue, parseFloatValue, parseDateValue } = require('../../utils/data/data-parsers');
const formatDate = require('../../utils/data/date-formatter');
const { getViewDependencies, getAllCaixas, createCaixa, getEditData, updateCaixa, deleteCaixa, findCaixaById } = require('../../services/admin/caixasService');

router.get('/caixas/new', asyncHandler(async (req, res) => {
    const { pdvs, funcionarios } = await getViewDependencies();
    res.render('admin/caixas/new', { pdvs, funcionarios });
}));

router.get('/caixas', asyncHandler(async (req, res) => {
    const { caixas, pdvs, funcionarios } = await getAllCaixas();
    res.render('admin/caixas/index', { caixas, pdvs, funcionarios, formatDate })
}));

router.get('/caixas/edit/:id_caixa', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_caixa);

    numberValidation(parsedId);

    const { caixa, pdvs, funcionarios } = await getEditData(parsedId);

    res.render('admin/caixas/edit', { caixa, pdvs, funcionarios })
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

router.post('/caixa/abrir', asyncHandler(async (req, res) => {
    const [parsedIdPdv] = parseIntValue(req.body.id_pdv);
    const [parsedSaldoInicial] = parseFloatValue(req.body.saldo_inicial);
    const isAdmin = req.session.cargo === 'admin';

    console.log(req.body, typeof parsedIdPdv, typeof parsedSaldoInicial);


    numberValidation(parsedIdPdv, parsedSaldoInicial);

    const caixa = await createCaixa({
        id_pdv: parsedIdPdv,
        id_funcionario: isAdmin ? null : req.session.userId,
        saldo_inicial: parsedSaldoInicial,
        data_fechamento: null,
        status: 'aberto'
    });

    req.session.caixaId = caixa.id_caixa;

    await new Promise((resolve, reject) => {
        req.session.save(err => err ? reject(err) : resolve());
    });

    return res.redirect('/admin/dashboard');
}));

router.post('/caixa/fechar', asyncHandler(async (req, res) => {
    const [parsedIdCaixa] = parseIntValue(req.session.caixaId);
    const [parsedSaldoFinal] = parseFloatValue(req.body.saldo_final);

    numberValidation(parsedIdCaixa, parsedSaldoFinal);

    await updateCaixa(parsedIdCaixa, {
        saldo_final: parsedSaldoFinal,
        data_fechamento: new Date(),
        status: 'fechado'
    });

    delete req.session.caixaId;

    res.redirect('/admin/dashboard');
}));

module.exports = router;
