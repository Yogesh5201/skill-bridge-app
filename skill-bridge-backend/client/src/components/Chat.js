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
      height: '100vh',         // <--- FULL SCREEN HEIGHT
      width: '100%',           // <--- FULL SCREEN WIDTH
      maxWidth: '100%',        // <--- No width restriction
      margin: '0',             // <--- No margins
      background: '#e5ddd5',   // WhatsApp classic background color
      borderRadius: '0',       // <--- No rounded corners
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      position: 'fixed',       // <--- Forces it to stay on top of everything
      top: 0,
      left: 0,
      zIndex: 9999
    }}>
      
      {/* --- HEADER --- */}
      <div style={{ 
        padding: '15px 20px', 
        background: '#075e54', // WhatsApp Green Header
        color: 'white', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        zIndex: 10,
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* Back Button */}
            <button 
                onClick={() => navigate('/dashboard')}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer', padding: '0 5px' }}
            >
                ←
            </button>
            
            {/* Avatar Circle */}
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                👤
            </div>
            <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '500' }}>{partnerName || "Chat"}</h3>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Online</span>
            </div>
        </div>

        <button 
          onClick={startVideoCall}
          style={{ 
            background: 'none', 
            color: 'white', 
            border: 'none', 
            padding: '8px', 
            cursor: 'pointer', 
            fontSize: '1.2rem',
          }}
          title="Start Video Call"
        >
          🎥
        </button>
      </div>

      {/* --- BODY --- */}
      <div style={{ 
        flex: 1, 
        padding: '20px', 
        overflowY: 'auto', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px',
        // Optional: Add a subtle background pattern like WhatsApp
        backgroundImage: 'linear-gradient(#e5ddd5 2px, transparent 2px), linear-gradient(90deg, #e5ddd5 2px, transparent 2px)',
        backgroundSize: '20px 20px',
        backgroundBlendMode: 'soft-light'
      }}>
        {messageList.map((msg, index) => {
           const isMe = msg.author === user.username;
           return (
             <div key={index} style={{ 
               display: 'flex', 
               justifyContent: isMe ? 'flex-end' : 'flex-start' 
             }}>
               <div style={{ 
                 maxWidth: '75%', 
                 padding: '8px 12px', 
                 borderRadius: '8px', 
                 // WhatsApp Colors: Green for me, White for them
                 background: isMe ? '#dcf8c6' : 'white', 
                 color: 'black',
                 boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
                 display: 'flex',
                 flexDirection: 'column',
                 minWidth: '80px',
                 position: 'relative'
               }}>
                 {/* Message Content */}
                 {msg.type === 'call_invite' ? (
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>📞 Incoming Video Call</p>
                        <button 
                            onClick={() => navigate(msg.callLink)}
                            style={{ 
                                background: '#075e54', 
                                color: 'white', 
                                border: 'none', 
                                padding: '8px 16px', 
                                borderRadius: '20px', 
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '0.9rem'
                            }}
                        >
                            Join Call
                        </button>
                    </div>
                 ) : (
                    <p style={{ margin: '0 0 4px 0', fontSize: '0.95rem', lineHeight: '1.4' }}>{msg.message}</p>
                 )}

                 {/* Timestamp */}
                 <span style={{ 
                     fontSize: '0.65rem', 
                     color: '#999',
                     alignSelf: 'flex-end', 
                     marginTop: '2px' 
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
        padding: '10px 15px', 
        background: '#f0f0f0', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px',
        flexShrink: 0
      }}>
        <input
          type="text"
          value={currentMessage}
          placeholder="Type a message"
          onChange={(event) => setCurrentMessage(event.target.value)}
          onKeyPress={handleKeyPress}
          style={{ 
            flex: 1, 
            padding: '12px 20px', 
            borderRadius: '25px', 
            border: 'none', 
            outline: 'none',
            fontSize: '1rem',
            background: 'white',
            boxShadow: '0 1px 1px rgba(0,0,0,0.05)'
          }}
        />
        <button 
            onClick={sendMessage} 
            style={{ 
                background: '#075e54', 
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
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}

export default Chat;