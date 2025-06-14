const express = require('express');
const axios = require('axios');
const router = express.Router();
const Account = require('../models/Account');
const Destination = require('../models/Destination');
const queue = require('../jobs/dataQuece');
const accountRateLimiter = require('../workers/rateLimiter')
router.post('/incoming_data', accountRateLimiter, async (req, res) => {
    try {
        const token = req.header('CL-X-TOKEN');
        const data = req.body;
        const receivedAt = new Date();
        if (!token) return res.status(401).json({ message: 'Un Authenticate' });
        if (typeof data !== 'object') return res.status(400).json({ message: 'Invalid Data' });

        const account = await Account.findOne({ app_secret_token: token }).lean();
        if (!account) return res.status(401).json({ message: 'Un Authenticate' });

        const destinations = await Destination.find({ account_id: account.account_id }).lean();
        if (destinations && destinations.length === 0) {
            return res.json({ message: 'Destination not found for the Account' });
        }
        for (let dest of destinations) {
            await queue.add({
                account_id: account.account_id,
                destination_id: dest._id,
                dest,
                payload: data,
                receivedAt
            });
        }

        return res.json({ message: 'Data forwarded to destinations' });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
