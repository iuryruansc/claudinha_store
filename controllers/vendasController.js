const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/handlers/async-handler');
const { getViewDependencies, getAllVendas, getEditData, deleteVenda, createVenda, updateVenda } = require('../services/vendasService');
const { parseIntValue, parseDateValue } = require('../utils/data-parsers');
const { numberValidation, dateValidation } = require('../utils/data-validation');
const formatDate = require('../utils/date-formatter');

router.get('/vendas/new', asyncHandler(async (req, res) => {
    const { caixas, clientes, funcionarios } = await getViewDependencies();

    res.render('admin/vendas/new', { caixas, clientes, funcionarios });
}));

router.get('/vendas', asyncHandler(async (req, res) => {
    const { vendas, caixas, clientes, funcionarios } = await getAllVendas();

    res.render('admin/vendas/index', { vendas, caixas, clientes, funcionarios, formatDate })
}));

router.get('/vendas/edit/:id_venda', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_venda);

    numberValidation(parsedId);

    const { venda, caixas, clientes, funcionarios } = await getEditData(parsedId);

    res.render('admin/vendas/edit', { venda, caixas, clientes, funcionarios })
}));

router.post('/vendas/save', asyncHandler(async (req, res) => {
    const [parsedIdCliente, parsedIdFun, parsedIdCaixa] = parseIntValue(req.body.id_cliente, req.body.id_funcionario, req.body.id_caixa);
    const parsedDataHora = req.body.data_hora ? parseDateValue(req.body.data_hora) : undefined;

    numberValidation(parsedIdCliente, parsedIdFun, parsedIdCaixa);
    dateValidation(parsedDataHora);

    const venda = await createVenda({
        id_cliente: parsedIdCliente,
        id_funcionario: parsedIdFun,
        id_caixa: parsedIdCaixa,
        data_hora: parsedDataHora
    });

    res.redirect(`/admin/pagamentos/new/${venda.id_venda}`);
}));

router.post('/vendas/delete/:id_venda', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_venda);

    numberValidation(parsedId);

    await deleteVenda(parsedId);

    res.redirect('/admin/vendas');
}));

router.post('/vendas/update/:id_venda', asyncHandler(async (req, res) => {
    const [parsedIdVenda] = parseIntValue(req.params.id_venda);
    const [parsedIdCliente, parsedIdFun, parsedIdCaixa] = parseIntValue(req.body.id_cliente, req.body.id_funcionario, req.body.id_caixa);
    const parsedDataHora = req.body.data_hora ? parseDateValue(req.body.data_hora) : undefined;

    numberValidation(parsedIdCliente, parsedIdFun, parsedIdCaixa);
    dateValidation(parsedDataHora);

    await updateVenda(parsedIdVenda, {
        id_cliente: parsedIdCliente,
        id_funcionario: parsedIdFun,
        id_caixa: parsedIdCaixa,
        data_hora: parsedDataHora
    });

    res.redirect('/admin/vendas');
}));

module.exports = router;