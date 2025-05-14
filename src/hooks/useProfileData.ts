
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase.config';
import { useToast } from '@/hooks/use-toast';
import { fetchUserEvents } from '@/services/eventService';

export interface UserProfile {
  name: string;
  username: string;
  avatar: string;
  bio: string;
  isPublic: boolean;
  stats: {
    events: number;
    friends: number;
    photos: number;
    organized: number;
    participated: number;
  };
}

interface ProfileData {
  userProfile: UserProfile | null;
  events: {
    upcoming: any[];
    past: any[];
    organized: any[];
  };
  isNewAccount: boolean;
  loadingProfile: boolean;
  loadingEvents: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
}

export const useProfileData = (): ProfileData => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewAccount, setIsNewAccount] = useState(false);
  const [events, setEvents] = useState({
    upcoming: [],
    past: [],
    organized: []
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchUserProfile = async () => {
    if (!user) {
      setLoadingProfile(false);
      return;
    }
    
    setLoadingProfile(true);
    setError(null);
    
    try {
      // Fetch user profile data
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const userData = {
          ...userDocSnap.data(),
          name: userDocSnap.data().name || 'Utilisateur',
          username: userDocSnap.data().username || '@utilisateur',
          avatar: userDocSnap.data().avatar || 'https://picsum.photos/200?random=profile',
          bio: userDocSnap.data().bio || 'Pas de bio disponible.',
          isPublic: userDocSnap.data().isPublic !== undefined ? userDocSnap.data().isPublic : true,
          stats: userDocSnap.data().stats || {
            events: 0,
            friends: 0,
            photos: 0,
            organized: 0,
            participated: 0,
          },
        } as UserProfile;
        
        setUserProfile(userData);
        
        // Si les statistiques sont à 0, considérer comme un nouveau compte
        if (userData.stats.events === 0 && userData.stats.organized === 0 && userData.stats.participated === 0) {
          setIsNewAccount(true);
        }

        // Fetch events using the centralized service
        setLoadingEvents(true);
        try {
          const userEvents = await fetchUserEvents(user.uid);
          setEvents(userEvents);
        } catch (error) {
          console.error("Error fetching user events:", error);
        } finally {
          setLoadingEvents(false);
        }
      } else {
        console.log('No user data found in Firestore. Creating default profile.');
        const defaultProfile = {
          name: user.displayName || 'Nouvel utilisateur',
          username: '@user' + user.uid.substring(0, 5),
          avatar: 'https://picsum.photos/200?random=profile',
          bio: 'Pas de bio disponible.',
          isPublic: true,
          stats: {
            events: 0,
            friends: 0,
            photos: 0,
            organized: 0,
            participated: 0,
          }
        } as UserProfile;
        
        // Save the default profile to Firestore
        await setDoc(doc(db, 'users', user.uid), {
          ...defaultProfile,
          email: user.email,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        
        setUserProfile(defaultProfile);
        setIsNewAccount(true);
        setLoadingEvents(false);
        
        toast({
          title: "Profil créé",
          description: "Un profil par défaut a été créé pour vous.",
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError("Une erreur est survenue lors du chargement de votre profil");
      toast({
        title: "Erreur",
        description: "Impossible de charger votre profil.",
        variant: "destructive"
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [user, toast]);

  return {
    userProfile,
    events,
    isNewAccount,
    loadingProfile,
    loadingEvents,
    error,
    refreshProfile: fetchUserProfile
  };
};
