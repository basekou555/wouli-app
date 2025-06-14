
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
        // Use default config if not authenticated
        setConfig({
          client_name: 'Blue Note Bar',
          client_type: 'Bar/Restaurant',
          location: 'Lyon',
          brand_color: '#FF7A1F',
          features: ['events', 'stats', 'redirections']
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('business_configs')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setConfig({
          id: data.id,
          client_name: data.client_name,
          client_type: data.client_type,
          location: data.location,
          brand_color: data.brand_color,
          features: data.features,
          user_id: data.user_id,
          created_at: data.created_at,
          updated_at: data.updated_at
        });
      } else {
        // Create default config for new user
        const defaultConfig = {
          client_name: 'Mon Établissement',
          client_type: 'Bar/Restaurant',
          location: 'Lyon',
          brand_color: '#FF7A1F',
          features: ['events', 'stats', 'redirections']
        };
        
        const { data: newConfig, error: insertError } = await supabase
          .from('business_configs')
          .insert({
            user_id: user.id,
            ...defaultConfig
          })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }
        
        setConfig({
          id: newConfig.id,
          ...defaultConfig,
          user_id: newConfig.user_id,
          created_at: newConfig.created_at,
          updated_at: newConfig.updated_at
        });
      }
    } catch (error) {
      handleError(error, 'fetchConfig');
      // Fallback to default config
      setConfig({
        client_name: 'Blue Note Bar',
        client_type: 'Bar/Restaurant',
        location: 'Lyon',
        brand_color: '#FF7A1F',
        features: ['events', 'stats', 'redirections']
      });
    } finally {
      setLoading(false);
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
