const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const TokensSchema = new mongoose.Schema(
    {
        token: { type: String, required: true },
        is_active: { type: Boolean, default: true },
        user_id: { type: String }
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
        collection: 'Tokens'
    });

module.exports = mongoose.model('Tokens', TokensSchema);