const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/handlers/async-handler');
const Usuario = require('../../models/usuario');


router.post('/register', asyncHandler(async (req, res) => {
    const { nome, email, cargo, senha, confirmarSenha } = req.body;

    console.log(req.body);
    

    if (!nome || !email || !cargo || !senha || !confirmarSenha) {
        return res.status(400).json({
            error: {
                message: 'Todos os campos são obrigatórios.',
                details: ['Preencha todos os campos do formulário.']
            }
        });
    }

    if (senha !== confirmarSenha) {
        return res.status(400).json({
            error: {
                message: 'As senhas não coincidem.',
                details: ['Certifique-se de que a senha e a confirmação são iguais.']
            }
        });
    }

    const existingUser = await Usuario.findOne({ where: { email } });
    if (existingUser) {
        return res.status(409).json({
            error: {
                message: 'Email já cadastrado.',
                details: ['Use outro email ou recupere sua conta.']
            }
        });
    }

    await Usuario.create({ nome, email, cargo, senha });

    res.status(201).json({ message: 'Conta criada com sucesso!' });
}));

module.exports = router;
