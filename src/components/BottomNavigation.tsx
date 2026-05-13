import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Compass, Search, User } from 'lucide-react';

interface BottomNavigationProps {
  variant?: 'fixed' | 'inline';
}

const navItems = [
  { icon: Compass, label: 'Découvrir', path: '/app' },
  { icon: Search,  label: 'Explorer',  path: '/explore' },
  { icon: User,    label: 'Profil',     path: '/profile' },
];

const BottomNavigation: React.FC<BottomNavigationProps> = ({ variant = 'fixed' }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      className={`
        bg-card border-t border-border flex-shrink-0
        ${variant === 'fixed' ? 'fixed bottom-0 left-0 right-0 z-50' : ''}
      `}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex justify-around items-center h-14 max-w-lg mx-auto px-2">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`
                flex flex-col items-center justify-center gap-0.5 flex-1 h-full
                rounded-lg transition-colors
                ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}
              `}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.75} />
              <span className={`text-[10px] font-medium ${isActive ? '' : 'opacity-60'}`}>
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
