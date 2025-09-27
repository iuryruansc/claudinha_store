const bcrypt = require('bcrypt');
const Usuarios = require('../../models/usuario');

const authenticateUser = async (nome, senha) => {
    const usuarioEncontrado = await Usuarios.findOne({ where: { nome } });
    if (!usuarioEncontrado) return null;

    const isMatch = await bcrypt.compare(senha, usuarioEncontrado.senha);
    if (!isMatch) return null;

    return usuarioEncontrado;
}

const logoutUser = async (req, res) => {
    if (req.session.caixaId) {
        return res.status(403).json({
            error: {
                message: 'Você precisa fechar o caixa antes de sair.',
                details: []
            }
        });
    }

    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({
                error: {
                    message: 'Erro ao encerrar sessão.',
                    details: [err.message]
                }
            });
        }
        res.clearCookie('connect.sid');
        res.redirect('/login?logout=success');
    });
}

module.exports = {
    authenticateUser,
    logoutUser
};