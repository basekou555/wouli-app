
import React from 'react';
import AppNavbar from './AppNavbar';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50 flex-col">
      <AppNavbar />
      
      {/* Content area with improved responsive spacing */}
      <main className="flex-1 md:ml-0 pt-14 pb-20 md:pt-16 md:pb-6 px-3 md:px-8">
        <div className="max-w-3xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
