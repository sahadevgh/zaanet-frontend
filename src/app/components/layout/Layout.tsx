
import React from 'react';
import Header from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen justify-center bg-gradient-to-br from-blue-900 to-black overflow-hidden">
      <Header />
      <main className="w-[95vw] mx-auto flex-grow bg-transparent">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
