import React from 'react';
import { Heart, Search, User, Clock } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Users } from 'lucide-react';

const BottomNavigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/app', icon: Heart, label: 'Découvrir' },
    { path: '/explore', icon: Search, label: 'Explorer' },
    { path: '/friends', icon: Users, label: 'Amis' },
    { path: '/profile', icon: User, label: 'Profil' }
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t z-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "p-4 flex flex-col items-center justify-center text-sm",
                location.pathname === item.path
                  ? "text-primary"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <item.icon className="h-5 w-5 mb-1" />
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;
