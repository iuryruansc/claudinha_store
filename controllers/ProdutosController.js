const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/handlers/async-handler');
const { numberValidation, stringValidation } = require('../utils/data-validation');
const { parseIntValue, parseFloatValue } = require('../utils/data-parsers');
const { getAllProdutos, getViewDependencies, getProdutosByCategoria, getEditData, createProduto, deleteProduto, updateProduto } = require('../services/produtosService');

router.get('/produtos/new', asyncHandler(async (req, res) => {
    const categorias = await getViewDependencies();
    
    res.render('admin/produtos/new', { categorias });
}));

router.get('/produtos', asyncHandler(async (req, res) => {
    const { produtos, categorias } = await getAllProdutos();

    res.render('admin/produtos/index', {
        produtos,
        categorias,
        categoria_nome: null
    });
}));

router.get('/produtos/:id_categoria', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_categoria);

    numberValidation(parsedId);

    const { produtos, categoria } = await getProdutosByCategoria(parsedId);

    res.render('admin/produtos/index', {
        produtos,
        categoria_nome: categoria.nome,
        categorias: null
    });
}));

router.get('/produtos/edit/:id_produto', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_produto);

    numberValidation(parsedId);

    const { produto, categorias } = await getEditData(parsedId);

    res.render('admin/produtos/edit', { produto, categorias });
}));

router.post('/produtos/save', asyncHandler(async (req, res) => {
    const { nome, descricao, codigo_barras } = req.body;
    const [parsedId] = parseIntValue(req.body.id_categoria);
    const [parsedPreco] = parseFloatValue(req.body.preco);

    numberValidation(parsedId, parsedPreco);
    stringValidation(nome, descricao, codigo_barras);

    await createProduto({
        nome,
        descricao,
        preco: parsedPreco,
        codigo_barras,
        id_categoria: parsedId,
    });

    res.redirect('/admin/produtos');
}));

router.post('/produtos/delete/:id_produto', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_produto);

    numberValidation(parsedId);

    await deleteProduto(parsedId);

    res.redirect('/admin/produtos');
}));

router.post('/produtos/update/:id_produto', asyncHandler(async (req, res) => {
    const [parsedIdProd, parsedIdCat] = parseIntValue(req.params.id_produto, req.params.id_categoria)
    const { nome, descricao, codigo_barras } = req.body;
    const [parsedPreco] = parseFloatValue(req.body.preco);

    numberValidation(parsedIdProd, parsedIdCat, parsedPreco);
    stringValidation(nome, descricao, codigo_barras);

    await updateProduto(parsedIdProd, ({
        nome,
        descricao,
        preco: parsedPreco,
        codigo_barras,
        id_categoria: parsedIdCat
    }));

    res.redirect('/admin/produtos');
}));

module.exports = router;
