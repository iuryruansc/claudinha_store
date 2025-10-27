const crypto = require('crypto');
const { Op } = require('sequelize')
const { modelValidation } = require('../../utils/data/data-validation');
const Usuario = require('../../models/Usuario');
const UserMeta = require('../../models/UserMeta');
const nodemailer = require('nodemailer');

const sendEmail = async (email) => {
    const usuario = await Usuario.findOne({ where: { email } });

    modelValidation(usuario);

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 3600000;

    await UserMeta.create({
        id_usuario: usuario.id_usuario,
        token,
        expiresAt
    });

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.USER_EMAIL,
            pass: process.env.USER_PASS
        }
    });

    const resetLink = `https://localhost:3000/reset-password?token=${token}`;

    await transporter.sendMail({
        to: usuario.email,
        subject: 'Redefinição de Senha',
        html: `
        <p>Olá, ${usuario.nome}</p>
        <p><a href="${resetLink}">Clique aqui para redefinir sua senha</a></p>
        <p>Este link expira em 1 hora.</p>
        `
    });
}

const passwordReset = async (token, novaSenha) => {
    const resetRecord = await UserMeta.findOne({
        token,
        expiresAt: { [Op.gt]: Date.now() }
    });

    if (!resetRecord) return res.status(400).send('Token inválido ou expirado');

    const user = await Usuario.findByPk(resetRecord.id_usuario);
    user.senha = novaSenha;
    await user.save();

    await UserMeta.destroy({ where: { id_usuario: resetRecord.id_usuario } });
}

module.exports = {
    sendEmail,
    passwordReset
}