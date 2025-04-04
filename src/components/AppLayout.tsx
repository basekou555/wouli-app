
import React from 'react';
import AppNavbar from './AppNavbar';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AppNavbar />
      
      {/* Content area - adjusted for desktop sidebar and mobile top/bottom nav */}
      <main className="flex-1 md:ml-64 pt-16 pb-16 md:py-6 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
