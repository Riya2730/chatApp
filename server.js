const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const Message = require('./models/Message');

const app = express();

// ✅ This line serves your frontend files from the "public" folder
app.use(express.static('public'));

const server = http.createServer(app);
const io = socketIo(server);
const PORT = 3000;

const MONGO_URI = 'mongodb+srv://chatuser:chatpass123@chatapp.de5fymn.mongodb.net/?retryWrites=true&w=majority&appName=ChatApp';

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// 🟢 Optional: Root route message (not used since we're serving index.html)
app.get('/', (req, res) => {
  res.send('Chat Server is Running');
});

// 🔄 Get all messages for history
app.get('/messages', async (req, res) => {
  const messages = await Message.find().sort({ timestamp: 1 });
  res.json(messages);
});

// 📡 WebSocket connections
io.on('connection', (socket) => {
  console.log('New user connected');

  socket.on('chat message', async (data) => {
    const newMsg = new Message({
      username: data.username,
      message: data.message
    });
    await newMsg.save();
    io.emit('chat message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// 🚀 Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
