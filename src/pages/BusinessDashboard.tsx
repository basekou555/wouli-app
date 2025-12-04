import React, { useState, useEffect } from 'react';
import { BusinessLayout } from '@/components/business/BusinessLayout';
import { BusinessDashboardHome } from '@/components/business/BusinessDashboardHome';
import { OnboardingTransfer } from '@/components/business/OnboardingTransfer';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/LoadingSpinner';

const BusinessDashboard = () => {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [instagramHandle, setInstagramHandle] = useState<string | null>(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) {
        setCheckingOnboarding(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('business_details')
          .select('onboarding_completed, instagram_handle')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking onboarding:', error);
          setCheckingOnboarding(false);
          return;
        }

        // Afficher animation seulement si:
        // 1. onboarding_completed est false ou null
        // 2. ET instagram_handle existe
        if (data && !data.onboarding_completed && data.instagram_handle) {
          setInstagramHandle(data.instagram_handle);
          setShowOnboarding(true);
        }
      } catch (err) {
        console.error('Onboarding check failed:', err);
      } finally {
        setCheckingOnboarding(false);
      }
    };

    checkOnboarding();
  }, [user]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  // Pendant la vérification
  if (checkingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" text="Chargement..." />
      </div>
    );
  }

  // Animation d'onboarding fullscreen
  if (showOnboarding && user && instagramHandle) {
    return (
      <OnboardingTransfer
        userId={user.id}
        instagramHandle={instagramHandle}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  // Dashboard normal
  return (
    <ErrorBoundary>
      <BusinessLayout>
        <BusinessDashboardHome />
      </BusinessLayout>
    </ErrorBoundary>
  );
};

export default BusinessDashboard;
