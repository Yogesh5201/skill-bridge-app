const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");
const messageRoute = require('./routes/messages');
const connectRoute = require('./routes/connect'); 

// NEW IMPORTS
const sessionRoute = require('./routes/session');
const userRoute = require('./routes/users');

const app = express();
const server = http.createServer(app); 

// Middleware
app.use(cors());
app.use(express.json());

// DB Connection
mongoose.connect('mongodb+srv://admin:yjzm12345@cluster0.mf1tjm7.mongodb.net/?appName=Cluster0') // REPLACE WITH YOUR URL
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Connection Error:", err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/match', require('./routes/match'));
app.use('/api/connect', connectRoute);
app.use('/api/messages', messageRoute);

// NEW ROUTES
app.use('/api/session', sessionRoute);
app.use('/api/users', userRoute);

// Socket.io Setup
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] } // Allow all origins for deployment
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);
  socket.on("join_room", (room_id) => { socket.join(room_id); });
  socket.on("send_message", (data) => { socket.to(data.room).emit("receive_message", data); });
  socket.on("disconnect", () => { console.log("User Disconnected", socket.id); });
});

const PORT = process.env.PORT || 5000; // Use Render's port or 5000
server.listen(PORT, () => { console.log(`🚀 Server running on port ${PORT}`); });