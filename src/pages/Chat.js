import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000'); // Conecta ao servidor Socket.IO

function ChatPage() {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Ouvir mensagens recebidas do servidor
        socket.on('receiveMessage', (data) => {
            setMessages((prev) => [...prev, data]);
        });

        return () => {
            socket.off('receiveMessage'); // Limpar eventos ao desmontar
        };
    }, []);

    const sendMessage = () => {
        socket.emit('sendMessage', message); // Enviar mensagem para o servidor
        setMessage(''); // Limpar o campo de texto
    };

    const handleLogout = () => {
        localStorage.removeItem('token'); // Remove o token do armazenamento local
        navigate('/login'); // Redireciona para a página de login
    };

    return (
        <div>
            <h1>Chat</h1>
            <button onClick={handleLogout}>Logout</button> {/* Botão de logout */}
            <div>
                {messages.map((msg, index) => (
                    <p key={index}>{msg}</p>
                ))}
            </div>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
}

export default ChatPage;
