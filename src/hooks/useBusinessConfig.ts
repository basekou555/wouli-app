
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BusinessConfig {
  id?: string;
  client_name: string;
  client_type: string;
  location: string;
  brand_color: string;
  features: string[];
}

export const useBusinessConfig = () => {
  const [config, setConfig] = useState<BusinessConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConfig = async () => {
    try {
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
        console.error('Error fetching config:', error);
        throw error;
      }

      if (data) {
        setConfig({
          id: data.id,
          client_name: data.client_name,
          client_type: data.client_type,
          location: data.location,
          brand_color: data.brand_color,
          features: data.features
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
          console.error('Error creating config:', insertError);
          throw insertError;
        }
        
        setConfig({
          id: newConfig.id,
          ...defaultConfig
        });
      }
    } catch (error) {
      console.error('Error fetching config:', error);
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
      console.error('Error updating config:', error);
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
    updateConfig,
    refetch: fetchConfig
  };
};
