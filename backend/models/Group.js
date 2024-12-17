const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // Nome único do grupo
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // IDs dos membros
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Group', groupSchema);
