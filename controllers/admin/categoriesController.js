const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/handlers/async-handler');
const Produtos = require('../../models/produto')
const { stringValidation, checkAssociations, numberValidation } = require('../../utils/data/data-validation');
const { parseIntValue } = require('../../utils/data/data-parsers');
const { getAllCategories, findCategoryById, createCategory, deleteCategory, updateCategory } = require('../../services/admin/categoriesService');

router.get('/categories/new', (req, res) => {
    res.render('admin/categories/new', { title: 'Nova Categoria' });
});

router.get('/categories', asyncHandler(async (req, res) => {
    const categories = await getAllCategories();

    res.render('admin/categories', { categories })
}));

router.get('/categories/edit/:id_categoria', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_categoria);

    numberValidation(parsedId);

    const category = await findCategoryById(parsedId);

    res.render('admin/categories/edit', { category })
}));

router.post('/categories/save', asyncHandler(async (req, res) => {
    const { nome } = req.body;

    stringValidation(nome);

    await createCategory({ nome });

        res.status(200).json({
        message: 'Categoria registrada com sucesso!',
        redirectUrl: '/admin/categories'
    });
}));

router.post('/categories/delete/:id_categoria', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_categoria);

    numberValidation(parsedId);

    await checkAssociations(Produtos,
        'id_categoria',
        parsedId,
        "Não é possível excluir a categoria, pois exitem produtos associados a ela."
    );

    await deleteCategory(parsedId);

    res.json({ message: 'Categoria excluída com sucesso' });
}));

router.post('/categories/update/:id_categoria', asyncHandler(async (req, res) => {
    const { nome } = req.body;
    const [parsedId] = parseIntValue(req.params.id_categoria);

    numberValidation(parsedId);
    stringValidation(nome);

    await updateCategory(parsedId, { nome });

        res.status(200).json({
        message: 'Categoria atualizada com sucesso!',
        redirectUrl: '/admin/categories'
    });
}));

module.exports = router;
