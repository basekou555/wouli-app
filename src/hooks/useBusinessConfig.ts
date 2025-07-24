import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BusinessConfig } from '@/types/business';
import { ApiError } from '@/types/api';

export const useBusinessConfig = () => {
  const [config, setConfig] = useState<BusinessConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const { toast } = useToast();

  const handleError = (error: any, context: string) => {
    console.error(`Error in ${context}:`, error);
    const apiError: ApiError = {
      message: error.message || 'Une erreur inattendue s\'est produite',
      code: error.code,
      details: error
    };
    setError(apiError);
    return apiError;
  };

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('[WOULI-BUSINESS] ⚠️ Utilisateur non connecté');
        setError({
          message: 'Vous devez être connecté pour accéder à cette page',
          code: 'UNAUTHENTICATED'
        });
        setLoading(false);
        return;
      }

      // Récupérer la config business et le profil séparément
      const [configResult, profileResult] = await Promise.all([
        supabase
          .from('business_configs')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('profiles')
          .select('username, bio, website, phone, avatar_url, city')
          .eq('id', user.id)
          .single()
      ]);

      const { data, error } = configResult;
      const { data: profileData } = profileResult;

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        console.log('[WOULI-BUSINESS] ✅ Configuration trouvée:', data);
        setConfig({
          id: data.id,
          client_name: data.client_name,
          client_type: data.client_type,
          location: data.location,
          brand_color: data.brand_color,
          features: data.features,
          user_id: data.user_id,
          created_at: data.created_at,
          updated_at: data.updated_at,
          // Données du profil
          username: profileData?.username || '',
          bio: profileData?.bio || '',
          website: profileData?.website || '',
          phone: profileData?.phone || '',
          avatar_url: profileData?.avatar_url || '',
          city: profileData?.city || ''
        });
      } else {
        console.log('[WOULI-BUSINESS] ⚠️ Aucune configuration business trouvée, création par défaut');
        // Créer une configuration par défaut
        await createDefaultConfig(user.id);
      }
    } catch (error) {
      console.log('[WOULI-BUSINESS] ❌ Erreur fetchConfig:', error);
      handleError(error, 'fetchConfig');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultConfig = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('business_configs')
        .insert({
          user_id: userId,
          client_name: 'Mon Établissement',
          client_type: 'restaurant',
          location: 'Lyon',
          brand_color: '#FF7A1F',
          features: ['events', 'stats', 'redirections']
        })
        .select()
        .single();

      if (error) throw error;

      setConfig(data);
      console.log('[WOULI-BUSINESS] ✅ Configuration par défaut créée:', data);
    } catch (error) {
      console.error('[WOULI-BUSINESS] ❌ Erreur création config par défaut:', error);
      setError({
        message: 'Impossible de créer la configuration business',
        code: 'CREATE_CONFIG_ERROR'
      });
    }
  };

  const updateConfig = async (newConfig: BusinessConfig) => {
    try {
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour modifier la configuration",
          variant: "destructive"
        });
        return;
      }

      if (config?.id) {
        const { error } = await supabase
          .from('business_configs')
          .update({
            client_name: newConfig.client_name,
            client_type: newConfig.client_type,
            location: newConfig.location,
            brand_color: newConfig.brand_color,
            features: newConfig.features
          })
          .eq('id', config.id);

        if (error) throw error;
      }

      setConfig(newConfig);
      toast({
        title: "✅ Configuration sauvegardée",
        description: "Votre profil a été mis à jour avec succès",
      });
    } catch (error) {
      handleError(error, 'updateConfig');
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return {
    config,
    loading,
    error,
    updateConfig,
    refetch: fetchConfig,
    clearError: () => setError(null)
  };
};
