const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/async-handler');
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

    if (isNaN(id_cliente)) {
        const err = new Error('Erro ao editar dados do cliente. ID inválido')
        err.status = 400;
        throw err;
    }

    const cliente = await Cliente.findByPk(id_cliente);

    if (!cliente) {
        const err = new Error('Cliente não encontrado.')
        err.status = 404;
        throw err;
    }

    res.render('admin/clientes/edit', { cliente })
}));

router.post('/clientes/save', asyncHandler(async (req, res, next) => {
    const { nome, email, telefone, cpf } = req.body;

    if (!nome || !telefone || !cpf) {
        const err = new Error('Dados obrigatórios inválidos.');
        err.status = 400;
        throw err;
    }

    try {
        await Cliente.create({ nome, email, telefone, cpf });
        return res.redirect('/admin/clientes');
    } catch (error) {
        next(error);
    }
}));

router.post('/clientes/delete/:id_cliente', asyncHandler(async (req, res) => {
    const { id_cliente } = req.params;

    if (!id_cliente || isNaN(id_cliente)) {
        const err = new Error('Erro ao deletar cliente. ID inválido')
        err.status = 400;
        throw err;
    }

    await Cliente.destroy({
        where: {
            id_cliente
        }
    });

    res.redirect('/admin/clientes');
}));

router.post('/clientes/update/:id_cliente', asyncHandler(async (req, res, next) => {
    const { id_cliente } = req.params;
    const { nome, email, telefone, cpf } = req.body;

    if (!id_cliente || isNaN(id_cliente) || !nome || !telefone || !cpf) {
        const err = new Error('ID do cliente inválido.');
        err.status = 400;
        throw err;
    }

    try {
        await Cliente.update({ nome, email, telefone, cpf }, {
            where: {
                id_cliente
            }
        });
        return res.redirect('/admin/clientes');
    } catch (error) {
        const validationErrors = error.errors.map(e => e.message);
        const err = new Error(validationErrors);
        err.status = 400;
        throw err
    }
}));

module.exports = router;
