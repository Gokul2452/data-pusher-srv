// routes/ping.js
const express = require('express');
const router = express.Router();
const { generateToken, isValidtoken } = require('../utils/jwt')
router.get('/ping', (req, res) => {
    return res.send('Pong !')
});

router.get('/create/token', (req, res) => {
    const response = generateToken({ _id: "1", email: "goku@" })
    return res.send(response);
})

router.get('/validate/token/:token', (req, res) => {
    const response = isValidtoken(req.params.token)
    return res.send(response);
})



module.exports = router;