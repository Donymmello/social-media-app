const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express(); // Mova esta linha para o início

const userRoutes = require('./routes/userRoutes');

app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/social-app', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

app.use('/api/users', userRoutes); // Agora está na sequência correta

const auth = require('./middleware/auth');

app.get('/api/protected', auth, (req, res) => {
    res.send(`Hello, user ${req.user.id}`);
});


app.get('/', (req, res) => {
    res.send('Backend is running!');
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
