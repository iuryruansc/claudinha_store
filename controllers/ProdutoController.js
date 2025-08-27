const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/async-handler');
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

    if (isNaN(id_categoria)) {
        const err = new Error('ID de categoria inválido.');
        err.status = 400;
        throw err;
    }

    const [produtos, categoria] = await Promise.all([
        Produto.findAll({ where: { id_categoria } }),
        Category.findByPk(id_categoria)
    ]);

    if (!categoria) {
        const err = new Error('Categoria não encontrada.');
        err.status = 404;
        throw err;
    }

    res.render('admin/produtos/index', {
        produtos,
        categoria_nome: categoria.nome,
        categorias: null
    });
}));

router.get('/produtos/edit/:id_produto', asyncHandler(async (req, res) => {
    const { id_produto } = req.params;
    const { id_categoria } = req.query;

    if (isNaN(id_produto)) {
        const err = new Error('ID do produto inválido.');
        err.status = 400;
        throw err;
    }

    const [produto, categories] = await Promise.all([
        Produto.findByPk(id_produto),
        Category.findAll()
    ]);

    if (!produto) {
        const err = new Error('Produto não encontrado.');
        err.status = 404;
        throw err;
    }

    res.render('admin/produtos/edit', { produto, categories, id_categoria });
}));

router.post('/produtos/save', asyncHandler(async (req, res) => {
    const { nome, descricao, preco, codigo_barras, id_categoria } = req.body;

    if (!nome || !descricao || isNaN(parseFloat(preco)) || !id_categoria) {
        const err = new Error('Dados inválidos para criar produto.');
        err.status = 400;
        throw err;
    }

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

    if (isNaN(id_produto)) {
        const err = new Error('ID do produto inválido para exclusão.');
        err.status = 400;
        throw err;
    }

    await Produto.destroy({
        where: { id_produto }
    });

    res.redirect('/admin/produtos');
}));

router.post('/produtos/update/:id_produto', asyncHandler(async (req, res) => {
    const { id_produto } = req.params;
    const { nome, descricao, preco, codigo_barras, id_categoria } = req.body;

    if (isNaN(id_produto) || !nome || !descricao || isNaN(parseFloat(preco)) || !id_categoria) {
        const err = new Error('Dados inválidos para atualizar produto.');
        err.status = 400;
        throw err;
    }

    await Produto.update({
        nome,
        descricao,
        preco: parseFloat(preco),
        codigo_barras,
        id_categoria
    }, {
        where: { id_produto }
    });

    res.redirect('/admin/produtos');
}));

module.exports = router;
