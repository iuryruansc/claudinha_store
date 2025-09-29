const isAuth = (req, res, next) => {
  if (req.session.isAuth && req.session.cargo === 'admin') {
    next();
  } else {
    req.flash('error_msg', 'Você não tem permissão para acessar esta página.');
    return res.redirect('/login');
  }
};

const isFunc = (req, res, next) => {
  if (req.session.isAuth && req.session.cargo === 'funcionario') {
    next();
  } else {
    req.flash('error_msg', 'Você não tem permissão para acessar esta página.');
    return res.redirect('/login');
  }
}

const requireCaixa = (req, res, next) => {
  if (!req.session.caixaId) {
    return res.redirect('/admin/dashboard?erro=caixa');
  }
  next();
};

module.exports = { isAuth, isFunc, requireCaixa };