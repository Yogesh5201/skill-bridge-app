const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const sessionRoutes = require('./routes/session');

const app = express();
const server = http.createServer(app);

// --- CORS: ALLOW EVERYONE ---
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// --- DATABASE CONNECTION (FIXED) ---
// We removed the 'useNewUrlParser' and 'useUnifiedTopology' options
// because they cause the crash in your logs.
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Error:", err));

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sessions', sessionRoutes);

// --- SOCKET.IO ---
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (room) => { socket.join(room); });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("send_session_request", (data) => {
    io.to(data.receiverId).emit("session_notification", {
      senderName: data.senderName,
      message: "New session request!"
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});