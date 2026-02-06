import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Login({ setUser }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      setUser(res.data.user);
      navigate('/dashboard'); 
    } catch (err) {
      alert("Login Failed: " + (err.response?.data || "Invalid credentials"));
    }
  };

  return (
    <div className="auth-form">
      <h2>Welcome Back 👋</h2>
      <p style={{ color: '#6b7280', marginTop: 0 }}>Login to continue</p>
      
      <form onSubmit={handleSubmit}>
        <input 
          placeholder="Email" 
          type="email"
          onChange={e => setForm({...form, email: e.target.value})} 
          required 
        />
        <input 
          placeholder="Password" 
          type="password"
          onChange={e => setForm({...form, password: e.target.value})} 
          required 
        />
        
        <button type="submit">Login</button>
      </form>

      <p style={{ marginTop: '20px', fontSize: '0.9rem' }}>
        New here? <Link to="/register" style={{ color: '#4f46e5', fontWeight: 'bold' }}>Create an account</Link>
      </p>
    </div>
  );
}

export default Login;