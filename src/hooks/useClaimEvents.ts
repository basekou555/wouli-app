import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UseClaimEventsReturn {
  claimedCount: number;
  isClaimingComplete: boolean;
  isFirstLogin: boolean;
}

export const useClaimEvents = (): UseClaimEventsReturn => {
  const { user, userType } = useAuth();
  const [claimedCount, setClaimedCount] = useState(0);
  const [isClaimingComplete, setIsClaimingComplete] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  useEffect(() => {
    const checkAndClaimEvents = async () => {
      if (!user || userType !== 'business') {
        setIsClaimingComplete(true);
        return;
      }

      try {
        // 1. Vérifier si c'est le premier login (onboarding_completed = false)
        const { data: details } = await supabase
          .from('business_details')
          .select('instagram_handle, onboarding_completed')
          .eq('id', user.id)
          .maybeSingle();

        // Si onboarding déjà complété, pas de transfert à afficher
        if (details?.onboarding_completed) {
          setIsClaimingComplete(true);
          return;
        }

        setIsFirstLogin(true);

        // 2. Si instagram_handle présent, tenter le transfert
        if (details?.instagram_handle) {
          const { data: claimResult, error: claimError } = await supabase.rpc('claim_venue_events', {
            p_venue_id: user.id,
            p_instagram_handle: details.instagram_handle
          });

          if (claimError) {
            console.error('Error claiming events:', claimError);
          } else if (claimResult?.[0]?.claimed_count > 0) {
            setClaimedCount(claimResult[0].claimed_count);
          }
        }

        // 3. Marquer l'onboarding comme complété
        await supabase
          .from('business_details')
          .update({ onboarding_completed: true })
          .eq('id', user.id);

      } catch (error) {
        console.error('Error in claim events process:', error);
      } finally {
        setIsClaimingComplete(true);
      }
    };

    checkAndClaimEvents();
  }, [user, userType]);

  return { claimedCount, isClaimingComplete, isFirstLogin };
};
