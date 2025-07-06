import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';

import '@stream-io/video-react-sdk/dist/css/styles.css';
import 'react-datepicker/dist/react-datepicker.css';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { SocketProvider } from '@/providers/SocketProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nexus Meet - Professional Video Conferencing',
  description:
    'Professional video conferencing platform with AI-powered transcription, real-time chat, and seamless collaboration tools.',
  icons: {
    icon: '/icons/logo.jpeg',
    shortcut: '/icons/logo.jpeg',
    apple: '/icons/logo.jpeg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <ClerkProvider
        appearance={{
          layout: {
            socialButtonsVariant: 'iconButton',
            logoImageUrl: '/icons/logo.jpeg',
          },
          variables: {
            colorText: '#fff',
            colorPrimary: '#0E78F9',
            colorBackground: '#1C1F2E',
            colorInputBackground: '#252A41',
            colorInputText: '#fff',
          },
        }}
      >
        <body className={`${inter.className} bg-dark-2`}>
          <SocketProvider>
            <Toaster />
            {children}
          </SocketProvider>
        </body>
      </ClerkProvider>
    </html>
  );
}
