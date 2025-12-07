import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallPromptProps {
  /** Identifiant unique pour cette instance (permet plusieurs prompts sur différentes pages) */
  pageId?: string;
  /** Délai avant affichage en ms (défaut: 3000) */
  delay?: number;
}

// Variable globale pour stocker le deferredPrompt (partagé entre instances)
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;

export const InstallPrompt = ({ pageId = 'default', delay = 300 }: InstallPromptProps) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(globalDeferredPrompt);
  const [showPrompt, setShowPrompt] = useState(false);

  const dismissKey = `install-dismissed-${pageId}`;

  useEffect(() => {
    // Vérifier si déjà installé
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    if (isInstalled) return;

    // Vérifier si dismissed récemment sur cette page
    const dismissed = localStorage.getItem(dismissKey);
    if (dismissed) {
      const threeDays = 3 * 24 * 60 * 60 * 1000; // 3 jours par page
      if (Date.now() - parseInt(dismissed) < threeDays) {
        return;
      }
    }

    // Si on a déjà le prompt global, l'utiliser
    if (globalDeferredPrompt) {
      setDeferredPrompt(globalDeferredPrompt);
      setTimeout(() => setShowPrompt(true), delay);
      return;
    }

    // Capturer l'événement d'installation
    const handler = (e: Event) => {
      e.preventDefault();
      globalDeferredPrompt = e as BeforeInstallPromptEvent;
      setDeferredPrompt(globalDeferredPrompt);
      
      setTimeout(() => setShowPrompt(true), delay);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [dismissKey, delay]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('✅ PWA installée');
      globalDeferredPrompt = null;
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem(dismissKey, Date.now().toString());
  };

  return (
    <AnimatePresence>
      {showPrompt && deferredPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 z-[60] max-w-md mx-auto"
        >
          <div className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl p-4 shadow-2xl">
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
                <h3 className="font-bold mb-1">Installe Wouli !</h3>
                <p className="text-sm opacity-90">
                  Profite d'une expérience sans les barres du navigateur
                </p>
              </div>
            </div>

            <Button
              onClick={handleInstall}
              className="w-full bg-white text-orange-600 hover:bg-white/90 font-semibold"
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
