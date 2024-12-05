const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { type: String, required: true }, // ID ou nome do remetente
    content: { type: String, required: true }, // Conteúdo da mensagem
    timestamp: { type: Date, default: Date.now }, // Hora da mensagem
});

module.exports = mongoose.model('Message', messageSchema);
