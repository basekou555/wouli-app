
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
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { UserCircle, Calendar, Users, Image } from 'lucide-react';

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

const ProfileSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {/* Header skeleton */}
    <div className="space-y-4">
      <div className="h-24 md:h-36 w-full bg-gray-200 rounded-lg"></div>
      <div className="flex flex-col md:flex-row md:items-end md:gap-6">
        <div className="-mt-12 md:-mt-16 mx-auto md:mx-0">
          <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-gray-300"></div>
        </div>
        <div className="flex-1 mt-3 md:mt-0 space-y-3">
          <div className="h-6 w-1/3 bg-gray-300 rounded"></div>
          <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
          <div className="h-4 w-2/3 bg-gray-200 rounded mt-3"></div>
        </div>
      </div>
    </div>
    
    {/* Stats cards skeleton */}
    <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg border p-2 md:p-3">
          <div className="h-5 w-1/2 bg-gray-200 rounded mx-auto mb-1"></div>
          <div className="h-3 w-1/3 bg-gray-100 rounded mx-auto"></div>
        </div>
      ))}
    </div>
    
    {/* Content skeleton */}
    <div className="space-y-4 mt-4">
      <div className="h-8 w-40 bg-gray-200 rounded"></div>
      <div className="space-y-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border p-4">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 h-40 bg-gray-200 rounded-lg"></div>
              <div className="p-4 flex-1">
                <div className="h-6 w-1/2 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 w-2/3 bg-gray-100 rounded"></div>
                  <div className="h-4 w-1/2 bg-gray-100 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const EmptyProfileState = ({ onCreateProfile }: { onCreateProfile: () => void }) => (
  <Card className="text-center p-8 max-w-md mx-auto">
    <CardContent className="pt-6 flex flex-col items-center">
      <div className="bg-purple-100 p-3 rounded-full mb-4">
        <UserCircle className="h-12 w-12 text-purple-500" />
      </div>
      <h2 className="text-2xl font-semibold mb-2">Créez votre profil</h2>
      <p className="text-gray-500 mb-6">
        Partagez vos informations et personnalisez votre expérience Wouli
      </p>
      <Button onClick={onCreateProfile} size="lg" className="w-full md:w-auto">
        Créer mon profil
      </Button>
    </CardContent>
  </Card>
);

const Profile = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showSettings, setShowSettings] = useState(false);
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
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
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

  if (error) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-red-500 font-semibold">{error}</div>
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </div>
      </AppLayout>
    );
  }

  if (loadingProfile) {
    return (
      <AppLayout>
        <ProfileSkeleton />
      </AppLayout>
    );
  }

  if (!userProfile) {
    return (
      <AppLayout>
        <EmptyProfileState onCreateProfile={() => navigate('/create-profile')} />
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
            isLoading={loadingEvents}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Profile;
