const bcrypt = require('bcrypt');
const Usuarios = require('../../models/usuario');

const authenticateUser = async (usuario, senha) => {
    const usuarioEncontrado = await Usuarios.findOne({ where: { nome: usuario } });
    if (!usuarioEncontrado) return null;

    const isMatch = await bcrypt.compare(senha, usuarioEncontrado.senha);
    if (!isMatch) return null;

    return usuarioEncontrado;
}

const logoutUser = async (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: "Não foi possível deslogar" });
        }
        res.clearCookie('connect.sid');
        res.redirect('/login?logout=success');
    });
}

module.exports = {
    authenticateUser,
    logoutUser
};