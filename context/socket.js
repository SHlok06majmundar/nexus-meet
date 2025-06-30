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
    const initializeSocket = async () => {
      try {
        // Initialize the socket API on the server
        try {
          await fetch('/api/socket');
          console.log("Socket API initialized");
        } catch (error) {
          console.warn("Socket API fetch failed, will try direct connection");
        }
        
        // Create a simple socket.io connection with minimal options
        // Let Socket.io handle the default path (/socket.io)
        const connection = io({
          transports: ['polling', 'websocket'],
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 20000
        });
        
        // Set up basic event handlers
        connection.on('connect', () => {
          console.log('Socket connected successfully!', connection.id);
        });
        
        connection.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
        });
        
        console.log("Socket connection attempt initialized");
        setSocket(connection);
      } catch (e) {
        console.error("Failed to initialize socket:", e);
      }
    };
    
    initializeSocket();
    
    // Cleanup function to disconnect socket when component unmounts
    return () => {
      if (socket) {
        console.log("Disconnecting socket");
        socket.disconnect();
      }
    };
  }, []);
  
  useEffect(() => {
    if (!socket) return;
    
    // Setup socket event handlers for connection issues
    socket.on('connect', () => {
      console.log('Socket connected successfully');
    });
    
    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      // Try to reconnect if needed
      if (reason === 'io server disconnect') {
        // The server disconnected the client, try to reconnect
        socket.connect();
      }
    });
    
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
    
    // Event listener for reactions
    const handleReaction = (event) => {
      const { emoji } = event.detail;
      if (socket && emoji && socket.connected) {
        // Get the room ID from the URL
        const roomId = window.location.pathname.substring(1);
        
        socket.emit('reaction', {
          emoji,
          userId: socket.id
        }, roomId);
      }
    };
    
    // Event listener for raise hand
    const handleRaiseHand = (event) => {
      if (socket) {
        // Get the room ID from the URL
        const roomId = window.location.pathname.substring(1);
        const { userName } = event.detail || {};
        
        socket.emit('raise-hand', {
          userId: socket.id,
          userName: userName || 'User'
        }, roomId);
      }
    };
    
    // Event listener for lower hand
    const handleLowerHand = (event) => {
      if (socket) {
        // Get the room ID from the URL
        const roomId = window.location.pathname.substring(1);
        
        socket.emit('lower-hand', {
          userId: socket.id
        }, roomId);
      }
    };
    
    // Event listener for AI recording started
    const handleAIRecordingStart = (event) => {
      if (socket) {
        // Get the room ID from the URL
        const roomId = window.location.pathname.substring(1);
        
        socket.emit('ai-recording-started', roomId);
      }
    };
    
    // Event listener for AI recording stopped
    const handleAIRecordingStop = (event) => {
      if (socket) {
        // Get the room ID from the URL
        const roomId = window.location.pathname.substring(1);
        
        socket.emit('ai-recording-stopped', roomId);
      }
    };

    // Add event listeners
    window.addEventListener('send-reaction', handleReaction);
    window.addEventListener('raise-hand', handleRaiseHand);
    window.addEventListener('lower-hand', handleLowerHand);
    window.addEventListener('ai-recording-start', handleAIRecordingStart);
    window.addEventListener('ai-recording-stop', handleAIRecordingStop);
    
    // Set up socket event listeners for debugging
    socket.on('connect', () => {
      console.log('Socket connected with ID:', socket.id);
    });
    
    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });
    
    socket.on('user-connected', (userId, userName) => {
      console.log(`Socket event: user-connected - ${userName || userId}`);
    });
    
    socket.on('user-leave', (userId) => {
      console.log(`Socket event: user-leave - ${userId}`);
    });
    
    // Cleanup
    return () => {
      window.removeEventListener('send-reaction', handleReaction);
      window.removeEventListener('raise-hand', handleRaiseHand);
      window.removeEventListener('lower-hand', handleLowerHand);
      window.removeEventListener('ai-recording-start', handleAIRecordingStart);
      window.removeEventListener('ai-recording-stop', handleAIRecordingStop);
      
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('user-connected');
        socket.off('user-leave');
      }
    };
  }, [socket]);

  socket?.on('connect_error', async (err) => {
    console.log("Error establishing socket", err);
    await fetch('/api/socket');
  });

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
