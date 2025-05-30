// routes/destination.js
const express = require('express');
const router = express.Router();
const Destination = require('../models/Destination');
const Account = require('../models/Account');
const { createDestinationDto } = require('../dto/destination.dto');

router.post('/', async (req, res) => {
    try {
        const body = createDestinationDto(req.body);
        const is_account_id_exist = await Account.findOne({ account_id: body.account_id}).lean();
        if(!is_account_id_exist){
            res.status(404).json({ message: `Given account_id ${body.account_id} is not a valid one` });
        }
        const destination = new Destination();
        Object.assign(destination, body);
        await destination.save();
        res.json(destination);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/utils/list', async (req, res) => {
    try {
        const account = await Destination.find();
        res.json(account);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        if (!req?.params?.id) {
            throw new Error(`id is required!`);
        }
        const destination = await Destination.findOne({ _id: req.params.id});
        if (destination) res.json(destination);
        else res.status(404).json({ message: 'Destination not found' });
    } catch (error) {
        res.status(400).json({ error: err.message });
    }
    
});

router.get('/account/:account_id', async (req, res) => {
    try {
        if (!req?.params?.account_id) {
            throw new Error(`id is required!`);
        }
        const destinations = await Destination.find({ account_id: req.params.account_id }).lean();
        res.json(destinations);
    } catch (error) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const incoming_request = req.body;
        if (!req?.params?.id) {
            throw new Error(`id is required!`);
        }
        const destination = await Destination.findOne({ _id: req.params.id });
        if (!destination) {
            res.status(404).json({ message: 'Destination not found' });
        }
        let is_value_changed = false;

        if (incoming_request?.url && incoming_request?.url !== destination.url) {
            destination.url = incoming_request.url;
            is_value_changed = true;
        }
        if (incoming_request?.http_method && incoming_request?.http_method !== destination.http_method) {
            destination.http_method = incoming_request.http_method;
            is_value_changed = true;
        }
        
        if (incoming_request?.headers && JSON.stringify(incoming_request.headers) !== JSON.stringify(destination.headers)) {
            destination.headers = incoming_request.headers;
            is_value_changed = true;
        }

        if (is_value_changed) {
            await destination.save();
        }

        res.json(destination)

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        if (!req?.params?.id) {
            throw new Error(`id is required!`);
        }
        const destination = await Destination.findOne({ _id: req.params.id });
        if (destination) {
            await destination.deleteOne();
            res.json({ message: 'Destination deleted succesfully' });
        } else res.status(404).json({ message: 'Destination not found' });
    } catch (error) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;