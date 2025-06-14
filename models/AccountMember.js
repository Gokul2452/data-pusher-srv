const mongoose = require('mongoose');

const accountMemberSchema = new mongoose.Schema(
    {
        account_id: { type: String, required: true, index: true  },
        user_id: { type: String, required: true, index: true  },
        role_id: { type: String, default: true },
        created_by: { type: String, required: true },
        updated_by: { type: String, required: true },
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
        collection: 'AccountMember'
    });

module.exports = mongoose.model('AccountMember', accountMemberSchema);