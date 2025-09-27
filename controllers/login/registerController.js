const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/handlers/async-handler');
const Usuario = require('../../models/usuario');
const Funcionario = require('../../models/funcionario');

router.post('/register', asyncHandler(async (req, res) => {
    const { nome, email, senha, confirmarSenha } = req.body;
    const funcionario = await Funcionario.findOne({ where: { nome } });
    
    if (!nome || !email || !senha || !confirmarSenha) {
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

    await Usuario.create({ nome, id_funcionario: funcionario.id_funcionario, email, cargo: funcionario.cargo, senha });

    res.redirect('/login');
}));

module.exports = router;
