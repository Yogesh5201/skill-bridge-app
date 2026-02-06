import React, { useState, useEffect } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

function Dashboard({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await API.get('/users'); // Fetch all users
        
        // Filter out yourself (you shouldn't see yourself in the list)
        const others = data.filter(u => u._id !== user._id);
        setUsers(others);
        setLoading(false);
      } catch (err) {
        console.error("Dashboard Error:", err);
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user]);

  // --- HELPER TO START CHAT ---
  const startChat = (otherUser) => {
    // Navigate to chat with this specific user
    // (You can implement the room logic later)
    navigate('/chat'); 
  };

  return (
    <div className="main-content">
      <div className="header-row">
        <div className="page-title">
          <h2>Find Your Match 🚀</h2>
          <p>Connect with people who have the skills you need.</p>
        </div>
      </div>

      {loading ? (
        <p>Loading profiles...</p>
      ) : users.length === 0 ? (
        <div className="card" style={{textAlign: 'center', padding: '40px'}}>
          <h3>No one else is here yet! 🦗</h3>
          <p>Create a second account in an Incognito window to test the matching.</p>
        </div>
      ) : (
        <div className="grid-container">
          {users.map((u) => (
            <div key={u._id} className="card">
              <div className="card-header">
                {/* Random Avatar based on name */}
                <img 
                  src={`https://ui-avatars.com/api/?name=${u.username}&background=random`} 
                  alt="avatar" 
                  className="avatar" 
                />
                <div>
                  <h3 style={{margin:0}}>{u.username}</h3>
                  <span style={{fontSize:'0.8rem', color:'#666'}}>{u.category || 'Member'}</span>
                </div>
              </div>

              {/* --- SMART SKILLS DISPLAY --- */}
              <div style={{marginBottom: '15px'}}>
                <small style={{fontWeight:'bold', color:'#4f46e5'}}>TEACHES:</small>
                <div className="tags-container">
                  {/* Checks for 'skillsOffered' (DB name) OR 'skills' (Old name) */}
                  {(u.skillsOffered && u.skillsOffered.length > 0 ? u.skillsOffered : u.skills || []).map((skill, i) => (
                    <span key={i} className="tag teach">{skill}</span>
                  ))}
                </div>
              </div>

              <div style={{marginBottom: '20px'}}>
                <small style={{fontWeight:'bold', color:'#db2777'}}>WANTS TO LEARN:</small>
                <div className="tags-container">
                  {(u.skillsWanted && u.skillsWanted.length > 0 ? u.skillsWanted : u.interests || []).map((skill, i) => (
                    <span key={i} className="tag want">{skill}</span>
                  ))}
                </div>
              </div>

              <button onClick={() => startChat(u)} className="btn-primary">
                Message {u.username.split(' ')[0]}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;