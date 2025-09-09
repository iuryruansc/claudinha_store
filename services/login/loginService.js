const bcrypt = require('bcrypt');
const Usuarios = require('../../models/usuario');

async function authenticateUser(usuario, senha) {
    const funcionario = await Usuarios.findOne({ where: { nome: usuario } });
    if (!funcionario) return null;

    const isMatch = await bcrypt.compare(senha, funcionario.senha);
    if (!isMatch) return null;

    return funcionario;
}

function logoutUser(req, res) {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: "Não foi possível deslogar" });
        }
        res.clearCookie('connect.sid');
        res.redirect('/login/index');
    });
}

module.exports = {
    authenticateUser,
    logoutUser
};