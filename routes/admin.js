const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const controllersPath = path.join(__dirname, '../controllers')

fs.readdirSync(controllersPath).forEach(file => {
    const controller = require(path.join(controllersPath, file));
    router.use('/', controller);
});

module.exports = router;
