import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import API from '../api';

function Chat({ user, socket }) {
  const location = useLocation();
  const { connectionId, partnerName } = location.state || {};
  const [msg, setMsg] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    if(!connectionId) return;
    socket.emit("join_room", connectionId);
    
    API.get(`/messages/${connectionId}`).then(res => {
        const formatted = res.data.map(m => ({
          author: m.sender.username,
          message: m.text,
          time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        setChatHistory(formatted);
    });

    const handleReceive = (data) => setChatHistory((prev) => [...prev, data]);
    socket.on("receive_message", handleReceive);
    return () => socket.off("receive_message", handleReceive);
  }, [connectionId, socket]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!msg) return;
    const messageData = { room: connectionId, author: user.username, message: msg, time: new Date().toLocaleTimeString() };
    await socket.emit("send_message", messageData);
    await API.post('/messages', { connectionId, sender: user._id, text: msg });
    setChatHistory((prev) => [...prev, messageData]);
    setMsg("");
  };

  return (
    <div className="app-layout" style={{ justifyContent: 'center', padding: '40px', background: '#f3f4f6' }}>
      <div className="chat-layout" style={{ width: '100%', maxWidth: '900px', height: '85vh' }}>
        
        {/* Header */}
        <div className="chat-header">
          <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
            <Link to="/dashboard" style={{textDecoration:'none', color:'#6b7280', fontSize:'1.2rem'}}>←</Link>
            <div>
               <div style={{fontWeight:'700', fontSize:'1.1rem'}}>{partnerName}</div>
               <div style={{fontSize:'0.8rem', color:'#10b981'}}>● Online</div>
            </div>
          </div>
          <button 
             onClick={() => window.open(`https://meet.jit.si/skillbridge-${connectionId}`, '_blank')}
             style={{background:'#ef4444', color:'white', border:'none', padding:'8px 16px', borderRadius:'6px', cursor:'pointer', fontWeight:'600'}}>
             🎥 Video Call
          </button>
        </div>

        {/* Body */}
        <div className="chat-body">
          {chatHistory.map((m, index) => (
            <div key={index} className={`message-bubble ${m.author === user.username ? 'msg-me' : 'msg-them'}`}>
              <div>{m.message}</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '4px', textAlign: 'right' }}>{m.time}</div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Footer */}
        <form className="chat-footer" onSubmit={sendMessage}>
          <input 
            value={msg} 
            onChange={(e) => setMsg(e.target.value)} 
            placeholder="Type your message..." 
            style={{flex:1, padding:'12px', borderRadius:'8px', border:'1px solid #e5e7eb', outline:'none'}}
          />
          <button type="submit" style={{background:'#10b981', color:'white', border:'none', padding:'0 20px', borderRadius:'8px', cursor:'pointer'}}>Send</button>
        </form>

      </div>
    </div>
  );
}

export default Chat;