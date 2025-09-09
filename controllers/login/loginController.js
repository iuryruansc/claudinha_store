const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const asyncHandler = require('../../utils/handlers/async-handler');
const Usuarios = require('../../models/usuario');
const { logoutUser, authenticateUser } = require('../../services/login/loginService');

router.post('/login', asyncHandler(async (req, res) => {
    const { usuario, senha } = req.body;
    const funcionario = await authenticateUser(usuario, senha);

    if (funcionario) {
        req.session.isAuth = true;
        req.session.userName = funcionario.nome;
        return res.redirect('/admin/categories');
    } else {
        res.status(401).json({ message: 'Usuário ou senha inválidos.' });
    }
}));

router.post('/logout', asyncHandler(async (req, res) => {
    logoutUser(req, res);
}));

module.exports = router;
