const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const controllersPath = path.join(__dirname, '../controllers/admin');
const isAuth = require('../utils/handlers/auth-handler');

router.use(isAuth);

router.use((req, res, next) => {
  res.locals.currentPath = '/admin' + req.path;
  next();
});

fs.readdirSync(controllersPath).forEach(file => {
  const controller = require(path.join(controllersPath, file));
  router.use('/', controller);
});

module.exports = router;