const express = require('express');
const router = express.Router();
const Account = require('../models/Account');
const Destination = require('../models/Destination');
const AccountMember = require('../models/AccountMember');
const Logger = require('../models/Logger');
const { createAccountDto } = require('../dto/accounts.dto');
const authGuardMiddleWare = require('../middleware/auth')
const { createAccountValidator } = require('../validators/common.validator');
const validate = require('../middleware/validate');
const redisClient = require('../utils/redisClient');
const accountCacheKey = 'Account:Find';

class HttpError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

router.post('/', authGuardMiddleWare.authGuard(), authGuardMiddleWare.roleGuard(["ADMIN"]),
    createAccountValidator, validate,
    async (req, res) => {
        try {
            const body = createAccountDto(req.body);
            const is_email_exist = await Account.exists({ email: body.email }, { _id: 1 });
            if (is_email_exist) {
                throw new HttpError(`Email ${body.email} is already exists !`, 409);
            }
            const is_account_id_exist = await Account.exists({ account_id: body.account_id }, { _id: 1 });
            if (is_account_id_exist) {
                throw new HttpError(`Account ID ${body.account_id} is already exists !`, 409);
            }
            const account = new Account();
            Object.assign(account, body)
            account.created_by = account.updated_by = req.user.sub;
            await account.save();
            return res.json(account);
        } catch (err) {
            const status = err.statusCode || 400;
            return res.status(status).json({ error: err.message });
        }
    });

router.get('/utils/list', authGuardMiddleWare.authGuard(), authGuardMiddleWare.roleGuard(['ADMIN', 'USER']), async (req, res) => {
    try {
        const cacheKey = accountCacheKey;
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            return res.json({ success: true, data: JSON.parse(cachedData) });
        }
        const accounts = await Account.find().lean();

        await redisClient.setEx(cacheKey, 500, JSON.stringify(accounts));
        return res.json({ success: true, accounts });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
});

router.get('/:id', authGuardMiddleWare.authGuard(), authGuardMiddleWare.roleGuard(['ADMIN', 'USER']), async (req, res) => {
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

router.put('/:id', authGuardMiddleWare.authGuard(), authGuardMiddleWare.roleGuard(['ADMIN', 'USER']), async (req, res) => {
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
            const is_email_id_exist = await Account.exists({ email: incoming_request.email });
            if (is_email_id_exist) {
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
            account.updated_by = req.user.sub;
            await account.save();
            await redisClient.del(accountCacheKey);
        }

        return res.json(account)

    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
});

router.delete('/:id', authGuardMiddleWare.authGuard(), authGuardMiddleWare.roleGuard(['ADMIN']), async (req, res) => {
    try {
        if (!req?.params?.id) {
            throw new Error(`id is required!`);
        }
        const account = await Account.findOne({ account_id: req.params.id });
        if (account) {
            // deleting the acc and destination which have respective account_id
            await account.deleteOne();
            await Destination.deleteMany({ account_id: account.account_id });
            await AccountMember.deleteMany({ account_id: account.account_id });
            await Logger.deleteMany({ account_id: account.account_id });
            await redisClient.del(accountCacheKey);
            return res.json({ message: 'Account deleted succesfully' });
        } else res.status(404).json({ message: 'Account not found' });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

router.post('/utils/list/filter', authGuardMiddleWare.authGuard(), async (req, res) => {
    try {
        const { account_name, created_by } = req.body;
        const skip = parseInt(req?.body?.skip) || 0;
        const limit = parseInt(req?.body?.limit) || 10;

        const query = {};
        if (account_name) query.account_name = new RegExp(account_name, 'i');
        if (created_by) query.created_by = created_by;

        const total_count = await Account.countDocuments(query);
        const accounts = await Account.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ created_at: -1 })
            .lean();

        return res.json({ success: true, data: accounts, total_count });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});


module.exports = router;

