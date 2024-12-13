import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Box, TextField, Button, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';

const socket = io('http://localhost:5000');

function ChatPage() {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [file, setFile] = useState(null);
    const [newMessageId, setNewMessageId] = useState(null); // ID da mensagem mais recente
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/messages/all');
                setMessages(response.data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchMessages();

        socket.on('receiveMessage', (data) => {
            setMessages((prev) => [...prev, data]);
            setNewMessageId(data._id); // Marcar a nova mensagem recebida
            setTimeout(() => setNewMessageId(null), 3000); // Remover destaque após 3 segundos
        });

        return () => {
            socket.off('receiveMessage');
        };
    }, []);

    const sendMessage = async () => {
        if (message.trim()) {
            const newMessage = { sender: 'User1', content: message };
            socket.emit('sendMessage', newMessage);
            setMessages((prev) => [...prev, newMessage]);

            try {
                await axios.post('http://localhost:5000/api/messages/save', newMessage);
            } catch (err) {
                console.error('Failed to save message:', err);
            }

            setMessage('');
        }
    };

    const uploadFile = async () => {
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
    
            try {
                const response = await axios.post('http://localhost:5000/api/messages/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${localStorage.getItem('token')}`, // Adiciona o token JWT
                    },
                });
                socket.emit('sendMessage', response.data);
                setMessages((prev) => [...prev, response.data]);
                setFile(null);
            } catch (err) {
                console.error('Failed to upload file:', err);
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, height: '100vh' }}>
            <Typography variant="h4" sx={{ mb: 2 }}>Chat</Typography>
            <Button variant="contained" color="secondary" onClick={handleLogout} sx={{ alignSelf: 'flex-end', mb: 2 }}>
                Logout
            </Button>
            <Paper
                sx={{
                    width: '100%',
                    maxWidth: 600,
                    height: '60vh',
                    overflowY: 'auto',
                    p: 2,
                    mb: 2,
                }}
            >
               <List>
    {messages.map((msg, index) => (
        <ListItem key={index}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {msg.sender.username || 'Unknown User'} {/* Exibe o nome do usuário remetente */}
                </Typography>
                {msg.content.startsWith('http') ? (
                    msg.content.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                        <img
                            src={msg.content}
                            alt="Uploaded"
                            style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
                        />
                    ) : (
                        <a
                            href={msg.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: 'none', color: '#1976d2' }}
                        >
                            Download File
                        </a>
                    )
                ) : (
                    <Typography variant="body1">{msg.content}</Typography>
                )}
            </Box>
        </ListItem>
    ))}
</List>

            </Paper>
            <Box sx={{ display: 'flex', gap: 2, width: '100%', maxWidth: 600, mb: 2 }}>
                <TextField
                    variant="outlined"
                    fullWidth
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <Button variant="contained" color="primary" onClick={sendMessage}>
                    Send
                </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, width: '100%', maxWidth: 600 }}>
                <input type="file" onChange={(e) => setFile(e.target.files[0])} />
                <Button variant="contained" color="primary" onClick={uploadFile}>
                    Upload
                </Button>
            </Box>
        </Box>
    );
}

export default ChatPage;
