
import React, { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileSettings from '../components/profile/ProfileSettings';
import EventTabs from '../components/profile/EventTabs';
import { useAuth } from '../context/AuthContext';
import { db } from '../../firebase.config';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';

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

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        setLoadingProfile(true);
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = {
              ...userDocSnap.data(),
              name: userDocSnap.data().name || 'Unknown User',
              username: userDocSnap.data().username || '@unknown',
              avatar: userDocSnap.data().avatar || 'https://picsum.photos/200?random=profile',
              bio: userDocSnap.data().bio || 'No bio available.',
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

            // Récupérer les événements
            await fetchUserEvents(user.uid);
          } else {
            console.log('No user data found in Firestore. Creating default profile.');
            const defaultProfile = {
              name: user.displayName || 'New User',
              username: '@user' + user.uid.substring(0, 5),
              avatar: 'https://picsum.photos/200?random=profile',
              bio: 'No bio available.',
              isPublic: true,
              stats: {
                events: 0,
                friends: 0,
                photos: 0,
                organized: 0,
                participated: 0,
              }
            } as UserProfile;
            
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
      }
    };

    const fetchUserEvents = async (userId: string) => {
      try {
        // Requête pour les événements à venir
        const upcomingEventsQuery = query(
          collection(db, 'events'), 
          where('participants', 'array-contains', userId),
          where('date', '>=', new Date())
        );
        const upcomingEventsSnapshot = await getDocs(upcomingEventsQuery);
        const upcomingEvents = upcomingEventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Requête pour les événements passés
        const pastEventsQuery = query(
          collection(db, 'events'), 
          where('participants', 'array-contains', userId),
          where('date', '<', new Date())
        );
        const pastEventsSnapshot = await getDocs(pastEventsQuery);
        const pastEvents = pastEventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Requête pour les événements organisés
        const organizedEventsQuery = query(
          collection(db, 'events'), 
          where('organizer', '==', userId)
        );
        const organizedEventsSnapshot = await getDocs(organizedEventsQuery);
        const organizedEvents = organizedEventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setEvents({
          upcoming: upcomingEvents,
          past: pastEvents,
          organized: organizedEvents
        });
      } catch (error) {
        console.error('Error fetching events:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos événements.",
          variant: "destructive"
        });
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
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Aucune donnée de profil trouvée.</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="py-6 space-y-8">
        <ProfileHeader 
          userProfile={userProfile} 
          toggleSettings={toggleSettings}
          onEditProfile={handleEditProfile}
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
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Profile;
