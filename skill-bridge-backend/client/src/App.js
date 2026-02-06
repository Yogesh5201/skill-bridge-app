import React, { useState, useEffect } from 'react';
import './App.css';  // <--- THIS IS CRITICAL FOR YOUR DESIGN!
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import io from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import Components
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import Messages from './components/Messages';
import Schedule from './components/Schedule';
import Profile from './components/Profile';

// Initialize Socket with your Render URL
const socket = io.connect(
  process.env.NODE_ENV === 'production' 
    ? 'https://skill-bridge-app.onrender.com' 
    : 'http://localhost:5000'
);

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("skillBridgeUser");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      socket.emit("join_room", user._id); 
      
      const handleChat = (data) => {
        if (data.author !== user.username) {
          toast.info(`💬 New message from ${data.author}`);
        }
      };

      const handleSession = (data) => {
         toast.success(`📅 New Session Request from ${data.senderName}!`);
      };

      socket.on("receive_message", handleChat);
      socket.on("session_notification", handleSession);

      return () => {
        socket.off("receive_message", handleChat);
        socket.off("session_notification", handleSession);
      };
    }
  }, [user]);

  const handleLogin = (userData) => {
    localStorage.setItem("skillBridgeUser", JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <Router>
      <div className="app-container">
        <ToastContainer position="top-right" autoClose={3000} />
        
        <Routes>
          <Route path="/" element={!user ? <Login setUser={handleLogin} /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <Register setUser={handleLogin} /> : <Navigate to="/dashboard" />} />
          <Route path="/login" element={!user ? <Login setUser={handleLogin} /> : <Navigate to="/dashboard" />} />
          
          <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/" />} />
          <Route path="/messages" element={user ? <Messages user={user} /> : <Navigate to="/" />} />
          <Route path="/schedule" element={user ? <Schedule user={user} /> : <Navigate to="/" />} />
          <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/" />} />
          <Route path="/chat" element={user ? <Chat user={user} socket={socket} /> : <Navigate to="/" />} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;