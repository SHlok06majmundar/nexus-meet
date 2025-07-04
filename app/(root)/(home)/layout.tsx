import { Metadata } from 'next';
import { ReactNode } from 'react';

import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'Nexus Meet - Modern Video Conferencing',
  description: 'A modern, colorful video conferencing platform powered by Stream Video and Clerk.',
};

const RootLayout = ({ children }: Readonly<{children: ReactNode}>) => {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      <div className="absolute inset-0 bg-[url('/images/hero-background.png')] bg-cover bg-center opacity-10"></div>
      <div className="relative z-10">
        <Navbar />

        <div className="flex">
          <Sidebar />
          
          <section className="flex min-h-screen flex-1 flex-col px-6 pb-6 pt-28 max-md:pb-14 sm:px-14">
            <div className="w-full backdrop-blur-sm bg-white/5 rounded-3xl p-8 border border-white/10">
              {children}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default RootLayout;
