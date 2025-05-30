const express = require('express');
const router = express.Router();
const Account = require('../models/Account');
const Destination = require('../models/Destination');
const { createAccountDto } = require('../dto/accounts.dto');

router.post('/', async (req, res) => {
    try {
        const body = createAccountDto(req.body);
        const is_email_exist = await Account.exists({ email: body.email }, { _id: 1 });
        if (is_email_exist) {
            throw new Error(`Email ${body.email} is already exists !`);
        }
        const account = new Account();
        Object.assign(account, body)
        await account.save();
        return res.json(account);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
});

router.get('/utils/list', async (req, res) => {
    try {
        const account = await Account.find();
        return res.json(account);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        if (!req?.params?.id) {
            throw new Error(`id is required!`);
        }
        const account = await Account.findOne({ _id: req.params.id }).lean();
        if (account) return res.json(account);
        else return res.status(404).json({ message: 'Account not found' });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const incoming_request = req.body;
        if (!req?.params?.id) {
            throw new Error(`id is required!`);
        }
        const account = await Account.findOne({ _id: req.params.id });
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }
        let is_value_changed = false;

        if (incoming_request?.email && incoming_request?.email !== account.email) {
            const is_email_id_exist = await Account.exists({ email: incoming_request.email});
            if(is_email_id_exist){
                res.status(404).json({ message: `Given email ${incoming_request.email} is already taken` });
            }
            account.email = incoming_request.email;
            is_value_changed = true;
        }
        if (incoming_request?.account_name && incoming_request?.account_name !== account.account_name) {
            account.account_name = incoming_request.account_name;
            is_value_changed = true;
        }
        if (incoming_request?.website && incoming_request?.website !== account.website) {
            account.website = incoming_request.website;
            is_value_changed = true;
        }

        if (is_value_changed) {
            await account.save();
        }

        return res.json(account)

    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        if (!req?.params?.id) {
            throw new Error(`id is required!`);
        }
        const account = await Account.findOne({ account_id: req.params.id });
        if (account) {
            // deleting the acc and destination which have respective account_id
            await account.deleteOne();
            await Destination.deleteMany({ account_id: account.account_id })
            return res.json({ message: 'Account deleted succesfully' });
        } else res.status(404).json({ message: 'Account not found' });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

module.exports = router;

