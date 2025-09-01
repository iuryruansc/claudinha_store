const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/async-handler');
const { idValidation, modelValidation, stringValidation, checkAssociations } = require('../utils/data-validation');
const Category = require('../models/Category');
const Produtos = require('../models/Produto')

router.get('/categories/new', (req, res) => {
    res.render('admin/categories/new', { title: 'Nova Categoria' });
});

router.get('/categories', asyncHandler(async (req, res) => {
    const categories = await Category.findAll();
    res.render('admin/categories/index', { categories })
}));

router.get('/categories/edit/:id_categoria', asyncHandler(async (req, res) => {
    const { id_categoria } = req.params;

    idValidation(id_categoria);

    const category = await Category.findByPk(id_categoria);

    modelValidation(category);

    res.render('admin/categories/edit', { category })
}));

router.post('/categories/save', asyncHandler(async (req, res) => {
    const { nome } = req.body;

    stringValidation(nome);

    await Category.create({ nome });
    res.redirect('/admin/categories');
}));

router.post('/categories/delete/:id_categoria', asyncHandler(async (req, res) => {
    const { id_categoria } = req.params;

    idValidation(id_categoria);

    const category = await Category.findByPk(id_categoria);

    modelValidation(category);

    await checkAssociations(Produtos,
        'id_categoria',
        id_categoria,
        "Não é possível excluir a categoria, pois exitem produtos associados a ela."
    );

    await category.destroy();

    res.redirect('/admin/categories');
}));

router.post('/categories/update/:id_categoria', asyncHandler(async (req, res) => {
    const { id_categoria } = req.params;
    const { nome } = req.body;

    idValidation(id_categoria);
    stringValidation(nome);

    const category = await Category.findByPk(id_categoria);
    modelValidation(category);

    await category.update()

    res.redirect('/admin/categories');
}));

module.exports = router;
