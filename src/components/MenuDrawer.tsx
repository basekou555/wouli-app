import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Heart, Calendar, Settings, Search, LogOut, X, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
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
            className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-background z-50 shadow-2xl overflow-y-auto"
          >
            {/* Header */}
            <div className="p-6 border-b bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {user ? (
                <div className="flex items-center gap-3 pt-2">
                  <Avatar className="w-16 h-16 border-2 border-white">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-white text-purple-600 text-xl font-bold">
                      {user.user_metadata?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-lg">
                      {user.user_metadata?.username || 'Utilisateur'}
                    </p>
                    <p className="text-sm text-white/80">
                      {user.email}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="pt-2">
                  <p className="font-bold text-lg">Menu</p>
                  <p className="text-sm text-white/80">Wouli</p>
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-2">
              {user && (
                <>
                  <button
                    onClick={() => handleNavigation('/profile')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors text-left"
                  >
                    <User className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">Mon profil</span>
                  </button>

                  <button
                    onClick={() => handleNavigation('/history')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors text-left"
                  >
                    <Heart className="w-5 h-5 text-red-500" />
                    <span className="font-medium">Mes favoris & participations</span>
                  </button>

                  <button
                    onClick={() => handleNavigation('/friends')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors text-left"
                  >
                    <Users className="w-5 h-5 text-purple-500" />
                    <span className="font-medium">Mes amis</span>
                  </button>
                </>
              )}

              <button
                onClick={() => handleNavigation('/explore')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors text-left"
              >
                <Search className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Explorer</span>
              </button>

              {user && (
                <button
                  onClick={() => handleNavigation('/user-settings')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors text-left"
                >
                  <Settings className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">Paramètres</span>
                </button>
              )}
            </nav>

            {/* Footer */}
            {user ? (
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Déconnexion</span>
                </Button>
              </div>
            ) : (
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background space-y-2">
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
