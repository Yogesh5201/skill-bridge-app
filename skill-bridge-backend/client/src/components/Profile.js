import React, { useState } from 'react';
import Sidebar from './Sidebar';

function Profile({ user }) {
  const [formData, setFormData] = useState({
    gender: user.gender || 'Other',
    role: user.role || 'Member',
    bio: "I love learning new skills!"
  });

  const handleSave = async () => {
    // In a real app, you'd call API.put here.
    // Since we aren't using the API variable yet, we just alert.
    alert("Profile Updated! (Backend update route required for persistence)");
  };

  return (
    <div className="app-layout">
      <Sidebar user={user} />
      <main className="main-content">
        <div className="page-title">
          <h2>Edit Profile</h2>
        </div>

        <div className="card" style={{maxWidth: '600px'}}>
          <div style={{display:'flex', alignItems:'center', gap:'20px', marginBottom:'30px'}}>
            <img src={`https://ui-avatars.com/api/?name=${user.username}&background=0F172A&color=fff`} className="avatar" style={{width:'80px', height:'80px'}} alt=""/>
            <div>
              <h3>{user.username}</h3>
              <p>{user.email}</p>
            </div>
          </div>

          <label style={{fontWeight:'bold', display:'block', marginBottom:'8px'}}>Gender</label>
          <select 
            className="search-input" 
            style={{marginBottom:'20px'}}
            value={formData.gender}
            onChange={e => setFormData({...formData, gender: e.target.value})}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <label style={{fontWeight:'bold', display:'block', marginBottom:'8px'}}>Role / Job Title</label>
          <input 
            className="search-input" 
            style={{marginBottom:'20px'}}
            value={formData.role} 
            onChange={e => setFormData({...formData, role: e.target.value})}
          />

          <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
        </div>
      </main>
    </div>
  );
}

export default Profile;