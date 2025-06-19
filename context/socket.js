import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
    const socket = useContext(SocketContext)
    return socket
}

export const SocketProvider = (props) => {
  const { children } = props;
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const initSocket = async () => {
      // Initialize socket API endpoint
      await fetch('/api/socket');
      
      // Create socket connection
      const connection = io();
      console.log("socket connection initialized");
      
      connection.on('connect', () => {
        console.log("Socket connected with ID:", connection.id);
        setSocket(connection);
      });
      
      connection.on('connect_error', async (err) => {
        console.log("Error establishing socket", err);
        await fetch('/api/socket');
      });
    };
    
    initSocket();
    
    return () => {
      if (socket) {
        console.log("Disconnecting socket");
        socket.disconnect();
      }
    };
  }, []);
  
  // Move error handling to be inside useEffect
  useEffect(() => {
    if (socket) {
      socket.on('connect_error', async (err) => {
        console.log("Error establishing socket", err);
        await fetch('/api/socket');
      });
    }
  }, [socket]);
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
