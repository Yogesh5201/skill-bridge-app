import React, { useEffect, useState } from 'react';
import API from '../api';
import Sidebar from './Sidebar';

function Schedule({ user }) {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    API.get(`/session/${user._id}`).then(res => setSessions(res.data));
  }, [user._id]);

  const acceptSession = async (sessionId) => {
    await API.put('/session/accept', { sessionId });
    // Refresh list
    const res = await API.get(`/session/${user._id}`);
    setSessions(res.data);
  };

  const pending = sessions.filter(s => s.status === 'pending' && s.recipient._id === user._id);
  const confirmed = sessions.filter(s => s.status === 'confirmed');

  return (
    <div className="app-layout">
      <Sidebar user={user} />
      <main className="main-content">
        
        {/* Pending Requests */}
        <div className="page-title" style={{marginBottom: '20px'}}>
          <h2>Session Requests</h2>
        </div>
        
        {pending.length === 0 ? <p style={{color:'#6b7280', marginBottom:'40px'}}>No pending requests.</p> : (
          <div className="grid-container" style={{marginBottom:'40px'}}>
            {pending.map(s => (
              <div key={s._id} className="card" style={{borderLeft: '4px solid #f59e0b'}}>
                <h4>From: {s.requester.username}</h4>
                <p>Date: {new Date(s.date).toLocaleString()}</p>
                <button className="btn btn-primary" onClick={() => acceptSession(s._id)}>Confirm Meeting</button>
              </div>
            ))}
          </div>
        )}

        {/* Confirmed Schedule */}
        <div className="page-title" style={{marginBottom: '20px'}}>
          <h2>Upcoming Schedule</h2>
        </div>

        {confirmed.length === 0 ? <p style={{color:'#6b7280'}}>No upcoming sessions.</p> : (
          <div className="grid-container">
            {confirmed.map(s => (
              <div key={s._id} className="card" style={{borderLeft: '4px solid #10b981'}}>
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <div>
                    <h4>With: {s.requester._id === user._id ? s.recipient.username : s.requester.username}</h4>
                    <p style={{color:'#10b981', fontWeight:'bold'}}>{new Date(s.date).toLocaleString()}</p>
                  </div>
                  <div style={{background:'#ecfdf5', color:'#059669', padding:'5px 10px', borderRadius:'15px', height:'fit-content', fontSize:'0.8rem'}}>
                    Confirmed
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}

export default Schedule;