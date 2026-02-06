import React, { useEffect, useState, useRef } from 'react'; // Added useRef for auto-scroll
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../api';

// socket is passed as a prop from App.js to keep connection alive
function Chat({ socket, user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { partnerName, connectionId } = location.state || {};
  
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  
  // Ref for auto-scrolling to bottom
  const scrollRef = useRef(null);

  const room = connectionId;

  useEffect(() => {
    if (room) {
      socket.emit("join_room", room);
    }
  }, [room, socket]);

  useEffect(() => {
    // Listen for incoming messages
    const handleMessageReceive = (data) => {
      setMessageList((list) => [...list, data]);
    };

    socket.on("receive_message", handleMessageReceive);

    // Cleanup listener to prevent double messages
    return () => {
      socket.off("receive_message", handleMessageReceive);
    };
  }, [socket]);

  // Auto-scroll to bottom whenever messageList changes
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList]);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: user.username,
        message: currentMessage,
        time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      
      // --- FIX 2: CLEAR INPUT AFTER SENDING ---
      setCurrentMessage(""); 
    }
  };

  // Allow sending with "Enter" key
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  const startVideoCall = () => {
    // Generate a random room ID for the video call
    const videoRoomId = `video-${room}-${Date.now()}`;
    // Send a special message with the link
    const linkMsg = {
        room: room,
        author: user.username,
        message: "📞 Started a Video Call",
        type: "call_invite", // Custom type to style it differently
        callLink: `/video/${videoRoomId}` 
    };
    
    socket.emit("send_message", linkMsg);
    setMessageList((list) => [...list, linkMsg]);
    
    // Redirect myself to the video room
    navigate(`/video/${videoRoomId}`);
  };

  return (
    <div className="chat-window" style={{ display: 'flex', flexDirection: 'column', height: '90vh', maxWidth: '800px', margin: '20px auto', background: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
      
      {/* --- HEADER (Fixed at Top) --- */}
      <div className="chat-header" style={{ padding: '15px 20px', background: '#4f46e5', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Chat with {partnerName || "Partner"}</h3>
          <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Online</span>
        </div>
        <button 
          onClick={startVideoCall}
          className="btn"
          style={{ background: 'white', color: '#4f46e5', border: 'none', padding: '8px 15px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          📹 Video Call
        </button>
      </div>

      {/* --- BODY (Scrollable Middle) --- */}
      {/* flex: 1 makes this take up all available space, pushing input to bottom */}
      <div className="chat-body" style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#f9fafb', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messageList.map((msg, index) => {
           const isMe = msg.author === user.username;
           return (
             <div key={index} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
               <div style={{ 
                 maxWidth: '70%', 
                 padding: '12px 16px', 
                 borderRadius: '18px', 
                 background: isMe ? '#4f46e5' : '#e5e7eb', 
                 color: isMe ? 'white' : 'black',
                 borderBottomRightRadius: isMe ? '4px' : '18px',
                 borderBottomLeftRadius: isMe ? '18px' : '4px',
                 position: 'relative'
               }}>
                 {/* Special Styling for Call Links */}
                 {msg.type === 'call_invite' ? (
                    <div>
                        <p style={{margin: '0 0 5px 0', fontWeight: 'bold'}}>📞 Incoming Call</p>
                        <button 
                            onClick={() => navigate(msg.callLink)}
                            style={{background: isMe ? 'white' : '#4f46e5', color: isMe ? '#4f46e5' : 'white', border:'none', padding:'5px 10px', borderRadius:'5px', cursor:'pointer'}}
                        >
                            Join Call
                        </button>
                    </div>
                 ) : (
                    <p style={{ margin: 0 }}>{msg.message}</p>
                 )}
                 <span style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: '4px', display: 'block', textAlign: 'right' }}>{msg.time}</span>
               </div>
             </div>
           );
        })}
        {/* Invisible div to scroll to */}
        <div ref={scrollRef} />
      </div>

      {/* --- FOOTER (Fixed at Bottom) --- */}
      <div className="chat-footer" style={{ padding: '15px', borderTop: '1px solid #e5e7eb', background: 'white', display: 'flex', gap: '10px', flexShrink: 0 }}>
        <input
          type="text"
          value={currentMessage}
          placeholder="Type a message..."
          onChange={(event) => setCurrentMessage(event.target.value)}
          onKeyPress={handleKeyPress}
          style={{ flex: 1, padding: '12px', borderRadius: '25px', border: '1px solid #d1d5db', outline: 'none' }}
        />
        <button onClick={sendMessage} style={{ background: '#4f46e5', color: 'white', border: 'none', width: '45px', height: '45px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          ➤
        </button>
      </div>
    </div>
  );
}

export default Chat;