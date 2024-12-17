const express = require('express');
const multer = require('multer');
const path = require('path');
const Message = require('../models/Message');
const router = express.Router();
const authMiddleware = require('../middleware/auth'); // Middleware para autenticação


// Configuração do armazenamento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isImage = /jpeg|jpg|png|gif/.test(file.mimetype);
        const folder = isImage ? 'uploads/images' : 'uploads/documents';
        cb(null, folder); // Define subpasta com base no tipo de arquivo
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

// Configuração do multer com validação de tipo e tamanho
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif|pdf|docx/;
        const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = fileTypes.test(file.mimetype);

        if (extName && mimeType) {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos de imagem ou documentos são permitidos.'));
        }
    },
});

router.get('/all', async (req, res) => {
    try {
        const messages = await Message.find().populate('sender', 'username'); // Inclui o nome do remetente
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/all', async (req, res) => {
    try {
        const { group } = req.query;
        const filter = group ? { group } : { group: null }; // Filtra por grupo ou mensagens gerais
        const messages = await Message.find(filter).populate('sender', 'username'); // Popula o campo 'username'
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/save', authMiddleware, async (req, res) => {
    try {
        const { content, group } = req.body;
        const userId = req.user.id; // ID do usuário autenticado

        const message = await Message.create({
            sender: userId, // Associa o usuário autenticado
            content,
            group: group || null, // Grupo opcional
        });

        const populatedMessage = await message.populate('sender', 'username'); // Popula o nome do remetente
        res.status(201).json(populatedMessage); // Retorna mensagem completa com o nome do usuário
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// Rota para upload de mídia
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        const userId = req.user.id; // ID do usuário autenticado

        const fileUrl = file.mimetype.startsWith('image')
            ? `http://localhost:5000/uploads/images/${file.filename}`
            : `http://localhost:5000/uploads/documents/${file.filename}`;

        const message = await Message.create({
            sender: userId,
            content: fileUrl,
        });

        res.status(201).json(message);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
