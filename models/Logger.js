const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const LoggerStatusEnum = require('../enums/LoggerStatus.enums')
const loggerSchema = new mongoose.Schema(
    {
        event_id: { type: String, default: uuidv4 },
        account_id: { type: String, required: true, index: true },
        received_timestamp: { type: Date },
        processed_timestamp: { type: Date },
        destination_id: { type: String, index: true },
        received_data: { type: {} },
        status: { type: String, enum: Object.values(LoggerStatusEnum), index: true },
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
        collection: 'Logger'
    });

module.exports = mongoose.model('Logger', loggerSchema);