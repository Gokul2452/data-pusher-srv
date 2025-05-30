const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const accountSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    account_name: { type: String, required: true },
    app_secret_token: { type: String, default: uuidv4 },
    account_id: {  type: String, default: uuidv4 },
    website: { type: String },
});

module.exports = mongoose.model('Account', accountSchema);