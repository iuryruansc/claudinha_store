const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/handlers/async-handler');
const { modelValidation, stringValidation, numberValidation } = require('../utils/data-validation');
const { parseIntValue, parseFloatValue } = require('../utils/data-parsers');
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
    const [parsedId] = parseIntValue(req.params.id_estoque);

    numberValidation(parsedId);

    const [estoque, produtos] = await Promise.all([
        Estoque.findByPk(parsedId),
        Produto.findAll()
    ]);

    modelValidation(estoque);

    res.render('admin/estoques/edit', { estoque, produtos })
}));

router.post('/estoques/save', asyncHandler(async (req, res) => {
    const { localizacao } = req.body;
    const [parsedId] = parseIntValue(req.body.id_produto);
    const [parsedQuant] = parseFloatValue(req.body.quantidade_atual);

    numberValidation(parsedId, parsedQuant);
    stringValidation(localizacao);

    await Estoque.create({
        id_produto: parsedId,
        quantidade_atual: parsedQuant,
        localizacao
    });

    res.redirect('/admin/estoques');
}));

router.post('/estoques/delete/:id_estoque', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_estoque);

    numberValidation(parsedId);

    const estoque = await Estoque.findByPk(parsedId);

    modelValidation(estoque);

    await estoque.destroy();

    res.redirect('/admin/estoques');
}));

router.post('/estoques/update/:id_estoque', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_estoque);
    const [parsedQuant] = parseFloatValue(req.body.quantidade_atual);
    const { localizacao } = req.body;


    numberValidation(parsedId, parsedQuant);
    stringValidation(localizacao);

    const estoque = await Estoque.findByPk(parsedId);

    modelValidation(estoque);

    await estoque.update({
        quantidade_atual: parsedQuant,
        localizacao
    });

    res.redirect('/admin/estoques');
}));

module.exports = router;
