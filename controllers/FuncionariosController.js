const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/async-handler');
const Funcionario = require('../models/Funcionarios');

router.get('/funcionarios/new', asyncHandler(async (req, res) => {
    res.render('admin/funcionarios/new', { title: 'Novo Funcionario' });
}));

router.get('/funcionarios', asyncHandler(async (req, res) => {
    const funcionarios = await Funcionario.findAll();
    res.render('admin/funcionarios/index', { funcionarios })
}));

router.get('/funcionarios/edit/:id_funcionario', asyncHandler(async (req, res) => {
    const { id_funcionario } = req.params;

    if (isNaN(id_funcionario)) {
        const err = new Error('Erro ao editar funcionario. ID inválido')
        err.status = 400;
        throw err;
    }

    const funcionario = await Funcionario.findByPk(id_funcionario);

    if (!funcionario) {
        const err = new Error('Funcionario não encontrado.')
        err.status = 404;
        throw err;
    }

    res.render('admin/funcionarios/edit', { funcionario })
}));

router.post('/funcionarios/save', asyncHandler(async (req, res) => {
    const { nome, cpf, cargo } = req.body;

    if (!nome || !cpf || !cargo) {
        const err = new Error('Dados inválidos ao cadastrar funcionario.')
        err.status = 400;
        throw err;
    }

    await Funcionario.create({ nome, cpf, cargo });
    res.redirect('/admin/funcionarios');
}));

router.post('/funcionarios/delete/:id_funcionario', asyncHandler(async (req, res) => {
    const { id_funcionario } = req.params;

    if (!id_funcionario || isNaN(id_funcionario)) {
        const err = new Error('Erro ao deletar funcionario. ID inválido')
        err.status = 400;
        throw err;
    }

    await Funcionario.destroy({
        where: {
            id_funcionario
        }
    });

    res.redirect('/admin/funcionarios');
}));

router.post('/funcionarios/update/:id_funcionario', asyncHandler(async (req, res) => {
    const { id_funcionario } = req.params;
    const { nome, cpf, cargo } = req.body;

    if (!id_funcionario || isNaN(id_funcionario) || !nome || !cpf || !cargo) {
        const err = new Error('Dados do funcionário inválidos.')
        err.status = 400;
        throw err;
    }

    await Funcionario.update({ nome, cpf, cargo }, {
        where: {
            id_funcionario
        }
    });

    res.redirect('/admin/funcionarios');
}));

module.exports = router;
