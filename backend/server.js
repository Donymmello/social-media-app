const express = require('express');
const http = require('http'); // Para criar o servidor HTTP
const { Server } = require('socket.io'); // Servidor Socket.IO
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const server = http.createServer(app); // Criação do servidor HTTP
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000', // URL do frontend
        methods: ['GET', 'POST']
    }
});

app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/social-app', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// Middleware de rotas
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const messageRoutes = require('./routes/messageRoutes');
app.use('/api/messages', messageRoutes);

app.get('/', (req, res) => {
    res.send('Backend is running!');
});

router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Configuração do Socket.IO
io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);

    // Ouvir mensagens enviadas pelo cliente
    socket.on('sendMessage', (data) => {
        console.log('Message received:', data);

        // Enviar a mensagem para todos os clientes conectados
        io.emit('receiveMessage', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Iniciar o servidor na porta 5000
const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
