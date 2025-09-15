const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const asyncHandler = require('../../utils/handlers/async-handler');
const { logoutUser, authenticateUser } = require('../../services/login/loginService');

router.get('/login', (req, res) => {
    res.render('login/index');
});

router.post('/login', asyncHandler(async (req, res) => {
    const { usuario, senha } = req.body;
    const usuarioEncontrado = await authenticateUser(usuario, senha);

    if (usuarioEncontrado) {
        req.session.isAuth = true;
        req.session.cargo = usuarioEncontrado.cargo;
        if (usuarioEncontrado.cargo === 'admin') {
            res.redirect('admin/dashboard');
        }
    } else {
        res.status(401).json({ message: 'Usuário ou senha inválidos.' });
    }
}));

router.post('/logout', asyncHandler(async (req, res) => {
    logoutUser(req, res);
}));

module.exports = router;
