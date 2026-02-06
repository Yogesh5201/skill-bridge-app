import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

function VideoRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const myMeeting = async (element) => {
    // 1. GENERATE TOKEN (Using Test Credentials)
    const appID = 1484647939; 
    const serverSecret = "4988709503460875704771234567890"; 
    
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID, 
      serverSecret, 
      roomId, 
      Date.now().toString(), 
      "User-" + Math.floor(Math.random() * 1000)
    );

    // 2. CREATE INSTANCE
    const zp = ZegoUIKitPrebuilt.create(kitToken);

    // 3. START CALL
    zp.joinRoom({
      container: element,
      scenario: {
        mode: ZegoUIKitPrebuilt.OneONoneCall,
      },
      showScreenSharingButton: false,
      onLeaveRoom: () => navigate('/chat'),
    });
  };

  return (
    <div 
      ref={myMeeting} 
      style={{ width: '100vw', height: '100vh' }}
    ></div>
  );
}

export default VideoRoom;