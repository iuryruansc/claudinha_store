const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/async-handler');
const { idValidation, modelValidation, stringValidation, numberValidation } = require('../utils/data-validation');
const Estoque = require('../models/Estoque');
const Produto = require('../models/Produto');

router.get('/estoques/new', asyncHandler(async (req, res) => {
    const produtos = await Produto.findAll();
    res.render('admin/estoques/new', { produtos });
}));

router.get('/estoques', asyncHandler(async (req, res) => {
    const [estoques, produtos] = await Promise.all([
        Estoque.findAll(),
        Produto.findAll()
    ]);
    res.render('admin/estoques/index', { estoques, produtos });
}));

router.get('/estoques/edit/:id_estoque', asyncHandler(async (req, res) => {
    const { id_estoque } = req.params;

    idValidation(id_estoque);

    const [estoque, produtos] = await Promise.all([
        Estoque.findByPk(id_estoque),
        Produto.findAll()
    ]);

    modelValidation(estoque);

    res.render('admin/estoques/edit', { estoque, produtos })
}));

router.post('/estoques/save', asyncHandler(async (req, res) => {
    const { id_produto, quantidade_atual, localizacao } = req.body;

    idValidation(id_produto);
    numberValidation(parseInt(quantidade_atual));
    stringValidation(localizacao);

    await Estoque.create({ id_produto, quantidade_atual, localizacao });

    res.redirect('/admin/estoques');
}));

router.post('/estoques/delete/:id_estoque', asyncHandler(async (req, res) => {
    const { id_estoque } = req.params;

    idValidation(id_estoque);

    const estoque = await Estoque.findByPk(id_estoque);

    modelValidation(estoque);

    await estoque.destroy();

    res.redirect('/admin/estoques');
}));

router.post('/estoques/update/:id_estoque', asyncHandler(async (req, res) => {
    const { id_estoque } = req.params;
    const { quantidade_atual, localizacao } = req.body;

    idValidation(id_estoque);
    stringValidation(localizacao);
    numberValidation(parseInt(quantidade_atual));

    const estoque = await Estoque.findByPk(id_estoque);

    modelValidation(estoque);

    console.log('Dados a serem atualizados:', req.body)

    await estoque.update({
        quantidade_atual: parseInt(quantidade_atual),
        localizacao
    });

    res.redirect('/admin/estoques');
}));

module.exports = router;
