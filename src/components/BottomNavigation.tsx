import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Compass, Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavigationProps {
  variant?: 'fixed' | 'inline' | 'floating';
}

const navItems = [
  { icon: Compass, label: 'Découvrir', path: '/app' },
  { icon: Search,  label: 'Explorer',  path: '/explore' },
  { icon: User,    label: 'Profil',     path: '/profile' },
];

const BottomNavigation: React.FC<BottomNavigationProps> = ({ variant = 'fixed' }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // 'floating' : transparent, par-dessus un feed plein écran (immersif TikTok).
  const floating = variant === 'floating';

  return (
    <nav
      className={cn(
        'flex-shrink-0',
        variant === 'fixed' && 'fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border',
        variant === 'inline' && 'bg-card border-t border-border',
        floating && 'relative',
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Dégradé pour la lisibilité (variante flottante uniquement) */}
      {floating && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      )}

      <div className="relative flex justify-around items-center h-14 max-w-lg mx-auto px-2">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          const activeColor = floating ? 'text-white' : 'text-primary';
          const inactiveColor = floating
            ? 'text-white/60'
            : 'text-muted-foreground hover:text-foreground';
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full rounded-lg transition-colors',
                isActive ? activeColor : inactiveColor,
              )}
              style={floating ? { textShadow: '0 1px 6px rgba(0,0,0,0.6)' } : undefined}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.75} />
              <span className={cn('text-[10px] font-medium', !isActive && !floating && 'opacity-60')}>
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
