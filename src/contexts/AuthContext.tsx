
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from '@/types/user';
import { BusinessConfig } from '@/types/business';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  businessConfig: BusinessConfig | null;
  userType: 'user' | 'business' | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: any }>;
  businessSignUp: (email: string, password: string, businessData: {
    username: string;
    clientName: string;
    clientType: string;
    location: string;
    brandColor?: string;
  }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isBusinessUser: boolean;
  hasBusinessConfig: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [businessConfig, setBusinessConfig] = useState<BusinessConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Configuration du listener d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch user profile and business config when user changes
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfileAndBusinessConfig(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setBusinessConfig(null);
          setLoading(false);
        }
      }
    );

    // Vérification de la session initiale
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          if (error.message.includes('refresh_token_not_found')) {
            await supabase.auth.signOut();
          }
          setLoading(false);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            setTimeout(() => {
              fetchUserProfileAndBusinessConfig(session.user.id);
            }, 0);
          } else {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Erreur récupération session:', error);
        setLoading(false);
      }
    };

    getInitialSession();
    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfileAndBusinessConfig = async (userId: string) => {
    let profileData = null;
    let businessData = null;
    
    try {
      // Fetch user profile - only select essential fields for security
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, type, bio, city, avatar_url, created_at, updated_at')
        .eq('id', userId)
        .single();

      if (!profileError && profile) {
        profileData = profile;
        setProfile(profile);
        
        // Fetch business config if user is business type
        if (profile?.type === 'business') {
          const { data: config, error: businessError } = await supabase
            .from('business_configs')
            .select('*')
            .eq('user_id', userId)
            .single();

          if (!businessError && config) {
            businessData = config;
            setBusinessConfig(config);
          }
        }
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { username }
        }
      });

      if (error) {
        toast({
          title: "Erreur d'inscription",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Inscription réussie !",
          description: "Vérifiez votre email pour confirmer votre compte."
        });
      }

      return { error };
    } catch (error) {
      console.error('Erreur inscription:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast({
          title: "Erreur de connexion",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Connexion réussie !",
          description: "Bienvenue sur Wouli !"
        });
      }

      return { error };
    } catch (error) {
      console.error('Erreur connexion:', error);
      return { error };
    }
  };

  const businessSignUp = async (email: string, password: string, businessData: {
    username: string;
    clientName: string;
    clientType: string;
    location: string;
    brandColor?: string;
  }) => {
    try {
      const redirectUrl = `${window.location.origin}/business`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { 
            username: businessData.username,
            type: 'business',
            clientName: businessData.clientName,
            clientType: businessData.clientType,
            location: businessData.location,
            brandColor: businessData.brandColor || '#FF7A1F'
          }
        }
      });

      if (error) {
        toast({
          title: "Erreur d'inscription",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      toast({
        title: "Inscription réussie !",
        description: "Vérifiez votre email pour confirmer votre compte établissement."
      });

      return { error: null };
    } catch (error) {
      console.error('Erreur inscription business:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Erreur de déconnexion",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setProfile(null);
        setBusinessConfig(null);
        toast({
          title: "Déconnexion réussie",
          description: "À bientôt sur Wouli !"
        });
      }
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  const userType = profile?.type || null;
  const isBusinessUser = userType === 'business';
  const hasBusinessConfig = !!businessConfig;

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      businessConfig,
      userType,
      loading,
      signUp,
      businessSignUp,
      signIn,
      signOut,
      isBusinessUser,
      hasBusinessConfig
    }}>
      {children}
    </AuthContext.Provider>
  );
};
