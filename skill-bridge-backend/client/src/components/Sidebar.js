import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar({ user }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <aside className="sidebar">
      <div className="brand">
        <span>⚡</span> SkillBridge
      </div>
      
      <nav>
        <Link to="/dashboard" className={`nav-item ${isActive('/dashboard')}`}>
           🏠 Dashboard
        </Link>
        <Link to="/messages" className={`nav-item ${isActive('/messages')}`}>
           💬 Messages
        </Link>
        <Link to="/schedule" className={`nav-item ${isActive('/schedule')}`}>
           📅 Schedule
        </Link>
        <Link to="/profile" className={`nav-item ${isActive('/profile')}`}>
           ⚙️ Profile
        </Link>
      </nav>

      <div className="user-profile-preview">
        <img 
          src={`https://ui-avatars.com/api/?name=${user.username}&background=0F172A&color=fff`} 
          className="avatar" style={{width:'40px', height:'40px'}} alt=""
        />
        <div>
          <div style={{fontSize:'0.9rem', fontWeight:'600'}}>{user.username}</div>
          <div style={{fontSize:'0.8rem', color:'#6b7280'}}>{user.role || 'Member'}</div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;