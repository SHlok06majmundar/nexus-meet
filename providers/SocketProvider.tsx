'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface SocketContextType {
  socket: any | null;
  isConnected: boolean;
}

// Create context with default values
const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false
});

export const useSocket = () => {
  // SSR safety check - return default values if no context or during SSR
  if (typeof window === 'undefined') {
    return {
      socket: null,
      isConnected: false
    };
  }
  
  const context = useContext(SocketContext);
  if (!context) {
    return {
      socket: null,
      isConnected: false
    };
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    console.log('Initializing real-time features...');
    
    // Create a simple event system using localStorage and custom events
    const mockSocket = {
      emit: (event: string, data: any) => {
        console.log('Broadcast:', event, data);
        // Store in localStorage for cross-tab communication
        const key = `nexus-${event}-${Date.now()}`;
        localStorage.setItem(key, JSON.stringify(data));
        
        // Dispatch custom event for same-tab communication
        window.dispatchEvent(new CustomEvent('nexus-message', { 
          detail: { event, data } 
        }));
      },
      
      on: (event: string, callback: Function) => {
        const handler = (e: any) => {
          if (e.detail?.event === event) {
            callback(e.detail.data);
          }
        };
        window.addEventListener('nexus-message', handler);
        
        // Also listen for localStorage changes (cross-tab)
        const storageHandler = (e: StorageEvent) => {
          if (e.key?.startsWith(`nexus-${event}-`) && e.newValue) {
            try {
              const data = JSON.parse(e.newValue);
              callback(data);
            } catch (error) {
              console.error('Error parsing stored data:', error);
            }
          }
        };
        window.addEventListener('storage', storageHandler);
        
        return () => {
          window.removeEventListener('nexus-message', handler);
          window.removeEventListener('storage', storageHandler);
        };
      },
      
      disconnect: () => {
        console.log('Mock socket disconnected');
      },
      
      connected: true
    };

    setSocket(mockSocket);
    setIsConnected(true);

    return () => {
      if (mockSocket && mockSocket.disconnect) {
        mockSocket.disconnect();
      }
    };
  }, []);

  const contextValue = {
    socket,
    isConnected
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};
