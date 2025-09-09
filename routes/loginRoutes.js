const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const loginPath = path.join(__dirname, '../controllers/login');

fs.readdirSync(loginPath).forEach(file => {
    const controller = require(path.join(loginPath, file));
    router.use('/', controller);
});

module.exports = router;