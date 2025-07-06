'use client';

import React, { useEffect, useState } from 'react';

interface SocketContextType {
  socket: any | null;
  isConnected: boolean;
}

// Completely avoid context during SSR by using a simple hook
export const useSocket = (): SocketContextType => {
  // Always return safe defaults during SSR
  if (typeof window === 'undefined') {
    return {
      socket: null,
      isConnected: false
    };
  }

  const [socket, setSocket] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only run after mounting on client side
    if (!isMounted) return;

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
      
      off: (event: string) => {
        // Remove event listeners (simplified)
        console.log('Removing listeners for:', event);
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
  }, [isMounted]);

  return {
    socket: isMounted ? socket : null,
    isConnected: isMounted ? isConnected : false
  };
};

interface SocketProviderProps {
  children: React.ReactNode;
}

// Dummy provider that just renders children - no context needed
export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  return <>{children}</>;
};
