import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { useLocation } from 'react-router-dom';

export function InstallPrompt() {
  const { showPrompt, isInstallable, isInstalled, install, dismiss } = useInstallPrompt();
  const location = useLocation();

  // Ne pas afficher si déjà installé ou pas installable
  if (!showPrompt || !isInstallable || isInstalled) {
    return null;
  }

  // Vérifier si on est sur une page user avec bottom nav
  const hasBottomNav = location.pathname.startsWith('/app') || 
                       location.pathname.startsWith('/search') || 
                       location.pathname.startsWith('/friends') ||
                       location.pathname.startsWith('/profile');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={`fixed left-0 right-0 z-[100] ${hasBottomNav ? 'bottom-20' : 'bottom-4'} mx-4`}
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-primary/20 via-primary/10 to-background/90 backdrop-blur-xl shadow-2xl">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-50" />
          
          <div className="relative p-4 flex items-center gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Download className="w-6 h-6 text-primary" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm mb-0.5">
                Installe Wouli
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                Accès rapide à tes événements Lyon
              </p>
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={dismiss}
                className="h-8 px-3 text-xs"
              >
                Plus tard
              </Button>
              <Button
                onClick={install}
                size="sm"
                className="h-8 px-4 text-xs bg-primary hover:bg-primary/90"
              >
                Installer
              </Button>
            </div>

            {/* Close button mobile */}
            <button
              onClick={dismiss}
              className="flex-shrink-0 md:hidden p-1 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
