const isAuth = (req, res, next) => {
    if (req.session.isAuth && req.session.cargo === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Accesso negado.' });
    }
};

const requireCaixa = (req, res, next) => {
  if (!req.session.caixaId) {    
    return res.redirect('/admin/dashboard?erro=caixa');
  }
  next();
};

module.exports = { isAuth, requireCaixa };