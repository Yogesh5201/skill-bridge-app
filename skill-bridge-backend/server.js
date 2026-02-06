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

// --- CORS CONFIGURATION (CRITICAL) ---
// Add your Vercel URL to this list
const allowedOrigins = [
  "http://localhost:3000",
  "https://skill-bridge-app.vercel.app" // <--- REPLACE WITH YOUR VERCEL URL
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Error:", err));

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sessions', sessionRoutes);

// --- SOCKET.IO ---
const io = new Server(server, {
  cors: {
    origin: allowedOrigins, // Use the same allowed origins list
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User with ID: ${socket.id} joined room: ${room}`);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("send_session_request", (data) => {
    // Notify the specific user (receiverId)
    io.to(data.receiverId).emit("session_notification", {
      senderName: data.senderName,
      message: "New session request!"
    });
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

// --- SERVER START ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});