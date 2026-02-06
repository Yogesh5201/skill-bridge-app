import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import Sidebar from './Sidebar';

function Messages({ user }) {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await API.get(`/connect/${user._id}`);
        // Filter only accepted connections
        const activeChats = res.data.filter(c => c.status === 'accepted').map(c => {
          const partner = c.requester._id === user._id ? c.recipient : c.requester;
          return { ...c, partner };
        });
        setConversations(activeChats);
      } catch (err) { console.error(err); }
    };
    fetchChats();
  }, [user._id]);

  return (
    <div className="app-layout">
      <Sidebar user={user} />
      <main className="main-content">
        <div className="page-title" style={{marginBottom: '30px'}}>
          <h2>Messages</h2>
          <p>Your active conversations.</p>
        </div>

        <div className="grid-container">
          {conversations.length === 0 ? <p>No active chats yet. Connect with someone first!</p> : 
            conversations.map(chat => (
              <Link 
                to="/chat" 
                key={chat._id}
                state={{ partnerName: chat.partner.username, connectionId: chat._id }}
                style={{textDecoration: 'none', color: 'inherit'}}
              >
                <div className="card" style={{flexDirection: 'row', alignItems: 'center', cursor: 'pointer'}}>
                  <img src={`https://ui-avatars.com/api/?name=${chat.partner.username}&background=random`} className="avatar" alt=""/>
                  <div style={{marginLeft: '15px'}}>
                    <div style={{fontWeight: '700', fontSize: '1.1rem'}}>{chat.partner.username}</div>
                    <div style={{color: '#6b7280', fontSize: '0.9rem'}}>Click to chat</div>
                  </div>
                  <div style={{marginLeft: 'auto', color: '#10b981', fontWeight: '600'}}>
                    Open 💬
                  </div>
                </div>
              </Link>
            ))
          }
        </div>
      </main>
    </div>
  );
}

export default Messages;