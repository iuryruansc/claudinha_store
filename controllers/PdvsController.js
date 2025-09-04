const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/handlers/async-handler');
const { modelValidation, stringValidation, enumValidation, numberValidation } = require('../utils/data-validation');
const { parseIntValue } = require('../utils/data-parsers');
const Pdv = require('../models/Pdvs');

router.get('/pdvs/new', asyncHandler(async (req, res) => {
    res.render('admin/pdvs/new', { title: 'Novo Ponto de Vendas' });
}));

router.get('/pdvs', asyncHandler(async (req, res) => {
    const pdvs = await Pdv.findAll();
    res.render('admin/pdvs/index', { pdvs })
}));

router.get('/pdvs/edit/:id_pdv', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_pdv);

    numberValidation(parsedId);

    const pdv = await Pdv.findByPk(parsedId);

    modelValidation(pdv);

    res.render('admin/pdvs/edit', { pdv })
}));

router.post('/pdvs/save', asyncHandler(async (req, res) => {
    const { identificacao, descricao, status } = req.body;

    stringValidation(identificacao, descricao);
    enumValidation(status, 'ativo', 'inativo');

    await Pdv.create({ identificacao, descricao, status });
    res.redirect('/admin/pdvs');
}));

router.post('/pdvs/delete/:id_pdv', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_pdv);

    numberValidation(parsedId);

    const pdv = await Pdv.findByPk(parsedId);
    modelValidation(pdv);

    await pdv.destroy()

    res.redirect('/admin/pdvs');
}));

router.post('/pdvs/update/:id_pdv', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_pdv);
    const { identificacao, descricao, status } = req.body;

    numberValidation(parsedId);
    stringValidation(identificacao, descricao);
    enumValidation(status, 'ativo', 'inativo');

    const pdv = await Pdv.findByPk(parsedId);
    modelValidation(pdv);

    await pdv.update({ identificacao, descricao, status });

    res.redirect('/admin/pdvs');
}));

module.exports = router;
