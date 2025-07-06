'use client';

import { ReactNode, useEffect, useState } from 'react';
import { SocketProvider } from './SocketProvider';

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Render without provider during SSR
  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <SocketProvider>
      {children}
    </SocketProvider>
  );
}
