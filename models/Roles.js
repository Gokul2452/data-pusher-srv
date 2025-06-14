const mongoose = require('mongoose');

const RolesSchema = new mongoose.Schema(
    {
        role_name: { type: String, required: true },
        role_id: { type: String, required: true, unique: true }
    },
    {
        collection: 'Roles'
    }
);

module.exports = mongoose.model('Roles', RolesSchema);