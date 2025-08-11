import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useEventInteractionsToggle = (eventId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [isParticipating, setIsParticipating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!user || !eventId) return setLoading(false);
      const [{ data: like }, { data: part }] = await Promise.all([
        supabase
          .from('event_likes')
          .select('id')
          .eq('event_id', eventId)
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('event_participants')
          .select('id')
          .eq('event_id', eventId)
          .eq('user_id', user.id)
          .maybeSingle()
      ]);
      setIsLiked(!!like);
      setIsParticipating(!!part);
      setLoading(false);
    };
    fetchStatus();
  }, [eventId, user?.id]);

  const toggleLike = async () => {
    if (!user) return;
    if (isLiked) {
      const { error } = await supabase
        .from('event_likes')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);
      if (!error) {
        setIsLiked(false);
        toast({ title: 'Like retiré' });
      }
    } else {
      const { error } = await supabase
        .from('event_likes')
        .insert({ event_id: eventId, user_id: user.id });
      if (!error) {
        setIsLiked(true);
        toast({ title: "Événement liké ! ❤️" });
      }
    }
  };

  const toggleParticipation = async () => {
    if (!user) return;
    if (isParticipating) {
      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);
      if (!error) {
        setIsParticipating(false);
        toast({ title: 'Participation annulée', description: "Tu ne participes plus à cet événement" });
      }
    } else {
      const { error } = await supabase
        .from('event_participants')
        .insert({ event_id: eventId, user_id: user.id });
      if (!error) {
        setIsParticipating(true);
        toast({ title: 'Super ! 🎉', description: "Tu es inscrit à cet événement" });
      }
    }
  };

  return { isLiked, isParticipating, toggleLike, toggleParticipation, loading };
};
