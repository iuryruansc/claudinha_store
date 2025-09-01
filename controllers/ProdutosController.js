const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/async-handler');
const { idValidation, modelValidation, stringValidation, numberValidation } = require('../utils/data-validation');
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
    const { id_categoria } = req.params;

    idValidation(id_categoria);

    const [produtos, categoria] = await Promise.all([
        Produto.findAll({ where: { id_categoria } }),
        Category.findByPk(id_categoria)
    ]);

    modelValidation(categoria);

    res.render('admin/produtos/index', {
        produtos,
        categoria_nome: categoria.nome,
        categorias: null
    });
}));

router.get('/produtos/edit/:id_produto', asyncHandler(async (req, res) => {
    const { id_produto } = req.params;
    const { id_categoria } = req.query;

    idValidation(id_produto);
    idValidation(id_categoria);

    const [produto, categories] = await Promise.all([
        Produto.findByPk(id_produto),
        Category.findAll()
    ]);

    modelValidation(produto);

    res.render('admin/produtos/edit', { produto, categories, id_categoria });
}));

router.post('/produtos/save', asyncHandler(async (req, res) => {
    const { nome, descricao, preco, codigo_barras, id_categoria } = req.body;

    idValidation(id_categoria);
    stringValidation(nome, descricao, codigo_barras);
    numberValidation(parseFloat(preco));

    const category = await Category.findByPk(id_categoria);
    modelValidation(category);

    await Produto.create({
        nome,
        descricao,
        preco: parseFloat(preco),
        codigo_barras,
        id_categoria,
    });

    res.redirect('/admin/produtos');
}));

router.post('/produtos/delete/:id_produto', asyncHandler(async (req, res) => {
    const { id_produto } = req.params;

    idValidation(id_produto);

    const produto = await Produto.findByPk(id_produto);
    modelValidation(produto);

    await produto.destroy();

    res.redirect('/admin/produtos');
}));

router.post('/produtos/update/:id_produto', asyncHandler(async (req, res) => {
    const { id_produto } = req.params;
    const { nome, descricao, preco, codigo_barras, id_categoria } = req.body;

    idValidation(id_produto, id_categoria);
    stringValidation(nome, descricao, codigo_barras);
    numberValidation(parseFloat(preco));

    const produto= await Produto.findByPk(id_produto);

    modelValidation(produto);

    await produto.update({
        nome,
        descricao,
        preco: parseFloat(preco),
        codigo_barras,
        id_categoria
    });

    res.redirect('/admin/produtos');
}));

module.exports = router;
