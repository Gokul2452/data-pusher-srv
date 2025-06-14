const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const accountSchema = new mongoose.Schema(
    {
        email: { type: String, unique: true, required: true },
        account_name: { type: String, required: true },
        app_secret_token: { type: String, default: uuidv4 },
        account_id: { type: String, required: true, unique: true, index: true },
        is_user_account: { type: Boolean, default: false },
        website: { type: String },
        created_by: { type: String, required: true },
        updated_by: { type: String, required: true },
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
        collection: 'Account'
    });

module.exports = mongoose.model('Account', accountSchema);