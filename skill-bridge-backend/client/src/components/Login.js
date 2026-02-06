import React, { useState } from 'react';
import API from '../api';
import { useNavigate, Link } from 'react-router-dom';

function Login({ setUser }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/auth/login', formData);
      alert("Login Successful!");
      setUser(data);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      let message = "Login Failed";
      if (err.response && err.response.data && err.response.data.message) {
        message = err.response.data.message;
      }
      alert(`Error: ${message}`);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Welcome Back 👋</h2>
        <p style={{marginBottom: '20px', color: '#666'}}>Login to continue</p>
        
        <form onSubmit={handleSubmit}>
          <input 
            placeholder="Email" 
            type="email" 
            required
            onChange={e => setFormData({...formData, email: e.target.value})} 
          />
          <input 
            placeholder="Password" 
            type="password" 
            required
            onChange={e => setFormData({...formData, password: e.target.value})} 
          />
          
          <button type="submit" className="btn-primary">Login</button>
        </form>
        
        <p style={{marginTop:'20px'}}>
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;