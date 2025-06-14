const queue = require('../jobs/dataQuece');
const axios = require('axios');
const Logger = require('../models/Logger');
const { v4: uuidv4 } = require('uuid');
const LoggerStatusEnum = require('../enums/LoggerStatus.enums');


queue.process(async (job, done) => {
    const { account_id, destination_id, dest, payload, receivedAt } = job.data;

    let status;
    let processedAt = new Date();

    try {
        const config = {
            method: dest.http_method,
            url: dest.url,
            headers: dest.headers
        };

        if (dest.http_method.toLowerCase() === 'get') {
            config.params = payload;
        } else {
            config.data = payload;
        }
        await axios(config);
        status = LoggerStatusEnum.SUCCESS;
    } catch (err) {
        // console.error('Webhook send failed:', err.message);
        status = LoggerStatusEnum.FAILED;
    }

    const new_logger = new Logger({
        account_id,
        destination_id,
        received_timestamp: receivedAt,
        processed_timestamp: processedAt,
        received_data: payload,
        status
    })

    await new_logger.save();

    done();
})