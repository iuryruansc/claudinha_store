const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/handlers/async-handler');
const { stringValidation, numberValidation } = require('../../utils/data/data-validation');
const { parseIntValue } = require('../../utils/data/data-parsers');
const { getAllClientes, findClienteById, createCliente, deleteCliente, updateCliente } = require('../../services/admin/clientesService');

router.get('/clientes/new', asyncHandler(async (req, res) => {
    res.render('admin/clientes/new', { title: 'Novo Cliente' });
}));

router.get('/clientes', asyncHandler(async (req, res) => {
    const clientes = await getAllClientes();

    res.render('admin/clientes/index', { clientes })
}));

router.get('/clientes/edit/:id_cliente', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_cliente);

    numberValidation(parsedId);

    const cliente = await findClienteById(parsedId);

    res.render('admin/clientes/edit', { cliente })
}));

router.post('/clientes/save', asyncHandler(async (req, res) => {
    const { nome, email, telefone, cpf } = req.body;

    stringValidation(nome, telefone, cpf);

    await createCliente({ nome, email, telefone, cpf });

    res.redirect('/admin/clientes');
}));

router.post('/clientes/delete/:id_cliente', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_cliente);

    numberValidation(parsedId);

    await deleteCliente(parsedId);

    res.redirect('/admin/clientes');
}));

router.post('/clientes/update/:id_cliente', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_cliente);
    const { nome, email, telefone, cpf } = req.body;

    numberValidation(parsedId);
    stringValidation(nome, telefone, cpf);

    await updateCliente(parsedId, { nome, email, telefone, cpf });

    res.redirect('/admin/clientes');
}));

module.exports = router;
