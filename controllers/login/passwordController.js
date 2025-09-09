const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/handlers/async-handler');
const crypto = require('crypto');

router.get('/forgot-password', (req, res) => {
    res.render('login/forgot-password');
});

router.get('/reset-password/:token', asyncHandler(async (req, res) => {
    //TODO
}));

router.post('/forgot-password', asyncHandler(async (req, res) => {
    //TODO
}));

module.exports = router;
