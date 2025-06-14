const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema(
    {
        account_id: { type: String, index: true },
        url: { type: String, required: true },
        http_method: { type: String, required: true, index: true },
        headers: { type: Object, required: true },
        created_by: { type: String, required: true },
        updated_by: { type: String, required: true },
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
        collection: 'Destination'
    });

module.exports = mongoose.model('Destination', destinationSchema);