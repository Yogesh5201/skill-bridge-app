import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import io from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import all your components
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import Messages from './components/Messages';
import Schedule from './components/Schedule';
import Profile from './components/Profile';

// Initialize Socket Connection
// Uses the Render URL if live, or Localhost if testing
const socket = io.connect(
  process.env.NODE_ENV === 'production' 
    ? 'https://skill-bridge-app.onrender.com' 
    : 'http://localhost:5000'
);

function App() {
  // 1. User State (Persist login across refreshes)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("skillBridgeUser");
    return saved ? JSON.parse(saved) : null;
  });

  // 2. Global Notification System
  useEffect(() => {
    if (user) {
      // Join a unique room for this user so they can receive personal alerts
      socket.emit("join_room", user._id); 
      
      // Listener: New Chat Message
      const handleChat = (data) => {
        // Only notify if the message isn't from me
        if (data.author !== user.username) {
          toast.info(`💬 New message from ${data.author}`);
        }
      };

      // Listener: New Session/Booking Request
      const handleSession = (data) => {
         toast.success(`📅 New Session Request from ${data.senderName}!`);
      };

      // Attach Listeners
      socket.on("receive_message", handleChat);
      socket.on("session_notification", handleSession);

      // Cleanup Listeners on Unmount
      return () => {
        socket.off("receive_message", handleChat);
        socket.off("session_notification", handleSession);
      };
    }
  }, [user]);

  // 3. Login/Logout Handlers
  const handleLogin = (userData) => {
    localStorage.setItem("skillBridgeUser", JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("skillBridgeUser");
    setUser(null);
  };

  return (
    <Router>
      <div className="app-container">
        {/* Pop-up Notification Container */}
        <ToastContainer position="top-right" autoClose={3000} />
        
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route 
            path="/" 
            element={!user ? <Login setUser={handleLogin} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/register" 
            element={!user ? <Register setUser={handleLogin} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/login" 
            element={!user ? <Login setUser={handleLogin} /> : <Navigate to="/dashboard" />} 
          />
          
          {/* --- PROTECTED ROUTES (Require Login) --- */}
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard user={user} /> : <Navigate to="/" />} 
          />
          
          <Route 
            path="/messages" 
            element={user ? <Messages user={user} /> : <Navigate to="/" />} 
          />

          <Route 
            path="/schedule" 
            element={user ? <Schedule user={user} /> : <Navigate to="/" />} 
          />

          <Route 
            path="/profile" 
            element={user ? <Profile user={user} /> : <Navigate to="/" />} 
          />
          
          {/* Chat needs Socket passed to it for real-time messaging */}
          <Route 
            path="/chat" 
            element={user ? <Chat user={user} socket={socket} /> : <Navigate to="/" />} 
          />
          
          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;