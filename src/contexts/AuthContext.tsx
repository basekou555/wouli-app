
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
    console.log('[WOULI-SECURE] 🔐 Initialisation AuthContext sécurisé...');
    
    // Configuration du listener d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[WOULI-SECURE] 🔐 Auth state change sécurisé', { event, hasSession: !!session });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Logging pour les événements d'authentification
        if (event === 'SIGNED_IN' && session) {
          console.log('[WOULI-SECURE] ✅ Connexion sécurisée réussie', { 
            userId: session.user.id, 
            email: session.user.email 
          });
        } else if (event === 'SIGNED_OUT') {
          console.log('[WOULI-SECURE] 🚪 Déconnexion sécurisée');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('[WOULI-SECURE] 🔄 Token rafraîchi de manière sécurisée');
        }
        
        setLoading(false);
      }
    );

    // Vérification de la session initiale
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.log('[WOULI-SECURE] ❌ Erreur lors de la récupération de la session', { error: error.message });
          if (error.message.includes('refresh_token_not_found')) {
            console.log('[WOULI-SECURE] 🧹 Nettoyage des tokens expirés...');
            await supabase.auth.signOut();
          }
        } else {
          console.log('[WOULI-SECURE] 📋 Session initiale sécurisée', { hasSession: !!session });
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.log('[WOULI-SECURE] ❌ Erreur inattendue lors de la récupération de la session', { error });
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      console.log('[WOULI-SECURE] 🧹 Nettoyage du listener d\'authentification');
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    try {
      console.log('[WOULI-SECURE] 📝 Tentative d\'inscription', { email });
      
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
      console.log('[WOULI-SECURE] ❌ Erreur inattendue lors de l\'inscription', { error });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('[WOULI-SECURE] 🔐 Tentative de connexion', { email });
      
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
      console.log('[WOULI-SECURE] ❌ Erreur inattendue lors de la connexion', { error });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('[WOULI-SECURE] 🚪 Déconnexion...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.log('[WOULI-SECURE] ❌ Erreur de déconnexion', { error: error.message });
        toast({
          title: "Erreur de déconnexion",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Déconnexion réussie",
          description: "À bientôt sur Wouli !"
        });
      }
    } catch (error) {
      console.log('[WOULI-SECURE] ❌ Erreur inattendue lors de la déconnexion', { error });
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
