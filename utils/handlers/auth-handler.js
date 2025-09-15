const isAuth = (req, res, next) => {
    if (req.session.isAuth && req.session.cargo === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Accesso negado.' });
    }
};

module.exports = isAuth;