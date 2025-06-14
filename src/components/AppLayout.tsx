
import React from 'react';
import BottomNavigation from './BottomNavigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Content area with proper centering */}
      <main className="pb-20 pt-4 px-4">
        <div className="max-w-2xl mx-auto">
          {children}
        </div>
      </main>
      
      {/* Bottom navigation for mobile */}
      <BottomNavigation />
    </div>
  );
};

export default AppLayout;
