import React, { useState } from 'react';
import API from '../api';
import { useNavigate, Link } from 'react-router-dom';

function Register({ setUser }) {
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', 
    gender: 'Male', category: 'Tech', 
    skills: '', interests: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send simple data. The new backend will handle the mapping.
      const dataToSend = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()),
        interests: formData.interests.split(',').map(s => s.trim())
      };

      const { data } = await API.post('/auth/register', dataToSend);
      
      alert("Registration Successful!");
      setUser(data);
      navigate('/dashboard');
      
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Registration Failed";
      alert(`Error: ${msg}`);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Join SkillBridge</h2>
        <form onSubmit={handleSubmit}>
          <input placeholder="Username" required onChange={e => setFormData({...formData, username: e.target.value})} />
          <input placeholder="Email" type="email" required onChange={e => setFormData({...formData, email: e.target.value})} />
          <input placeholder="Password (Min 6 chars)" type="password" required minLength="6" onChange={e => setFormData({...formData, password: e.target.value})} />
          
          <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
            <select style={{flex: 1, padding: '10px'}} value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <select style={{flex: 1, padding: '10px'}} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              <option value="Tech">Tech</option>
              <option value="Art">Art</option>
              <option value="Music">Music</option>
              <option value="Lifestyle">Lifestyle</option>
            </select>
          </div>

          <input placeholder="Skills I have (e.g. Java)" onChange={e => setFormData({...formData, skills: e.target.value})} />
          <input placeholder="Skills I want (e.g. React)" onChange={e => setFormData({...formData, interests: e.target.value})} />

          <button type="submit" className="btn-primary">Sign Up</button>
        </form>
        <p style={{marginTop:'20px'}}>Already have an account? <Link to="/login">Login here</Link></p>
      </div>
    </div>
  );
}

export default Register;