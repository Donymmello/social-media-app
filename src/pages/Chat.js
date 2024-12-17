import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    Select,
    MenuItem,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';

const socket = io('http://localhost:5000');

function ChatPage() {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [file, setFile] = useState(null);
    const [groups, setGroups] = useState([]); // Lista de grupos
    const [selectedGroup, setSelectedGroup] = useState(''); // Grupo selecionado
    const [newGroupName, setNewGroupName] = useState(''); // Nome do novo grupo
    const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false); // Controle do modal
    const navigate = useNavigate();

    // Buscar grupos do usuário
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/groups/my-groups', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setGroups(response.data);
            } catch (err) {
                console.error('Failed to fetch groups:', err);
            }
        };

        fetchGroups();
    }, []);

    // Buscar mensagens do grupo selecionado
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const endpoint = selectedGroup
                    ? `http://localhost:5000/api/messages?group=${selectedGroup}`
                    : `http://localhost:5000/api/messages`;
                const response = await axios.get(endpoint, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setMessages(response.data);
            } catch (err) {
                console.error('Failed to fetch messages:', err);
            }
        };

        fetchMessages();

        const handleReceiveMessage = (data) => {
            if (!selectedGroup || data.group === selectedGroup) {
                setMessages((prev) => [...prev, data]);
            }
        };

        socket.on('receiveMessage', handleReceiveMessage);

        return () => {
            socket.off('receiveMessage', handleReceiveMessage);
        };
    }, [selectedGroup]);

    // Enviar mensagem
    const sendMessage = async () => {
        if (message.trim()) {
            const newMessage = selectedGroup
                ? { content: message, group: selectedGroup }
                : { content: message };
    
            // Adiciona a mensagem localmente com o remetente "You"
            setMessages((prev) => [
                ...prev,
                { ...newMessage, sender: { username: 'You' } },
            ]);
    
            socket.emit('sendMessage', newMessage);
    
            try {
                // Envia a mensagem ao backend
                const response = await axios.post('http://localhost:5000/api/messages/save', newMessage, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
    
                // Atualiza a mensagem local com a versão populada do backend
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.content === newMessage.content ? response.data : msg
                    )
                );
            } catch (err) {
                console.error('Failed to save message:', err);
            }
    
            setMessage('');
        }
    };    

    // Criar novo grupo
    const handleCreateGroup = async () => {
        if (newGroupName.trim()) {
            try {
                const response = await axios.post(
                    'http://localhost:5000/api/groups/create',
                    { name: newGroupName },
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );
                setGroups((prev) => [...prev, response.data]); // Adiciona o novo grupo à lista
                setIsCreateGroupOpen(false); // Fecha o modal
                setNewGroupName(''); // Limpa o campo de entrada
            } catch (err) {
                console.error('Failed to create group:', err);
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
            <Select
                value={selectedGroup || ''}
                onChange={(e) => setSelectedGroup(e.target.value)}
                sx={{ mb: 2, width: '100%', maxWidth: 600 }}
                displayEmpty
            >
                <MenuItem value="">
                    <em>General Chat</em>
                </MenuItem>
                {groups.map((group) => (
                    <MenuItem key={group._id} value={group._id}>
                        {group.name}
                    </MenuItem>
                ))}
            </Select>
            <Button
                variant="outlined"
                color="primary"
                onClick={() => setIsCreateGroupOpen(true)}
                sx={{ mb: 2 }}
            >
                Create Group
            </Button>
            <Dialog open={isCreateGroupOpen} onClose={() => setIsCreateGroupOpen(false)}>
                <DialogTitle>Create a New Group</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Group Name"
                        type="text"
                        fullWidth
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsCreateGroupOpen(false)} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleCreateGroup} color="primary">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
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
                                    {msg.sender?.username || 'Unknown User'}
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
        </Box>
    );
}

export default ChatPage;
