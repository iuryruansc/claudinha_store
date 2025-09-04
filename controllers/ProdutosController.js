const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/handlers/async-handler');
const { numberValidation, modelValidation, stringValidation } = require('../utils/data-validation');
const { parseIntValue, parseFloatValue } = require('../utils/data-parsers');
const Category = require('../models/Category');
const Produto = require('../models/Produto');

router.get('/produtos/new', asyncHandler(async (req, res) => {
    const categories = await Category.findAll();
    res.render('admin/produtos/new', { categories });
}));

router.get('/produtos', asyncHandler(async (req, res) => {
    const [produtos, categorias] = await Promise.all([
        Produto.findAll(),
        Category.findAll()
    ]);
    res.render('admin/produtos/index', {
        produtos,
        categorias,
        categoria_nome: null
    });
}));

router.get('/produtos/:id_categoria', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_categoria);

    numberValidation(parsedId);

    const [produtos, categoria] = await Promise.all([
        Produto.findAll({ where: { id_categoria: parsedId } }),
        Category.findByPk(parsedId)
    ]);

    modelValidation(categoria);

    res.render('admin/produtos/index', {
        produtos,
        categoria_nome: categoria.nome,
        categorias: null
    });
}));

router.get('/produtos/edit/:id_produto', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_produto);

    numberValidation(parsedId);

    const [produto, categories] = await Promise.all([
        Produto.findByPk(parsedId),
        Category.findAll()
    ]);

    modelValidation(produto);

    res.render('admin/produtos/edit', { produto, categories });
}));

router.post('/produtos/save', asyncHandler(async (req, res) => {
    const { nome, descricao, codigo_barras } = req.body;
    const [parsedId] = parseIntValue(req.body.id_categoria);
    const [parsedPreco] = parseFloatValue(req.body.preco);

    numberValidation(parsedId, parsedPreco);
    stringValidation(nome, descricao, codigo_barras);

    const category = await Category.findByPk(parsedId);
    modelValidation(category);

    await Produto.create({
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

    const produto = await Produto.findByPk(parsedId);
    modelValidation(produto);

    await produto.destroy();

    res.redirect('/admin/produtos');
}));

router.post('/produtos/update/:id_produto', asyncHandler(async (req, res) => {
    const [parsedIdProd, parsedIdCat] = parseIntValue(req.params.id_produto, req.params.id_categoria)
    const { nome, descricao, codigo_barras } = req.body;
    const [parsedPreco] = parseFloatValue(req.body.preco);

    numberValidation(parsedIdProd, parsedIdCat, parsedPreco);
    stringValidation(nome, descricao, codigo_barras);

    const produto = await Produto.findByPk(parsedIdProd);

    modelValidation(produto);

    await produto.update({
        nome,
        descricao,
        preco: parsedPreco,
        codigo_barras,
        id_categoria: parsedIdCat
    });

    res.redirect('/admin/produtos');
}));

module.exports = router;
