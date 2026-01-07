import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { MIN_KEYWORDS_REQUIRED } from '@/data/onboardingKeywords';

export type OnboardingStep = 'welcome' | 'name' | 'keywords' | 'confirmation';

interface OnboardingState {
  userName: string;
  selectedKeywords: string[];
  isCompleted: boolean;
  isLoading: boolean;
}

export const useOnboarding = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [state, setState] = useState<OnboardingState>({
    userName: '',
    selectedKeywords: [],
    isCompleted: false,
    isLoading: true
  });

  // Check if user has completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('onboarding_completed, user_name, selected_keywords')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          // PGRST116 = no rows returned, which is expected for new users
          console.error('Error checking onboarding:', error);
        }

        if (data?.onboarding_completed) {
          setState(prev => ({
            ...prev,
            isCompleted: true,
            userName: data.user_name || '',
            selectedKeywords: data.selected_keywords || [],
            isLoading: false
          }));
        } else if (data) {
          // Resume from where they left off
          setState(prev => ({
            ...prev,
            userName: data.user_name || '',
            selectedKeywords: data.selected_keywords || [],
            isLoading: false
          }));
          // Determine which step to resume
          if (data.user_name) {
            setCurrentStep('keywords');
          }
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkOnboardingStatus();
  }, [user]);

  const setUserName = useCallback((name: string) => {
    setState(prev => ({ ...prev, userName: name }));
  }, []);

  const toggleKeyword = useCallback((keywordId: string) => {
    setState(prev => {
      const isSelected = prev.selectedKeywords.includes(keywordId);
      return {
        ...prev,
        selectedKeywords: isSelected
          ? prev.selectedKeywords.filter(k => k !== keywordId)
          : [...prev.selectedKeywords, keywordId]
      };
    });
  }, []);

  const canProceedToKeywords = state.userName.trim().length >= 2;
  const canComplete = state.selectedKeywords.length >= MIN_KEYWORDS_REQUIRED;

  const nextStep = useCallback(() => {
    switch (currentStep) {
      case 'welcome':
        setCurrentStep('name');
        break;
      case 'name':
        if (canProceedToKeywords) {
          setCurrentStep('keywords');
        }
        break;
      case 'keywords':
        if (canComplete) {
          setCurrentStep('confirmation');
        }
        break;
    }
  }, [currentStep, canProceedToKeywords, canComplete]);

  const prevStep = useCallback(() => {
    switch (currentStep) {
      case 'name':
        setCurrentStep('welcome');
        break;
      case 'keywords':
        setCurrentStep('name');
        break;
      case 'confirmation':
        setCurrentStep('keywords');
        break;
    }
  }, [currentStep]);

  const saveProgress = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          user_name: state.userName,
          selected_keywords: state.selectedKeywords,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [user, state.userName, state.selectedKeywords]);

  const completeOnboarding = useCallback(async () => {
    if (!user || !canComplete) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Calculate initial category scores from selected keywords
      const categoryScores: Record<string, number> = {};
      const keywordScores: Record<string, number> = {};
      
      // Import keywords to calculate scores
      const { ONBOARDING_KEYWORDS } = await import('@/data/onboardingKeywords');
      
      state.selectedKeywords.forEach(keywordId => {
        const keyword = ONBOARDING_KEYWORDS.find(k => k.id === keywordId);
        if (keyword) {
          // Boost category score
          categoryScores[keyword.category] = (categoryScores[keyword.category] || 0) + 0.2;
          // Set keyword score
          keywordScores[keywordId] = 0.8;
        }
      });

      // Normalize category scores to max 1.0
      Object.keys(categoryScores).forEach(cat => {
        categoryScores[cat] = Math.min(categoryScores[cat], 1.0);
      });

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          user_name: state.userName,
          selected_keywords: state.selectedKeywords,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          category_scores: categoryScores,
          keyword_scores: keywordScores,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: '🎉 Bienvenue sur Wouli !',
        description: `${state.userName}, ton feed personnalisé est prêt !`
      });

      setState(prev => ({ ...prev, isCompleted: true, isLoading: false }));
      navigate('/app');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de terminer la configuration. Réessaie.',
        variant: 'destructive'
      });
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [user, canComplete, state.userName, state.selectedKeywords, navigate, toast]);

  // Auto-save progress when changing steps
  useEffect(() => {
    if (user && (state.userName || state.selectedKeywords.length > 0)) {
      saveProgress();
    }
  }, [currentStep]);

  const getProgress = useCallback(() => {
    const steps: OnboardingStep[] = ['welcome', 'name', 'keywords', 'confirmation'];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  }, [currentStep]);

  return {
    currentStep,
    setCurrentStep,
    userName: state.userName,
    setUserName,
    selectedKeywords: state.selectedKeywords,
    toggleKeyword,
    isCompleted: state.isCompleted,
    isLoading: state.isLoading,
    canProceedToKeywords,
    canComplete,
    nextStep,
    prevStep,
    completeOnboarding,
    getProgress
  };
};

// Hook to check if user needs onboarding
export const useOnboardingCheck = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      // Skip check for business users
      if (!user || profile?.type === 'business' || profile?.type === 'admin') {
        setNeedsOnboarding(false);
        setIsChecking(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking onboarding:', error);
          setNeedsOnboarding(false);
        } else {
          setNeedsOnboarding(!data?.onboarding_completed);
        }
      } catch (error) {
        console.error('Error checking onboarding:', error);
        setNeedsOnboarding(false);
      } finally {
        setIsChecking(false);
      }
    };

    if (!authLoading) {
      checkOnboarding();
    }
  }, [user, profile, authLoading]);

  return { needsOnboarding, isChecking: isChecking || authLoading };
};
