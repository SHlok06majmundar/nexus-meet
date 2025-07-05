import { ReactNode } from 'react';
import Footer from '@/components/Footer';

const AuthLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      <div className="absolute inset-0 bg-[url('/images/hero-background.png')] bg-cover bg-center opacity-10"></div>
      <div className="relative z-10 flex-1">
        {children}
      </div>
      <Footer />
    </div>
  );
};

export default AuthLayout;
