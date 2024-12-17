const express = require('express');
const authMiddleware = require('../middleware/auth');
const Group = require('../models/Group');
const router = express.Router();

// Criar um novo grupo
router.post('/create', authMiddleware, async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.id;

        // Verificar se o grupo já existe
        const existingGroup = await Group.findOne({ name });
        if (existingGroup) {
            return res.status(400).json({ error: 'Group already exists.' });
        }

        // Criar o grupo e adicionar o usuário como membro inicial
        const group = await Group.create({
            name,
            members: [userId],
        });

        res.status(201).json(group);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// Listar grupos do usuário
router.get('/my-groups', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const groups = await Group.find({ members: userId }).populate('members', 'username');
        res.status(200).json(groups);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
