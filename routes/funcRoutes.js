const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const controllersPath = path.join(__dirname, '../controllers/funcionario');
const { isFunc } = require('../utils/handlers/auth-handler');

router.use(isFunc);

router.use((req, res, next) => {
    if (req.session.user) {
        res.locals.user = req.session.user;
    }
    next();
});

router.use((req, res, next) => {
    res.locals.currentPath = '/funcionario' + req.path;
    next();
});

fs.readdirSync(controllersPath).forEach(file => {
    const controller = require(path.join(controllersPath, file));
    router.use('/', controller);
});

module.exports = router;