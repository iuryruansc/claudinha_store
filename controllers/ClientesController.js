const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/handlers/async-handler');
const { modelValidation, stringValidation, numberValidation } = require('../utils/data-validation');
const { parseIntValue } = require('../utils/data-parsers');
const Cliente = require('../models/Clientes');

router.get('/clientes/new', asyncHandler(async (req, res) => {
    res.render('admin/clientes/new', { title: 'Novo Cliente' });
}));

router.get('/clientes', asyncHandler(async (req, res) => {
    const clientes = await Cliente.findAll();
    res.render('admin/clientes/index', { clientes })
}));

router.get('/clientes/edit/:id_cliente', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_cliente);

    numberValidation(parsedId);

    const cliente = await Cliente.findByPk(parsedId);

    modelValidation(cliente);

    res.render('admin/clientes/edit', { cliente })
}));

router.post('/clientes/save', asyncHandler(async (req, res) => {
    const { nome, email, telefone, cpf } = req.body;

    stringValidation(nome, telefone, cpf);

    await Cliente.create({ nome, email, telefone, cpf });

    res.redirect('/admin/clientes');
}));

router.post('/clientes/delete/:id_cliente', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_cliente);

    numberValidation(parsedId);

    const cliente = await Cliente.findByPk(parsedId);

    modelValidation(cliente);

    await cliente.destroy();

    res.redirect('/admin/clientes');
}));

router.post('/clientes/update/:id_cliente', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_cliente);
    const { nome, email, telefone, cpf } = req.body;

    numberValidation(parsedId);
    stringValidation(nome, telefone, cpf);

    const cliente = await Cliente.findByPk(parsedId);

    modelValidation(cliente);

    await cliente.update({ nome, email, telefone, cpf });

    res.redirect('/admin/clientes');
}));

module.exports = router;
