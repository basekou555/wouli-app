
import React from 'react';
import AppNavbar from './AppNavbar';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 flex-col">
      <AppNavbar />
      
      {/* Content area with improved responsive spacing */}
      <main className="flex-1 pt-16 pb-20 md:pt-20 md:pb-6 px-4 md:px-8">
        <div className="max-w-4xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
