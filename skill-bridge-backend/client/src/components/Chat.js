import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Chat({ socket, user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { partnerName, connectionId } = location.state || {};
  
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  
  const scrollRef = useRef(null);
  const room = connectionId;

  useEffect(() => {
    if (room) {
      socket.emit("join_room", room);
    }
  }, [room, socket]);

  useEffect(() => {
    const handleMessageReceive = (data) => {
      setMessageList((list) => [...list, data]);
    };
    socket.on("receive_message", handleMessageReceive);
    return () => {
      socket.off("receive_message", handleMessageReceive);
    };
  }, [socket]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList]);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: user.username,
        message: currentMessage,
        time: new Date(Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage(""); 
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  const startVideoCall = () => {
    const videoRoomId = `video-${room}-${Date.now()}`;
    const linkMsg = {
        room: room,
        author: user.username,
        message: "📞 Started a Video Call",
        type: "call_invite", 
        callLink: `/video/${videoRoomId}` 
    };
    
    socket.emit("send_message", linkMsg);
    setMessageList((list) => [...list, linkMsg]);
    navigate(`/video/${videoRoomId}`);
  };

  return (
    <div className="chat-window" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '85vh', 
      maxWidth: '600px', 
      margin: '20px auto', 
      background: '#f0f2f5', // WhatsApp-like light grey bg
      borderRadius: '16px', 
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)', 
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      
      {/* --- HEADER --- */}
      <div style={{ 
        padding: '15px 20px', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        color: 'white', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        zIndex: 10,
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Avatar Circle */}
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                👤
            </div>
            <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>{partnerName || "Chat"}</h3>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Online</span>
            </div>
        </div>

        <button 
          onClick={startVideoCall}
          style={{ 
            background: 'rgba(255,255,255,0.2)', 
            color: 'white', 
            border: '1px solid rgba(255,255,255,0.3)', 
            padding: '8px 16px', 
            borderRadius: '20px', 
            cursor: 'pointer', 
            fontSize: '0.9rem',
            transition: '0.2s'
          }}
          onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
          onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
        >
          📹 Video Call
        </button>
      </div>

      {/* --- BODY --- */}
      <div style={{ 
        flex: 1, 
        padding: '20px', 
        overflowY: 'auto', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px' 
      }}>
        {messageList.map((msg, index) => {
           const isMe = msg.author === user.username;
           return (
             <div key={index} style={{ 
               display: 'flex', 
               justifyContent: isMe ? 'flex-end' : 'flex-start' 
             }}>
               <div style={{ 
                 maxWidth: '70%', 
                 padding: '10px 14px', 
                 borderRadius: '16px', 
                 // My messages = Purple gradient, Others = White
                 background: isMe ? '#764ba2' : 'white', 
                 color: isMe ? 'white' : '#333',
                 borderBottomRightRadius: isMe ? '2px' : '16px',
                 borderBottomLeftRadius: isMe ? '16px' : '2px',
                 boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                 display: 'flex',
                 flexDirection: 'column',
                 minWidth: '80px' // Ensures small messages aren't too thin
               }}>
                 {/* Message Content */}
                 {msg.type === 'call_invite' ? (
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>📞 Incoming Video Call</p>
                        <button 
                            onClick={() => navigate(msg.callLink)}
                            style={{ 
                                background: 'white', 
                                color: '#764ba2', 
                                border: 'none', 
                                padding: '6px 12px', 
                                borderRadius: '12px', 
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '0.8rem'
                            }}
                        >
                            Join Now
                        </button>
                    </div>
                 ) : (
                    <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.4' }}>{msg.message}</p>
                 )}

                 {/* Timestamp (Right Aligned) */}
                 <span style={{ 
                     fontSize: '0.65rem', 
                     opacity: 0.7, 
                     alignSelf: 'flex-end', 
                     marginTop: '4px' 
                 }}>
                    {msg.time}
                 </span>
               </div>
             </div>
           );
        })}
        <div ref={scrollRef} />
      </div>

      {/* --- FOOTER --- */}
      <div style={{ 
        padding: '15px', 
        background: 'white', 
        borderTop: '1px solid #e0e0e0', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px',
        flexShrink: 0
      }}>
        <input
          type="text"
          value={currentMessage}
          placeholder="Type a message..."
          onChange={(event) => setCurrentMessage(event.target.value)}
          onKeyPress={handleKeyPress}
          style={{ 
            flex: 1, 
            padding: '12px 15px', 
            borderRadius: '25px', 
            border: '1px solid #ddd', 
            outline: 'none',
            fontSize: '0.95rem',
            background: '#f9f9f9'
          }}
        />
        <button 
            onClick={sendMessage} 
            style={{ 
                background: '#764ba2', 
                color: 'white', 
                border: 'none', 
                width: '45px', 
                height: '45px', 
                borderRadius: '50%', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '1.2rem',
                boxShadow: '0 2px 5px rgba(118, 75, 162, 0.4)'
            }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}

export default Chat;