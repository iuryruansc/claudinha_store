const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/handlers/async-handler');
const { sendEmail, passwordReset } = require('../../services/login/passwordService');

router.get('/forgot-password', (req, res) => {
    res.render('login/forgot-password');
});

router.get('/reset-password', asyncHandler(async (req, res) => {
    const { token } = req.query.token;
    res.render('login/new-password', { token })
}));

router.post('/forgot-password', asyncHandler(async (req, res) => {
    const { email } = req.body;

    sendEmail(email);

    res.render('login/password-sent');
}));

router.post('/reset-password', asyncHandler(async (req, res) => {
    const { token, novaSenha } = req.body;

    passwordReset(token, novaSenha);

    res.send('Senha atualizada com sucesso');
}));

module.exports = router;
