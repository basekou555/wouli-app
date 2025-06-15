
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { authSecurityService } from '@/services/authSecurityService';
import { secureLog } from '@/utils/security';

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
    secureLog('🔐 Initialisation AuthContext sécurisé...');
    
    // Configuration du listener d'authentification avec monitoring de sécurité
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        secureLog('🔐 Auth state change sécurisé', { event, hasSession: !!session });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Logging de sécurité pour les événements d'authentification
        if (event === 'SIGNED_IN' && session) {
          secureLog('✅ Connexion sécurisée réussie', { 
            userId: session.user.id, 
            email: session.user.email 
          });
        } else if (event === 'SIGNED_OUT') {
          secureLog('🚪 Déconnexion sécurisée');
        } else if (event === 'TOKEN_REFRESHED') {
          secureLog('🔄 Token rafraîchi de manière sécurisée');
        }
        
        setLoading(false);
      }
    );

    // Vérification de la session initiale avec gestion d'erreur sécurisée
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          secureLog('❌ Erreur lors de la récupération sécurisée de la session', { error: error.message });
          if (error.message.includes('refresh_token_not_found')) {
            secureLog('🧹 Nettoyage sécurisé des tokens expirés...');
            await supabase.auth.signOut();
          }
        } else {
          secureLog('📋 Session initiale sécurisée', { hasSession: !!session });
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        secureLog('❌ Erreur inattendue lors de la récupération sécurisée de la session', { error });
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      secureLog('🧹 Nettoyage du listener d\'authentification sécurisé');
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    try {
      secureLog('📝 Tentative d\'inscription sécurisée', { email });
      
      const result = await authSecurityService.secureSignUp(email, password, username);

      if (result.error) {
        toast({
          title: "Erreur d'inscription",
          description: result.error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Inscription réussie !",
          description: "Vérifiez votre email pour confirmer votre compte."
        });
      }

      return result;
    } catch (error) {
      secureLog('❌ Erreur inattendue lors de l\'inscription sécurisée', { error });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      secureLog('🔐 Tentative de connexion sécurisée', { email });
      
      const result = await authSecurityService.secureSignIn(email, password);

      if (result.error) {
        toast({
          title: "Erreur de connexion",
          description: result.error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Connexion réussie !",
          description: "Bienvenue sur Wouli !"
        });
      }

      return result;
    } catch (error) {
      secureLog('❌ Erreur inattendue lors de la connexion sécurisée', { error });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      secureLog('🚪 Déconnexion sécurisée...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        secureLog('❌ Erreur de déconnexion sécurisée', { error: error.message });
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
      secureLog('❌ Erreur inattendue lors de la déconnexion sécurisée', { error });
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
