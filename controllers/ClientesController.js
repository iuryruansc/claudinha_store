const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/async-handler');
const Clientes = require('../models/Clientes');

router.get('/admin/clientes/new', asyncHandler(async (req, res) => {
    res.render('admin/clientes/new', { title: 'Novo Cliente' });
}));

router.get('/admin/clientes', asyncHandler(async (req, res) => {
    const clientes = await Clientes.findAll();
    res.render('admin/funcionarios/index', { clientes })
}))

router.get('/admin/clientes/edit/:id_cliente', asyncHandler(async (req, res) => {
    const { id_cliente } = req.params;

    if (isNaN(id_cliente)) {
        const err = new Error('Erro ao editar funcionario. ID inválido')
        err.status = 400;
        throw err;
    }

    const cliente = await Clientes.findByPk(id_cliente);

    if (!cliente) {
        const err = new Error('Funcionario não encontrado.')
        err.status = 404;
        throw err;
    }

    res.render('admin/clientes/edit', { cliente: cliente })
}))

module.exports = router;