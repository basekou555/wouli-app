import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'wouli_install_dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 jours

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Vérifier si l'app est déjà installée (mode standalone)
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone);
      return isStandalone;
    };

    // Vérifier si l'utilisateur a récemment refusé
    const checkDismissed = () => {
      const dismissed = localStorage.getItem(DISMISSED_KEY);
      if (dismissed) {
        const dismissedTime = parseInt(dismissed, 10);
        const now = Date.now();
        if (now - dismissedTime < DISMISS_DURATION) {
          return true;
        } else {
          // Expiration du délai, nettoyer le localStorage
          localStorage.removeItem(DISMISSED_KEY);
        }
      }
      return false;
    };

    const installed = checkIfInstalled();
    const dismissed = checkDismissed();

    if (installed || dismissed) {
      return;
    }

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Écouter l'événement appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setIsInstallable(false);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        setShowPrompt(false);
        setIsInstallable(false);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error during installation:', error);
    }
  };

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    setShowPrompt(false);
  };

  return {
    isInstallable,
    isInstalled,
    showPrompt,
    install,
    dismiss,
  };
}
