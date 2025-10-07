import React from 'react';
import { Button } from "@/components/ui/button";
import { Heart, Search, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface BottomNavigationProps {
  mode?: 'fixed' | 'inline';
}

const BottomNavigation = ({ mode = 'fixed' }: BottomNavigationProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      icon: Heart,
      label: 'Découvrir',
      path: '/app',
      isActive: location.pathname === '/app'
    },
    {
      icon: Search,
      label: 'Rechercher',
      path: '/search',
      isActive: location.pathname === '/search'
    },
    {
      icon: User,
      label: 'Profil',
      path: '/profil',
      isActive: location.pathname === '/profil'
    }
  ];

  const rootClass = mode === 'fixed' 
    ? 'fixed bottom-0 left-0 right-0' 
    : 'relative';

  return (
    <div className={`${rootClass} h-[60px] bg-white border-t px-4 flex items-center`}>
      <div className="flex justify-around items-center max-w-md mx-auto w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center space-y-1 min-w-0 px-3 py-2 border ${
                item.isActive 
                  ? 'text-purple-600 bg-purple-50 border-purple-200' 
                  : 'text-gray-500 hover:text-gray-700 border-gray-200'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
