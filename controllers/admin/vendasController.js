const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/handlers/async-handler');
const { requireCaixa } = require('../../utils/handlers/auth-handler');
const { getViewDependencies, getAllVendas, getEditData, deleteVenda, createVenda, updateVenda } = require('../../services/admin/vendasService');
const { parseIntValue, parseDateValue } = require('../../utils/data/data-parsers');
const { numberValidation, dateValidation, stringValidation, modelValidation } = require('../../utils/data/data-validation');
const formatDate = require('../../utils/data/date-formatter');
const Produto = require('../../models/produto')

router.get('/vendas', asyncHandler(async (req, res) => {
    const { vendas, caixas, clientes, funcionarios, produtos } = await getAllVendas();

    res.render('admin/vendas/index', { vendas, caixas, clientes, funcionarios, produtos, formatDate })
}));

router.use(requireCaixa);

router.get('/vendas/new', asyncHandler(async (req, res) => {
    const { caixas, clientes, funcionarios, produtos } = await getViewDependencies();

    res.render('admin/vendas/new', { caixas, clientes, funcionarios, produtos });
}));

router.get('/vendas/produtos/codigobarras/:codigo', asyncHandler(async (req, res) => {
    const codigo_barras = req.params.codigo;
    const produto = await Produto.findOne({ where: { codigo_barras } })
    modelValidation(produto);

    res.json(produto);
}));

router.get('/vendas/edit/:id_venda', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_venda);
    const produtos = await Produto.findAll();

    numberValidation(parsedId);

    const { venda, caixas, clientes, funcionarios } = await getEditData(parsedId);

    res.render('admin/vendas/edit', { venda, caixas, clientes, funcionarios, produtos })
}));

router.post('/vendas/save', asyncHandler(async (req, res) => {
    const [parsedValorTotal] = parseIntValue(req.body.valor_total);

    numberValidation(parsedValorTotal);

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
        id_caixa: req.body.id_caixa,
        data_hora: req.body.data_hora ? parseDateValue(req.body.data_hora) : undefined,
        itens: parsedItens,
        valor_total: parsedValorTotal,
        status: req.body.status || 'PENDENTE'
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
    const [parsedIdCliente, parsedIdFun, parsedValorTotal] = parseIntValue(req.body.id_cliente, req.body.id_funcionario, req.body.valor_total);

    numberValidation(parsedIdCliente, parsedIdFun, parsedIdVenda, parsedValorTotal);

    await updateVenda(parsedIdVenda, {
        id_cliente: parsedIdCliente,
        id_funcionario: parsedIdFun,
        id_caixa: req.body.id_caixa,
        data_hora: req.body.data_hora ? parseDateValue(req.body.data_hora) : undefined,
        valor_total: parsedValorTotal,
        status: req.body.status || 'PENDENTE'
    });

    res.redirect('/admin/vendas');
}));

module.exports = router;