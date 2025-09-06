const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/handlers/async-handler');
const { getViewDependencies, getAllVendas, getEditData, deleteVenda, createVenda, updateVenda } = require('../services/vendasService');
const { parseIntValue, parseDateValue } = require('../utils/data-parsers');
const { numberValidation, dateValidation } = require('../utils/data-validation');
const formatDate = require('../utils/date-formatter');
const Produto = require('../models/produto')

router.get('/vendas/new', asyncHandler(async (req, res) => {
    const { caixas, clientes, funcionarios, produtos } = await getViewDependencies();

    res.render('admin/vendas/new', { caixas, clientes, funcionarios, produtos });
}));

router.get('/vendas', asyncHandler(async (req, res) => {
    const { vendas, caixas, clientes, funcionarios, produtos } = await getAllVendas();

    res.render('admin/vendas/index', { vendas, caixas, clientes, funcionarios, produtos, formatDate })
}));

router.get('/vendas/edit/:id_venda', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_venda);
    const produtos = await Produto.findAll();

    numberValidation(parsedId);

    const { venda, caixas, clientes, funcionarios } = await getEditData(parsedId);

    res.render('admin/vendas/edit', { venda, caixas, clientes, funcionarios, produtos })
}));

router.post('/vendas/save', asyncHandler(async (req, res) => {
    const [parsedIdCliente, parsedIdFun, parsedIdCaixa] = parseIntValue(req.body.id_cliente, req.body.id_funcionario, req.body.id_caixa);
    const parsedDataHora = req.body.data_hora ? parseDateValue(req.body.data_hora) : undefined;

    numberValidation(parsedIdCliente, parsedIdFun, parsedIdCaixa);
    dateValidation(parsedDataHora);

    if (!req.body.itens || !Array.isArray(req.body.itens)) {
        throw new Error("A venda deve conter pelo menos um item.");
    }

    const parsedItens = req.body.itens.map(item => {
        const [id_produto] = parseIntValue(item.id_produto);
        const [quantidade] = parseIntValue(item.quantidade);
        
        numberValidation(id_produto, quantidade);

        return {
            id_produto: id_produto,
            quantidade: quantidade
        }
    })

    const venda = await createVenda({
        id_cliente: parsedIdCliente,
        id_funcionario: parsedIdFun,
        id_caixa: parsedIdCaixa,
        data_hora: parsedDataHora,
        itens: parsedItens
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