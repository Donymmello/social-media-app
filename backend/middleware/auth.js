const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret'); // Substitua pela sua chave secreta
        req.user = decoded; // Adiciona o ID do usuário à requisição
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};
