'use client';

import { ReactNode } from 'react';
import { SocketProvider } from './SocketProvider';

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <SocketProvider>
      {children}
    </SocketProvider>
  );
}
