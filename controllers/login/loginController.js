const express = require('express');
const router = express.Router();
const Funcionarios = require('../../models/funcionario');
const Usuarios = require('../../models/usuario');
const asyncHandler = require('../../utils/handlers/async-handler');
const { logoutUser, authenticateUser } = require('../../services/login/loginService');

router.get('/login', asyncHandler(async (req, res) => {
    const funcionarios = await Funcionarios.findAll();
    const usuarios = await Usuarios.findAll();

    res.render('login', { funcionarios, usuarios });
}));

router.post('/login', asyncHandler(async (req, res) => {
    const { nome, senha } = req.body;
    const usuarioEncontrado = await authenticateUser(nome, senha);

    if (!usuarioEncontrado) {
        return res.status(401).json({ message: 'Usuário ou senha inválidos.' });
    }

    req.session.isAuth = true;
    req.session.cargo = usuarioEncontrado.cargo;

    if (usuarioEncontrado.cargo === 'admin') {
        return res.redirect('/admin/dashboard');
    }

    if (usuarioEncontrado.cargo === 'funcionario') {
        const funcionario = await Funcionarios.findOne({ where: { nome: usuario } });
        req.session.userId = funcionario.id_funcionario;
        return res.redirect('/funcionario');
    }

}));

router.post('/logout', asyncHandler(async (req, res) => {
    logoutUser(req, res);
}));

module.exports = router;
