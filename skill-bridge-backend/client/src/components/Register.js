import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Register({ setUser }) {
  const [form, setForm] = useState({
    username: '', email: '', password: '', offered: '', wanted: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        username: form.username,
        email: form.email,
        password: form.password,
        skillsOffered: form.offered.split(',').map(s => s.trim()),
        skillsWanted: form.wanted.split(',').map(s => s.trim())
      };

      const res = await axios.post('http://localhost:5000/api/auth/register', payload);
      alert("Registration Successful!");
      setUser({ ...payload, _id: res.data.user }); 
    } catch (err) {
      alert("Error: " + (err.response?.data || "Registration Failed"));
    }
  };

  return (
    <div className="auth-form">
      <h2>Join Skill Bridge 🌉</h2>
      <p style={{ color: '#6b7280', marginTop: 0 }}>Start swapping skills today</p>

      <form onSubmit={handleSubmit}>
        <input placeholder="Username" onChange={e => setForm({...form, username: e.target.value})} required />
        <input placeholder="Email" type="email" onChange={e => setForm({...form, email: e.target.value})} required />
        <input placeholder="Password" type="password" onChange={e => setForm({...form, password: e.target.value})} required />
        
        <div style={{ textAlign: 'left', marginTop: '10px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#374151' }}>I can Teach:</label>
          <input placeholder="e.g. Java, Python" onChange={e => setForm({...form, offered: e.target.value})} required />
        </div>

        <div style={{ textAlign: 'left' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#374151' }}>I want to Learn:</label>
          <input placeholder="e.g. Guitar, Cooking" onChange={e => setForm({...form, wanted: e.target.value})} required />
        </div>
        
        <button type="submit">Sign Up</button>
      </form>

      <p style={{ marginTop: '20px', fontSize: '0.9rem' }}>
        Already have an account? <Link to="/login" style={{ color: '#4f46e5', fontWeight: 'bold' }}>Login here</Link>
      </p>
    </div>
  );
}

export default Register;