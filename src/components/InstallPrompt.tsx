import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Vérifier si déjà en standalone (PWA installée)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone
      || document.referrer.includes('android-app://');

    if (isStandalone) {
      return; // Ne rien afficher si déjà installé
    }

    // Vérifier si l'user a déjà dismiss
    const dismissed = localStorage.getItem('wouli-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      
      if (Date.now() - dismissedTime < sevenDays) {
        return; // Ne pas afficher pendant 7 jours après dismiss
      }
    }

    // Écouter l'événement beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Attendre 5 secondes avant d'afficher le prompt
      setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Afficher le prompt natif
    deferredPrompt.prompt();

    // Attendre la réponse de l'user
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('✅ PWA installée');
    }

    // Nettoyer
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    
    // Ne plus afficher pendant 7 jours
    localStorage.setItem('wouli-install-dismissed', Date.now().toString());
  };

  return (
    <AnimatePresence>
      {showPrompt && deferredPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          className="fixed bottom-20 left-4 right-4 z-[60] max-w-md mx-auto"
        >
          <div className="bg-gradient-to-br from-primary to-pink-500 rounded-2xl p-4 shadow-2xl">
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🎉</span>
              </div>
              <div className="flex-1 text-white">
                <h3 className="font-bold text-base mb-1">
                  Installe Wouli !
                </h3>
                <p className="text-sm text-white/90">
                  Profite d'une expérience immersive sans les barres du navigateur
                </p>
              </div>
            </div>

            <Button
              onClick={handleInstall}
              className="w-full bg-white text-primary hover:bg-white/90 font-semibold"
            >
              <Download className="w-4 h-4 mr-2" />
              Ajouter à l'écran d'accueil
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPrompt;
