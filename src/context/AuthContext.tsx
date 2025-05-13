
import { createContext, useContext, useEffect } from 'react';
import { auth } from '../firebase.config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, User, onAuthStateChanged } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  signUp: (email: string, password: string) => Promise<User | null>;
  signIn: (email: string, password: string) => Promise<User | null>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Listen for auth state changes and update toast accordingly
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        toast({
          description: "Connecté avec succès",
        });
      }
    });
    return () => unsubscribe();
  }, [toast]);

  const signUp = async (email: string, password: string): Promise<User | null> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      toast({
        description: "Compte créé avec succès",
      });
      return userCredential.user;
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error);
      let message = "Échec de l'inscription";

      if (error.code === 'auth/email-already-in-use') {
        message = "Cette adresse email est déjà utilisée";
      } else if (error.code === 'auth/weak-password') {
        message = "Le mot de passe doit contenir au moins 6 caractères";
      } else if (error.code === 'auth/invalid-email') {
        message = "L'adresse email n'est pas valide";
      }

      toast({
        variant: "destructive",
        description: message,
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string): Promise<User | null> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      let message = "Identifiants incorrects";

      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = "Email ou mot de passe incorrect";
      } else if (error.code === 'auth/too-many-requests') {
        message = "Trop de tentatives échouées. Veuillez réessayer plus tard";
      }

      toast({
        variant: "destructive",
        description: message,
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      navigate('/');
      toast({
        description: "Déconnexion réussie",
      });
    } catch (error: any) {
      console.error('Erreur de déconnexion:', error);
      toast({
        variant: "destructive",
        description: "Échec de la déconnexion",
      });
      throw error;
    }
  };

  const value: AuthContextType = {
    user: user || null,
    signUp,
    signIn,
    signOut,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};
