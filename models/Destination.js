const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
    account_id: { type: String, ref: 'Account', required: true },
    url: { type: String, required: true },
    http_method: { type: String, required: true },
    headers: { type: Object, required: true }
});

module.exports = mongoose.model('Destination', destinationSchema);