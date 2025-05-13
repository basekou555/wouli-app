
import React, { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileSettings from '../components/profile/ProfileSettings';
import EventTabs from '../components/profile/EventTabs';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase.config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { fetchUserEvents } from '../services/eventService';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button, Card, CardContent } from '@/components/ui/card';

interface UserProfile {
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

const Profile = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showSettings, setShowSettings] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isNewAccount, setIsNewAccount] = useState(false);
  const [events, setEvents] = useState({
    upcoming: [],
    past: [],
    organized: []
  });
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setLoadingProfile(false);
        return;
      }
      
      setLoadingProfile(true);
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
          try {
            const userEvents = await fetchUserEvents(user.uid);
            setEvents(userEvents);
          } catch (error) {
            console.error("Error fetching user events:", error);
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
          
          toast({
            title: "Profil créé",
            description: "Un profil par défaut a été créé pour vous.",
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger votre profil.",
          variant: "destructive"
        });
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [user, toast]);

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const handleEditProfile = () => {
    navigate('/create-profile');
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-gray-500">Vous devez être connecté pour voir votre profil.</div>
          <Button onClick={() => navigate('/')}>Aller à l'accueil</Button>
        </div>
      </AppLayout>
    );
  }

  if (loadingProfile) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Chargement du profil...</div>
        </div>
      </AppLayout>
    );
  }

  if (!userProfile) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-gray-500">Aucune donnée de profil trouvée.</div>
          <Button onClick={() => navigate('/create-profile')}>Créer votre profil</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className={`py-4 md:py-6 space-y-4 md:space-y-8 ${isMobile ? 'px-1' : ''}`}>
        <ProfileHeader 
          userProfile={userProfile} 
          toggleSettings={toggleSettings}
          onEditProfile={handleEditProfile}
          isMobile={isMobile}
        />
        
        {showSettings ? (
          <ProfileSettings userProfile={userProfile} />
        ) : (
          <EventTabs 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isNewAccount={isNewAccount}
            upcomingEvents={events.upcoming}
            pastEvents={events.past}
            organizedEvents={events.organized}
            isMobile={isMobile}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Profile;
