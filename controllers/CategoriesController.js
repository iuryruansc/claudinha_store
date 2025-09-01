const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/async-handler');
const Category = require('../models/Category');

router.get('/categories/new', (req, res) => {
    res.render('admin/categories/new', { title: 'Nova Categoria' });
});

router.get('/categories', asyncHandler(async (req, res) => {
    const categories = await Category.findAll();
    res.render('admin/categories/index', { categories })
}));

router.get('/categories/edit/:id_categoria', asyncHandler(async (req, res) => {
    const { id_categoria } = req.params;

    if (isNaN(id_categoria)) {
        const err = new Error('Erro ao editar categoria. ID inválido')
        err.status = 400;
        throw err;
    }

    const category = await Category.findByPk(id_categoria);

    if (!category) {
        const err = new Error('Categoria não encontrada.')
        err.status = 404;
        throw err;
    }

    res.render('admin/categories/edit', { category })
}));

router.post('/categories/save', asyncHandler(async (req, res) => {
    const { nome } = req.body;

    if (!nome) {
        const err = new Error('Dados inválidos ao salvar categoria')
        err.status = 400;
        throw err;
    }

    await Category.create({ nome });
    res.redirect('/admin/categories');
}));

router.post('/categories/delete/:id_categoria', asyncHandler(async (req, res) => {
    const { id_categoria } = req.params;

    if (!id_categoria || isNaN(id_categoria)) {
        const err = new Error('Erro ao deletar categoria. ID inválido')
        err.status = 400;
        throw err;
    }

    await Category.destroy({
        where: {
            id_categoria: id_categoria
        }
    });

    res.redirect('/admin/categories');
}));

router.post('/categories/update/:id_categoria', asyncHandler(async (req, res) => {
    const { id_categoria } = req.params;
    const { nome } = req.body;

    if (!id_categoria || isNaN(id_categoria) || !nome) {
        const err = new Error('Dados inválidos ao editar categoria.')
        err.status = 400;
        throw err;
    }

    await Category.update({ nome }, {
        where: {
            id_categoria
        }
    });

    res.redirect('/admin/categories');
}));

module.exports = router;
