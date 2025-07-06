'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const initializeSocket = async () => {
      try {
        // Initialize the Socket.IO server first
        await fetch('/api/socket');
        
        // Initialize Socket.IO connection
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const isProduction = process.env.NODE_ENV === 'production';
        
        const socketInstance = io(socketUrl, {
          path: '/api/socket',
          addTrailingSlash: false,
          // Force polling for Vercel compatibility
          transports: isProduction ? ['polling'] : ['websocket', 'polling'],
          upgrade: !isProduction,
          timeout: 20000,
          forceNew: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        socketInstance.on('connect', () => {
          console.log('Connected to Socket.IO server');
          setIsConnected(true);
        });

        socketInstance.on('disconnect', (reason) => {
          console.log('Disconnected from Socket.IO server:', reason);
          setIsConnected(false);
          
          // Attempt to reconnect after 2 seconds for production
          if (isProduction) {
            setTimeout(() => {
              if (!socketInstance.connected) {
                socketInstance.connect();
              }
            }, 2000);
          }
        });

        socketInstance.on('connect_error', (error) => {
          console.error('Socket.IO connection error:', error);
          setIsConnected(false);
        });

        setSocket(socketInstance);

        return () => {
          socketInstance.disconnect();
        };
      } catch (error) {
        console.error('Failed to initialize socket:', error);
      }
    };

    initializeSocket();
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
