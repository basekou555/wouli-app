import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/hooks/useOnboarding';
import LoadingSpinner from '@/components/LoadingSpinner';
import WelcomeStep from '@/components/onboarding/WelcomeStep';
import NameStep from '@/components/onboarding/NameStep';
import KeywordSelector from '@/components/onboarding/KeywordSelector';
import ConfirmationStep from '@/components/onboarding/ConfirmationStep';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, profile } = useAuth();
  const {
    currentStep,
    userName,
    setUserName,
    selectedKeywords,
    toggleKeyword,
    isCompleted,
    isLoading,
    canProceedToKeywords,
    canComplete,
    nextStep,
    prevStep,
    completeOnboarding,
    getProgress
  } = useOnboarding();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Redirect if already completed
  useEffect(() => {
    if (isCompleted && !isLoading) {
      navigate('/app', { replace: true });
    }
  }, [isCompleted, isLoading, navigate]);

  // Skip onboarding for business users
  useEffect(() => {
    if (profile?.type === 'business' || profile?.type === 'admin') {
      navigate(profile.type === 'business' ? '/business' : '/admin', { replace: true });
    }
  }, [profile, navigate]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent/10 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      {/* Progress bar */}
      {currentStep !== 'welcome' && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="h-1 bg-secondary">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${getProgress()}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      )}

      {/* Content */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {currentStep === 'welcome' && (
            <WelcomeStep key="welcome" onNext={nextStep} />
          )}
          
          {currentStep === 'name' && (
            <NameStep
              key="name"
              userName={userName}
              onNameChange={setUserName}
              onNext={nextStep}
              onBack={prevStep}
              canProceed={canProceedToKeywords}
            />
          )}
          
          {currentStep === 'keywords' && (
            <KeywordSelector
              key="keywords"
              selectedKeywords={selectedKeywords}
              onToggleKeyword={toggleKeyword}
              onNext={nextStep}
              onBack={prevStep}
              canProceed={canComplete}
              userName={userName}
            />
          )}
          
          {currentStep === 'confirmation' && (
            <ConfirmationStep
              key="confirmation"
              userName={userName}
              selectedKeywords={selectedKeywords}
              onComplete={completeOnboarding}
              onBack={prevStep}
              isLoading={isLoading}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
