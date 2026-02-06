import React, { useState } from 'react';
import API from '../api';
import { useNavigate, Link } from 'react-router-dom';

function Register({ setUser }) {
  const [formData, setFormData] = useState({
    username: '', 
    email: '', 
    password: '', 
    role: 'Learner', 
    skills: '', 
    interests: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Clean up the skills/interests (turn "Java, HTML" into ["Java", "HTML"])
      const dataToSend = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()),
        interests: formData.interests.split(',').map(s => s.trim())
      };

      // Send to Backend
      const { data } = await API.post('/auth/register', dataToSend);
      
      // If successful:
      alert("Registration Successful!");
      setUser(data);
      navigate('/dashboard');
      
    } catch (err) {
      console.error(err);
      
      // --- THIS BLOCK FIXES THE "[object Object]" ERROR ---
      // It looks inside the error object to find the actual text message
      const errorMessage = 
        err.response?.data?.message || 
        err.message || 
        "Registration Failed. Please try again.";
      
      alert(`Error: ${errorMessage}`);
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
            placeholder="Password" 
            type="password" 
            required
            onChange={e => setFormData({...formData, password: e.target.value})} 
          />
          
          <div style={{textAlign:'left', margin:'10px 0', fontSize:'0.9rem', color:'#666'}}>
            <label>I want to:</label>
            <select 
              style={{marginTop:'5px', width: '100%', padding: '10px'}}
              value={formData.role} 
              onChange={e => setFormData({...formData, role: e.target.value})}
            >
              <option value="Learner">Learn Skills</option>
              <option value="Helper">Teach Skills</option>
            </select>
          </div>

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