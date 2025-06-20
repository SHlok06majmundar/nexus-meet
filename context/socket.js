import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
    const socket = useContext(SocketContext);
    return socket;
}

export const SocketProvider = (props) => {
  const { children } = props;
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const connection = io();
    console.log("socket connection", connection);
    setSocket(connection);
    
    // Event listeners for screen sharing
    const handleScreenShare = (event) => {
      const { stream, videoTrack } = event.detail;
      if (connection && videoTrack) {
        // Inform other participants about screen sharing
        connection.emit('screen-share', { 
          sharing: true, 
          userId: connection.id 
        });
        
        // You would need to replace the video track in your peer connections here
        // This is a placeholder for actual WebRTC implementation
        console.log("Screen share started", stream, videoTrack);
      }
    };
    
    // Event listener for reactions
    const handleReaction = (event) => {
      const { emoji } = event.detail;
      if (connection && emoji) {
        connection.emit('reaction', {
          emoji,
          userId: connection.id
        });
      }
    };
    
    // Add event listeners
    window.addEventListener('screen-share-started', handleScreenShare);
    window.addEventListener('send-reaction', handleReaction);
    
    // Cleanup
    return () => {
      window.removeEventListener('screen-share-started', handleScreenShare);
      window.removeEventListener('send-reaction', handleReaction);
    };
  }, []);

  socket?.on('connect_error', async (err) => {
    console.log("Error establishing socket", err);
    await fetch('/api/socket');
  });

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
