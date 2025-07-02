
import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="w-full flex flex-col min-h-screen justify-center bg-gradient-to-br from-blue-900 to-black overflow-hidden">
      <Header />
      <main className="container flex-grow mx-auto">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
