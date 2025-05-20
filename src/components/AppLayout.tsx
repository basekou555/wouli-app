
import React from 'react';
import AppNavbar from './AppNavbar';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AppNavbar />
      
      {/* Content area with improved spacing for profile and social content */}
      <main className="flex-1 md:ml-64 pt-16 pb-20 md:py-6 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
