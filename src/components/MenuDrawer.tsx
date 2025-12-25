import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Calendar, Settings, Search, LogOut, X, Users, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleNavigation = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
    navigate('/auth');
  };

  const isActive = (path: string) => location.pathname === path;

  const menuItemClass = (path: string) => 
    `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
      isActive(path) 
        ? 'bg-primary/10 text-primary font-medium' 
        : 'hover:bg-accent'
    }`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-background z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {user ? (
                <div className="flex items-center gap-3 pt-2">
                  <Avatar className="w-16 h-16 border-2 border-white/30">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-white text-primary text-xl font-bold">
                      {user.user_metadata?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-lg">
                      {user.user_metadata?.username || 'Utilisateur'}
                    </p>
                    <p className="text-sm text-primary-foreground/80">
                      {user.email}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="pt-2">
                  <p className="font-bold text-lg">Menu</p>
                  <p className="text-sm text-primary-foreground/80">Wouli</p>
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {/* Section Découvrir */}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2">
                Découvrir
              </p>
              
              <button
                onClick={() => handleNavigation('/app')}
                className={menuItemClass('/app')}
              >
                <Sparkles className="w-5 h-5 text-primary" />
                <span>Découvrir</span>
              </button>

              <button
                onClick={() => handleNavigation('/explore')}
                className={menuItemClass('/explore')}
              >
                <Search className="w-5 h-5 text-muted-foreground" />
                <span>Explorer</span>
              </button>

              {user && (
                <>
                  <Separator className="my-3" />
                  
                  {/* Section Mon espace */}
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2">
                    Mon espace
                  </p>

                  <button
                    onClick={() => handleNavigation('/profile')}
                    className={menuItemClass('/profile')}
                  >
                    <User className="w-5 h-5 text-muted-foreground" />
                    <span>Mon profil</span>
                  </button>

                  <button
                    onClick={() => handleNavigation('/history')}
                    className={menuItemClass('/history')}
                  >
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <span>Mes événements</span>
                  </button>

                  <button
                    onClick={() => handleNavigation('/friends')}
                    className={menuItemClass('/friends')}
                  >
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <span>Mes amis</span>
                  </button>

                  <Separator className="my-3" />

                  <button
                    onClick={() => handleNavigation('/user-settings')}
                    className={menuItemClass('/user-settings')}
                  >
                    <Settings className="w-5 h-5 text-muted-foreground" />
                    <span>Paramètres</span>
                  </button>
                </>
              )}
            </nav>

            {/* Footer */}
            {user ? (
              <div className="p-4 border-t bg-background">
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Déconnexion</span>
                </Button>
              </div>
            ) : (
              <div className="p-4 border-t bg-background space-y-2">
                <Button
                  onClick={() => handleNavigation('/auth')}
                  className="w-full"
                >
                  Se connecter
                </Button>
                <Button
                  onClick={() => handleNavigation('/auth?signup=true')}
                  variant="outline"
                  className="w-full"
                >
                  Créer un compte
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MenuDrawer;
