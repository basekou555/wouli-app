import { useState, useEffect } from 'react';

export const useIsPWA = () => {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    const checkPWA = () => {
      // Méthode 1 : display-mode standalone (Standard)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      
      // Méthode 2 : Safari iOS
      const isIOSStandalone = (window.navigator as any).standalone === true;
      
      // Méthode 3 : Android (lancé depuis home screen)
      const isAndroidStandalone = document.referrer.includes('android-app://');
      
      setIsPWA(isStandalone || isIOSStandalone || isAndroidStandalone);
    };

    checkPWA();

    // Re-vérifier si le mode change
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkPWA);

    return () => mediaQuery.removeEventListener('change', checkPWA);
  }, []);

  return isPWA;
};
