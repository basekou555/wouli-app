import React, { createContext, useContext, ReactNode } from 'react';
import { useSmartTracking } from '@/hooks/useSmartTracking';

type SmartTrackingContextType = ReturnType<typeof useSmartTracking>;

const SmartTrackingContext = createContext<SmartTrackingContextType | null>(null);

export const SmartTrackingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const tracking = useSmartTracking();
  
  return (
    <SmartTrackingContext.Provider value={tracking}>
      {children}
    </SmartTrackingContext.Provider>
  );
};

export const useSmartTrackingContext = () => {
  const context = useContext(SmartTrackingContext);
  if (!context) {
    throw new Error('useSmartTrackingContext must be used within SmartTrackingProvider');
  }
  return context;
};
