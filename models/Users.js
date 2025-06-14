const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const usersSchema = new mongoose.Schema(
    {
        email: { type: String, unique: true, required: true },
        password: { type: String, required: true },
        sub: { type: String, default: uuidv4, index: true  },
        created_by: { type: String, required: true },
        updated_by: { type: String, required: true },
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
        collection: 'Users'
    });

module.exports = mongoose.model('Users', usersSchema);