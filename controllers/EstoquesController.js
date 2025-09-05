const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/handlers/async-handler');
const { stringValidation, numberValidation } = require('../utils/data-validation');
const { parseIntValue, parseFloatValue } = require('../utils/data-parsers');
const { getAllEstoques, getEditData, createEstoque, getViewDependencies, deleteEstoque, updateEstoque } = require('../services/estoquesService');

router.get('/estoques/new', asyncHandler(async (req, res) => {
    const produtos = await getViewDependencies();
    res.render('admin/estoques/new', { produtos });
}));

router.get('/estoques', asyncHandler(async (req, res) => {
    const { estoques, produtos } = await getAllEstoques();
    
    res.render('admin/estoques/index', { estoques, produtos });
}));

router.get('/estoques/edit/:id_estoque', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_estoque);

    numberValidation(parsedId);

    const { estoque, produtos } = await getEditData(parsedId);

    res.render('admin/estoques/edit', { estoque, produtos })
}));

router.post('/estoques/save', asyncHandler(async (req, res) => {
    const { localizacao } = req.body;
    const [parsedId] = parseIntValue(req.body.id_produto);
    const [parsedQuant] = parseFloatValue(req.body.quantidade_atual);

    numberValidation(parsedId, parsedQuant);
    stringValidation(localizacao);

    await createEstoque({
        id_produto: parsedId,
        quantidade_atual: parsedQuant,
        localizacao
    });

    res.redirect('/admin/estoques');
}));

router.post('/estoques/delete/:id_estoque', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_estoque);

    numberValidation(parsedId);

    await deleteEstoque(parsedId);

    res.redirect('/admin/estoques');
}));

router.post('/estoques/update/:id_estoque', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_estoque);
    const [parsedQuant] = parseFloatValue(req.body.quantidade_atual);
    const { localizacao } = req.body;


    numberValidation(parsedId, parsedQuant);
    stringValidation(localizacao);

    await updateEstoque(parsedId, ({
        quantidade_atual: parsedQuant,
        localizacao
    }));

    res.redirect('/admin/estoques');
}));

module.exports = router;
