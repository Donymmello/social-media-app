# Documentação do Aplicativo de Chat

## Visão Geral
Este aplicativo de chat permite comunicação em tempo real entre usuários, com suporte para:
- Mensagens gerais.
- Mensagens em grupos.
- Upload e compartilhamento de mídia (imagens e documentos).

O backend utiliza Node.js com Express e MongoDB, enquanto o frontend é desenvolvido em React com integração via Socket.IO para mensagens em tempo real.

---

## Estrutura do Backend

### 1. **`server.js`**
Arquivo principal do backend. Configura o servidor, Socket.IO e rotas principais.

#### Principais Funcionalidades:
- Inicialização do servidor Express.
- Integração com Socket.IO para mensagens em tempo real.
- Configuração de middlewares globais (ex.: `cors`, `express.json`).

#### Código Simplificado:
```javascript
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const groupRoutes = require('./routes/groupRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: 'http://localhost:3000', methods: ['GET', 'POST'] },
});

app.use(cors());
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes);

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('sendMessage', (data) => {
        io.emit('receiveMessage', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

mongoose.connect('mongodb://localhost:27017/chat-app', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected')).catch((err) => console.error(err));

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

---

### 2. **Rotas do Backend**

#### a) **`messageRoutes.js`**
Responsável por gerenciar mensagens (criação, listagem e upload).

##### Principais Endpoints:
- `GET /all`: Lista todas as mensagens (gerais ou de grupo).
- `POST /save`: Salva uma mensagem de texto.
- `POST /upload`: Faz upload de arquivos e salva como mensagens.

#### b) **`userRoutes.js`**
Gerencia usuários, autenticação e registros.

##### Principais Endpoints:
- `POST /register`: Registra um novo usuário.
- `POST /login`: Autentica um usuário e retorna um token JWT.

#### c) **`groupRoutes.js`**
Gerencia grupos e associação de usuários.

##### Principais Endpoints:
- `GET /my-groups`: Lista os grupos do usuário.
- `POST /create`: Cria um novo grupo.

---

### 3. **Modelos do MongoDB**

#### a) **`Message.js`**
Modelo de mensagens.
```javascript
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: false },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);
```

#### b) **`User.js`**
Modelo de usuários.
```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

module.exports = mongoose.model('User', userSchema);
```

#### c) **`Group.js`**
Modelo de grupos.
```javascript
const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model('Group', groupSchema);
```

---

## Estrutura do Frontend

### 1. **Componentes Principais**

#### a) **`ChatPage.js`**
Componente principal do chat. Gerencia mensagens em tempo real e upload de arquivos.

##### Principais Funcionalidades:
- Renderiza mensagens gerais ou de grupos.
- Permite envio de mensagens e upload de arquivos.
- Integração com Socket.IO para mensagens em tempo real.

##### Código Simplificado:
```javascript
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

function ChatPage() {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        socket.on('receiveMessage', (data) => {
            setMessages((prev) => [...prev, data]);
        });

        return () => socket.off('receiveMessage');
    }, []);

    const sendMessage = () => {
        if (message.trim()) {
            const newMessage = { content: message };
            socket.emit('sendMessage', newMessage);
            setMessages((prev) => [...prev, newMessage]);
            setMessage('');
        }
    };

    return (
        <div>
            <div>
                {messages.map((msg, index) => (
                    <p key={index}>{msg.content}</p>
                ))}
            </div>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
}

export default ChatPage;
```

---

## Dependências

### Backend
- **Express**: Framework para criar o servidor.
- **Mongoose**: ODM para interagir com o MongoDB.
- **Socket.IO**: Comunicação em tempo real.
- **Multer**: Gerenciamento de uploads de arquivos.

### Frontend
- **React**: Biblioteca para construção da interface.
- **Axios**: Para requisições HTTP.
- **Socket.IO-Client**: Comunicação em tempo real com o backend.

---

## Instruções para Execução

### Backend
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor:
   ```bash
   node server.js
   ```

### Frontend
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o aplicativo React:
   ```bash
   npm start
   ```

---

## Considerações Finais
- Certifique-se de que o MongoDB está rodando localmente ou em um servidor configurado.
- Configure variáveis de ambiente (como `JWT_SECRET` e `DB_URI`) no backend para maior segurança.
- Teste o aplicativo em navegadores diferentes para garantir a funcionalidade em tempo real.

