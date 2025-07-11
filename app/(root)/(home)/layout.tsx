import { Metadata } from 'next';
import { ReactNode } from 'react';

import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Dashboard - Nexus Meet',
  description:
    'Professional video conferencing dashboard powered by Stream Video and Clerk.',
};

const RootLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      <div className="absolute inset-0 bg-[url('/images/hero-background.png')] bg-cover bg-center opacity-10"></div>
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />

        <div className="flex flex-1">
          <Sidebar />

          <section className="flex min-h-screen flex-1 flex-col px-6 pb-6 pt-28 max-md:pb-14 sm:px-14">
            <div className="flex-1 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
              {children}
            </div>
          </section>
        </div>

        <Footer />
      </div>
    </main>
  );
};

export default RootLayout;
