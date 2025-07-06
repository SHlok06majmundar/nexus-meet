'use client';

import { ReactNode } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
}

export default function ClientOnly({ children }: ClientOnlyProps) {
  return <>{children}</>;
}
