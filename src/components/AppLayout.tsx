
import React from 'react';
import AppNavbar from './AppNavbar';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-white">
      <AppNavbar />
      
      {/* Content area - adjusted for desktop sidebar and mobile top/bottom nav */}
      <main className="flex-1 md:ml-64 pt-14 pb-20 md:py-5 px-3 md:px-6">
        <div className="max-w-2xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
