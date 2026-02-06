import React, { useState } from 'react';
import API from '../api';
import { useNavigate, Link } from 'react-router-dom';

function Register({ setUser }) {
  const [formData, setFormData] = useState({
    username: '', 
    email: '', 
    password: '', 
    gender: 'Male',    
    category: 'Tech',  
    skills: '', 
    interests: ''
    // removed 'role' from here, backend will default it to "Member"
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create the data object to send
      const dataToSend = {
        ...formData,
        role: "Member", // Hardcode role since we removed the dropdown
        skills: formData.skills.split(',').map(s => s.trim()),
        interests: formData.interests.split(',').map(s => s.trim())
      };

      const { data } = await API.post('/auth/register', dataToSend);
      
      alert("Registration Successful!");
      setUser(data);
      navigate('/dashboard');
      
    } catch (err) {
      console.error("Register Error:", err);
      
      // Get the specific error message from the backend
      let message = "Registration Failed";
      if (err.response && err.response.data) {
        // Mongoose validation errors often come in an 'errors' array or a 'msg' field
        message = err.response.data.message || 
                  err.response.data.error || 
                  err.response.data.msg || 
                  JSON.stringify(err.response.data);
      } else if (err.message) {
        message = err.message;
      }
      
      alert(`Error: ${message}`);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Join SkillBridge</h2>
        <form onSubmit={handleSubmit}>
          <input 
            placeholder="Username" 
            required
            onChange={e => setFormData({...formData, username: e.target.value})} 
          />
          <input 
            placeholder="Email" 
            type="email" 
            required
            onChange={e => setFormData({...formData, email: e.target.value})} 
          />
          <input 
            placeholder="Password (Min 6 chars)" 
            type="password" 
            required
            minLength="6" 
            onChange={e => setFormData({...formData, password: e.target.value})} 
          />
          
          {/* Gender & Category Row */}
          <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
            <select 
              style={{flex: 1, padding: '10px'}}
              value={formData.gender} 
              onChange={e => setFormData({...formData, gender: e.target.value})}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            <select 
              style={{flex: 1, padding: '10px'}}
              value={formData.category} 
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
              <option value="Tech">Tech</option>
              <option value="Art">Art</option>
              <option value="Music">Music</option>
              <option value="Lifestyle">Lifestyle</option>
            </select>
          </div>

          {/* REMOVED "I want to" SECTION HERE */}

          <input 
            placeholder="Skills I have (e.g. Java, Math)" 
            onChange={e => setFormData({...formData, skills: e.target.value})} 
          />
          <input 
            placeholder="Skills I want to learn (e.g. React, Cooking)" 
            onChange={e => setFormData({...formData, interests: e.target.value})} 
          />

          <button type="submit" className="btn-primary">Sign Up</button>
        </form>
        <p style={{marginTop:'20px'}}>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;