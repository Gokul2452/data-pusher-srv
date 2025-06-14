const express = require('express');
const router = express.Router();
const Logger = require('../models/Logger');
const authGuardMiddleWare = require('../middleware/auth')

router.get('/utils/list', async (req, res) => {
    try {
        const logger_list = await Logger.find().lean();
        return res.json(logger_list);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
});

router.post('/utils/list/filter', authGuardMiddleWare.authGuard(), async (req, res) => {
    try {
        const { status, account_id, destination_id } = req.body;

        const skip = parseInt(req?.body?.skip) || 0;
        const limit = parseInt(req?.body?.limit) || 10;

        const query = {};
        if (status) query.status = status;
        if (account_id) query.account_id = account_id;
        if (destination_id) query.destination_id = destination_id;

        const total_count = await Logger.countDocuments(query);
        const logs = await Logger.aggregate([
            {
                $match: query
            },
            {
                $addFields: {
                    destinationObjectId: { $toObjectId: "$destination_id" }
                }
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
                $lookup: {
                    from: 'Destination',
                    localField: 'destinationObjectId',
                    foreignField: '_id',
                    as: 'destination_info'
                }
            },
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

        return res.json({ success: true, data: logs, total_count });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});


// router.get('/:id', async (req, res) => {
//     try {
//         const log = await Log.findById(req.params.id).populate('destination_id');
//         if (!log) {
//             return res.status(404).json({ message: 'Log not found' });
//         }
//         return res.json(log);
//     } catch (err) {
//         return res.status(400).json({ error: err.message });
//     }
// });

// router.get('/account/:account_id', async (req, res) => {
//     try {
//         const logs = await Log.find({ account_id: req.params.account_id }).populate('destination_id');
//         return res.json(logs);
//     } catch (err) {
//         return res.status(400).json({ error: err.message });
//     }
// });

// router.put('/:id', async (req, res) => {
//     try {
//         const incoming_request = req.body;
//         const log = await Log.findById(req.params.id);
//         if (!log) return res.status(404).json({ message: 'Log not found' });

//         if (incoming_request?.processed_timestamp) {
//             log.processed_timestamp = new Date(incoming_request.processed_timestamp);
//         }
//         if (incoming_request?.status && [LoggerStatusEnum.LoggerStatusEnum.SUCCESS, LoggerStatusEnum.LoggerStatusEnum.FAILED].includes(incoming_request.status)) {
//             log.status = incoming_request.status;
//         }

//         await log.save();
//         return res.json(log);
//     } catch (err) {
//         return res.status(400).json({ error: err.message });
//     }
// });

// router.delete('/:id', async (req, res) => {
//     try {
//         const log = await Log.findById(req.params.id);
//         if (!log) return res.status(404).json({ message: 'Log not found' });

//         await log.deleteOne();
//         return res.json({ message: 'Log deleted successfully' });
//     } catch (err) {
//         return res.status(400).json({ error: err.message });
//     }
// });

module.exports = router;
