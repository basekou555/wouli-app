
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
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
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('🔐 Initialisation AuthContext...');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔐 Auth state change:', event, session ? 'avec session' : 'sans session');
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session) {
          console.log('✅ Utilisateur connecté:', session.user.email);
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 Utilisateur déconnecté');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token rafraîchi');
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('❌ Erreur lors de la récupération de la session:', error);
          if (error.message.includes('refresh_token_not_found')) {
            console.log('🧹 Nettoyage des tokens expirés...');
            await supabase.auth.signOut();
          }
        } else {
          console.log('📋 Session initiale:', session ? 'trouvée' : 'aucune');
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('❌ Erreur inattendue lors de la récupération de la session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      console.log('🧹 Nettoyage de l\'auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    try {
      console.log('📝 Tentative d\'inscription pour:', email);
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username
          }
        }
      });

      if (error) {
        console.error('❌ Erreur d\'inscription:', error);
        toast({
          title: "Erreur d'inscription",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('✅ Inscription réussie');
        toast({
          title: "Inscription réussie !",
          description: "Vérifiez votre email pour confirmer votre compte."
        });
      }

      return { error };
    } catch (error) {
      console.error('❌ Erreur inattendue lors de l\'inscription:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Tentative de connexion pour:', email);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Erreur de connexion:', error);
        toast({
          title: "Erreur de connexion",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('✅ Connexion réussie');
        toast({
          title: "Connexion réussie !",
          description: "Bienvenue sur Wouli !"
        });
      }

      return { error };
    } catch (error) {
      console.error('❌ Erreur inattendue lors de la connexion:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Déconnexion...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Erreur de déconnexion:', error);
        toast({
          title: "Erreur de déconnexion",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('✅ Déconnexion réussie');
        toast({
          title: "Déconnexion réussie",
          description: "À bientôt sur Wouli !"
        });
      }
    } catch (error) {
      console.error('❌ Erreur inattendue lors de la déconnexion:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};
