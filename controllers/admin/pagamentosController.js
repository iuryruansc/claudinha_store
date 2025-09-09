const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/handlers/async-handler');
const { numberValidation, enumValidation } = require('../../utils/data/data-validation');
const { parseIntValue, parseFloatValue } = require('../../utils/data/data-parsers');
const { getAllPagamentos, getViewDependencies, deletePagamento, createPagamento } = require('../../services/admin/pagamentosService');

router.get('/pagamentos/new/:id_venda', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_venda)

    res.render('admin/pagamentos/new', { id_venda: parsedId });
}));

router.get('/pagamentos', asyncHandler(async (req, res) => {
    const { pagamentos, vendas } = await getAllPagamentos();

    res.render('admin/pagamentos/index', { pagamentos, vendas, });
}));

router.get('/pagamentos/edit/:id_pagamento', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_pagamento);

    numberValidation(parsedId);

    const { pagamento, vendas } = await getEditData(parsedId);

    res.render('admin/pagamentos/edit', { pagamento, vendas });
}));

router.post('/pagamentos/save', asyncHandler(async (req, res) => {
    const { forma_pagamento } = req.body;
    const [parsedId, parsedParcelas] = parseIntValue(req.body.id_venda, req.body.parcelas);
    const [parsedValor] = parseFloatValue(req.body.valor_total);

    numberValidation(parsedId, parsedValor, parsedParcelas);
    enumValidation(forma_pagamento, 'dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'outro');

    await createPagamento({
        id_venda: parsedId,
        forma_pagamento,
        valor_total: parsedValor,
        parcelas: parsedParcelas
    });

    res.redirect('/admin/vendas');
}));

router.post('/pagamentos/delete/:id_pagamento', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_pagamento);

    numberValidation(parsedId);

    await deletePagamento(parsedId);

    res.redirect('/admin/pagamentos');
}));

router.post('/pagamentos/update/:id_pagamento', asyncHandler(async (req, res) => {
    const [parsedIdPag] = parseIntValue(req.params.id_pagamento)
    const { forma_pagamento } = req.body;
    const [parsedIdVenda, parsedParcelas] = parseIntValue(req.body.id_venda, req.body.parcelas);
    const [parsedValor] = parseFloatValue(req.body.valor_total);

    numberValidation(parsedIdPag, parsedIdVenda, parsedValor, parsedParcelas);
    enumValidation(forma_pagamento, 'dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'outro');

    await updateProduto(parsedIdPag, ({
        id_venda: parsedIdVenda,
        forma_pagamento,
        valor_total: parsedValor,
        parcelas: parsedParcelas
    }));

    res.redirect('/admin/pagamentos');
}));

module.exports = router;
