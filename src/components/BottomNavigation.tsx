import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Compass, Search, Users, Bell, User } from 'lucide-react';

interface BottomNavigationProps {
  variant?: 'fixed' | 'inline';
}

const navItems = [
  { icon: Compass, label: 'Découvrir', path: '/app' },
  { icon: Search,  label: 'Explorer',  path: '/explore' },
  { icon: Users,   label: 'Amis',      path: '/friends' },
  { icon: Bell,    label: 'Notifs',    path: '/notifications' },
  { icon: User,    label: 'Profil',    path: '/profile' },
];

const BottomNavigation: React.FC<BottomNavigationProps> = ({ variant = 'fixed' }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      className={`
        bg-card/95 backdrop-blur border-t border-border/60 flex-shrink-0
        ${variant === 'fixed' ? 'fixed bottom-0 left-0 right-0 z-50' : ''}
      `}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex justify-around items-center h-14 max-w-lg mx-auto px-1">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`
                flex flex-col items-center justify-center gap-0.5 flex-1 h-full
                rounded-xl transition-all duration-200
                ${isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <div className={`
                relative flex items-center justify-center w-8 h-6 rounded-xl transition-all duration-200
                ${isActive ? 'bg-primary/10' : ''}
              `}>
                <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.5 : 1.75} />
              </div>
              <span className={`text-[9px] font-medium tracking-wide ${isActive ? '' : 'opacity-50'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
