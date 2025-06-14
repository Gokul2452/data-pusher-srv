const express = require('express');
const router = express.Router();
const Destination = require('../models/Destination');
const Account = require('../models/Account');
const { createDestinationDto } = require('../dto/destination.dto');
const authGuardMiddleWare = require('../middleware/auth')
const { createDestinationValidator } = require('../validators/common.validator');
const validate = require('../middleware/validate');
const redisClient = require('../utils/redisClient');
const destinationCacheKey = 'Destination:Find';

router.post('/', authGuardMiddleWare.authGuard(), authGuardMiddleWare.roleGuard(["ADMIN"]),
    createDestinationValidator, validate,
    async (req, res) => {
        try {
            const body = createDestinationDto(req.body);
            const is_account_id_exist = await Account.findOne({ account_id: body.account_id }).lean();
            if (!is_account_id_exist) {
                return res.status(404).json({ message: `Given account_id ${body.account_id} is not a valid one` });
            }
            const destination = new Destination();
            Object.assign(destination, body);
            destination.created_by = destination.updated_by = req.user.sub;
            await destination.save();
            return res.json(destination);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    });

router.get('/utils/list', authGuardMiddleWare.authGuard(), authGuardMiddleWare.roleGuard(["ADMIN", "USER"]), async (req, res) => {
    try {
        const cacheKey = destinationCacheKey;
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            return res.json({ success: true, data: JSON.parse(cachedData) });
        }
        const destinations = await Destination.find().lean();
        await redisClient.setEx(cacheKey, 500, JSON.stringify(destinations));
        return res.json({ success: true, destinations });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
});

router.get('/:id', authGuardMiddleWare.authGuard(), authGuardMiddleWare.roleGuard(["ADMIN", "USER"]), async (req, res) => {
    try {
        if (!req?.params?.id) {
            throw new Error(`id is required!`);
        }
        const destination = await Destination.findOne({ _id: req.params.id });
        if (destination) return res.json(destination);
        else return res.status(404).json({ message: 'Destination not found' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }

});

router.get('/account/:account_id', authGuardMiddleWare.authGuard(), authGuardMiddleWare.roleGuard(["ADMIN", "USER"]), async (req, res) => {
    try {
        if (!req?.params?.account_id) {
            throw new Error(`id is required!`);
        }
        const destinations = await Destination.find({ account_id: req.params.account_id }).lean();
        return res.json(destinations);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

router.put('/:id', authGuardMiddleWare.authGuard(), authGuardMiddleWare.roleGuard(["ADMIN", "USER"]), async (req, res) => {
    try {
        const incoming_request = req.body;
        if (!req?.params?.id) {
            throw new Error(`id is required!`);
        }
        const destination = await Destination.findOne({ _id: req.params.id });
        if (!destination) {
            return res.status(404).json({ message: 'Destination not found' });
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
            destination.updated_by = req.user.sub;
            await destination.save();
            await redisClient.del(destinationCacheKey);
        }

        return res.json(destination)

    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
});

router.delete('/:id', authGuardMiddleWare.authGuard(), authGuardMiddleWare.roleGuard(["ADMIN"]), async (req, res) => {
    try {
        if (!req?.params?.id) {
            throw new Error(`id is required!`);
        }
        const destination = await Destination.findOne({ _id: req.params.id });
        if (destination) {
            await destination.deleteOne();
            await redisClient.del(destinationCacheKey);
            return res.json({ message: 'Destination deleted succesfully' });
        } else return res.status(404).json({ message: 'Destination not found' });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});


router.post('/utils/list/filter', authGuardMiddleWare.authGuard(), async (req, res) => {
    try {
        const { account_id, http_method } = req.body;

        const skip = parseInt(req?.body?.skip) || 0;
        const limit = parseInt(req?.body?.limit) || 10;

        const query = {};

        if (account_id) query.account_id = account_id;
        if (http_method) query.http_method = http_method.toUpperCase();

        const total_count = await Destination.countDocuments(query);

        const destinations = await Destination.aggregate([
            {
                $match: query
            },
            {
                $lookup: {
                    from: 'Account',
                    localField: 'account_id',
                    foreignField: 'account_id',
                    as: 'account_info'
                }
            },
            { $unwind: '$account_info' }, // flatten the joined array
            {
                $addFields: {
                    account_name: '$account_info.account_name'
                }
            },
            {
                $project: {
                    account_info: 0 // remove full account_info if not needed
                }
            },
            { $skip: skip },
            { $limit: limit }
        ]);


        return res.json({ success: true, data: destinations, total_count });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;