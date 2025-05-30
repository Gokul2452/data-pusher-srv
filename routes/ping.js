// routes/ping.js
const express = require('express');
const router = express.Router();

router.get('/ping', (req, res) => {
    return res.send('Pong !')
});

module.exports = router;