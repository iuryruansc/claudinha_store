const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/async-handler');
const { idValidation, modelValidation, stringValidation } = require('../utils/data-validation');
const Cliente = require('../models/Clientes');

router.get('/clientes/new', asyncHandler(async (req, res) => {
    res.render('admin/clientes/new', { title: 'Novo Cliente' });
}));

router.get('/clientes', asyncHandler(async (req, res) => {
    const clientes = await Cliente.findAll();
    res.render('admin/clientes/index', { clientes })
}));

router.get('/clientes/edit/:id_cliente', asyncHandler(async (req, res) => {
    const { id_cliente } = req.params;

    idValidation(id_cliente);

    const cliente = await Cliente.findByPk(id_cliente);

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
    const { id_cliente } = req.params;

    idValidation(id_cliente);

    const cliente = await Cliente.findByPk(id_cliente);

    modelValidation(cliente);

    await cliente.destroy();

    res.redirect('/admin/clientes');
}));

router.post('/clientes/update/:id_cliente', asyncHandler(async (req, res) => {
    const { id_cliente } = req.params;
    const { nome, email, telefone, cpf } = req.body;

    idValidation(id_cliente);
    stringValidation(nome, telefone, cpf);

    const cliente = await Cliente.findByPk(id_cliente);

    modelValidation(cliente);

    await cliente.update({ nome, email, telefone, cpf });

    res.redirect('/admin/clientes');
}));

module.exports = router;
