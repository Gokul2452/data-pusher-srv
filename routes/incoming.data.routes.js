const express = require('express');
const axios = require('axios');
const router = express.Router();
const Account = require('../models/Account');
const Destination = require('../models/Destination');

router.post('/incoming_data', async (req, res) => {
    try {
        const token = req.header('CL-X-TOKEN');
        const data = req.body;

        if (!token) return res.status(401).json({ message: 'Un Authenticate' });
        if (typeof data !== 'object') return res.status(400).json({ message: 'Invalid Data' });

        const account = await Account.findOne({ app_secret_token: token }).lean();
        if (!account) return res.status(401).json({ message: 'Un Authenticate' });

        const destinations = await Destination.find({ account_id: account.account_id }).lean();
        if (destinations && destinations.length === 0) {
            res.json({ message: 'Destination not found for the Account' });
        }
        for (let dest of destinations) {
            const config = {
                method: dest.http_method,
                url: dest.url,
                headers: dest.headers
            };

            if (dest.http_method.toLowerCase() === 'get') {
                config.params = data;
            } else {
                config.data = data;
            }

            try {
                await axios(config);
            } catch (err) {
                console.error(`Error sending to destination: ${dest.url}`, err.message);
            }
        }

        res.json({ message: 'Data forwarded to destinations' });

    } catch (error) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
