const express = require('express');
const router = express.Router();
const Roles = require('../models/Roles');
const authGuardMiddleWare = require('../middleware/auth')

router.post('/', async (req, res) => {
    try {
        const body = req.body;
        const NewRole = new Roles({
            role_name: body.role_name,
            role_id: body.role_id
        });
        await NewRole.save();
        return res.status(200).json(NewRole);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;