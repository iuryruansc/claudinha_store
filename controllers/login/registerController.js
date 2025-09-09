const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/handlers/async-handler');

router.post('/register', asyncHandler(async (req, res) => {
    //TODO
}));

module.exports = router;
