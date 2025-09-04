const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/handlers/async-handler');
const { modelValidation, stringValidation, numberValidation } = require('../utils/data-validation');
const { parseIntValue } = require('../utils/data-parsers');
const Funcionario = require('../models/Funcionarios');

router.get('/funcionarios/new', asyncHandler(async (req, res) => {
    res.render('admin/funcionarios/new', { title: 'Novo Funcionario' });
}));

router.get('/funcionarios', asyncHandler(async (req, res) => {
    const funcionarios = await Funcionario.findAll();
    res.render('admin/funcionarios/index', { funcionarios })
}));

router.get('/funcionarios/edit/:id_funcionario', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_funcionario);

    numberValidation(parsedId);

    const funcionario = await Funcionario.findByPk(parsedId);

    modelValidation(funcionario);

    res.render('admin/funcionarios/edit', { funcionario })
}));

router.post('/funcionarios/save', asyncHandler(async (req, res) => {
    const { nome, cpf, cargo } = req.body;

    stringValidation(nome, cpf, cargo);

    await Funcionario.create({ nome, cpf, cargo });
    res.redirect('/admin/funcionarios');
}));

router.post('/funcionarios/delete/:id_funcionario', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_funcionario);

    numberValidation(parsedId);

    const funcionario = await Funcionario.findByPk(parsedId);
    modelValidation(funcionario);

    await funcionario.destroy()

    res.redirect('/admin/funcionarios');
}));

router.post('/funcionarios/update/:id_funcionario', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_funcionario);
    const { nome, cpf, cargo } = req.body;

    numberValidation(parsedId);
    stringValidation(nome, cpf, cargo);

    const funcionario = await Funcionario.findByPk(parsedId);
    modelValidation(funcionario);

    await funcionario.update({ nome, cpf, cargo });

    res.redirect('/admin/funcionarios');
}));

module.exports = router;
