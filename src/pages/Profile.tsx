import React, { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Edit2, MapPin, Image, Users, Settings, LogOut, Lock, Eye, EyeOff, ChevronRight, Film } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useAuth } from '../context/AuthContext';
import { db } from '../../firebase.config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

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
};

// Événements organisés
const organizedEvents = [{
  id: '1',
  title: 'Afterwork au Café des Artistes',
  date: '2024-05-15T18:00:00',
  location: 'Café des Artistes, Paris',
  participants: 8,
  image: 'https://picsum.photos/400/200?random=1'
}, {
  id: '11',
  title: 'Dîner d\'anniversaire',
  date: '2024-04-20T19:30:00',
  location: 'Restaurant Le Gourmet, Paris',
  participants: 10,
  image: 'https://picsum.photos/400/200?random=16'
}];

// Événements futurs
const upcomingEvents = [{
  id: '2',
  title: 'Concert au Zénith',
  date: '2024-05-25T20:00:00',
  location: 'Zénith, Paris',
  participants: 12,
  image: 'https://picsum.photos/400/200?random=2'
}, {
  id: '3',
  title: 'Festival d\'été',
  date: '2024-06-15T14:00:00',
  location: 'Parc de la Villette, Paris',
  participants: 25,
  image: 'https://picsum.photos/400/200?random=3'
}];

// Événements passés
const pastEvents = [{
  id: '12',
  title: 'Exposition Van Gogh',
  date: '2024-03-12T14:00:00',
  location: 'Musée d\'Orsay, Paris',
  participants: 5,
  image: 'https://picsum.photos/400/200?random=17',
  hasPhotos: true,
  hasVideo: true
}, {
  id: '13',
  title: 'Concert Jazz',
  date: '2024-02-28T20:00:00',
  location: 'Jazz Club, Paris',
  participants: 8,
  image: 'https://picsum.photos/400/200?random=18',
  hasPhotos: true,
  hasVideo: false
}, {
  id: '14',
  title: 'Dégustation de vins',
  date: '2024-01-15T19:00:00',
  location: 'Cave à vins, Paris',
  participants: 6,
  image: 'https://picsum.photos/400/200?random=19',
  hasPhotos: true,
  hasVideo: true
}];
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};
type PrivacyFormValues = {
  profileVisibility: "public" | "private";
  eventVisibility: "public" | "friends" | "participants";
};
const Profile = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [privacyTab, setPrivacyTab] = useState(false);
<<<<<<< HEAD
  const [profileVisibility, setProfileVisibility] = useState<"public" | "private">(userProfile.isPublic ? "public" : "private");
<<<<<<< HEAD
  const [eventVisibility, setEventVisibility] = useState<"public" | "friends" | "participants">("friends");
  const form = useForm<PrivacyFormValues>({
    defaultValues: {
      profileVisibility: userProfile.isPublic ? "public" : "private",
      eventVisibility: "friends"
    }
  });
=======
  const [eventVisibility, setEventVisibility] = useState<"public" | "friends" | "participants">("friends");+  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
=======
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
>>>>>>> c58c14a (Votre message de commit ici, décrivant les changements effectués)
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const { signOutUser, user } = useAuth();

  // Forme avec les valeurs par défaut qui seront mises à jour après chargement du profil
  const form = useForm<PrivacyFormValues>({
    defaultValues: {
      profileVisibility: "public",
      eventVisibility: "friends",
    },
  });

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
              // Provide default values if fields are missing in Firestore
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
            
            // Mise à jour des valeurs du formulaire après chargement des données
            form.reset({
              profileVisibility: userData.isPublic ? "public" : "private",
              eventVisibility: userDocSnap.data().eventVisibility || "friends",
            });
          } else {
            console.log('No user data found in Firestore.');
            setUserProfile(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserProfile(null);
        } finally {
          setLoadingProfile(false);
        }
      } else {
        setUserProfile(null);
        setLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [user, form]);

>>>>>>> 59ea0b0 (Add chat and discussion features)
  const togglePrivacySettings = () => {
    setPrivacyTab(!privacyTab);
  };
<<<<<<< HEAD
  const onSubmit = (data: PrivacyFormValues) => {
    setProfileVisibility(data.profileVisibility);
    setEventVisibility(data.eventVisibility);
  };+
=======

  const onSubmit = async (data: PrivacyFormValues) => {
    if (!user) return;
    
    setSavingSettings(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        isPublic: data.profileVisibility === "public",
        eventVisibility: data.eventVisibility
      });
      
      // Mise à jour de l'état local après succès
      setUserProfile(prev => prev ? {
        ...prev,
        isPublic: data.profileVisibility === "public"
      } : null);
      
      // Afficher un message de succès (à implémenter)
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      // Afficher un message d'erreur (à implémenter)
    } finally {
      setSavingSettings(false);
    }
  };

  const handleEditProfile = () => {
    // Implémentation future - redirection vers page d'édition ou ouverture de modal
    console.log('Edit profile clicked');
  };
>>>>>>> c58c14a (Votre message de commit ici, décrivant les changements effectués)

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
<<<<<<< HEAD
  };
  return <AppLayout>
=======
  }

  return (
    <AppLayout>
>>>>>>> c58c14a (Votre message de commit ici, décrivant les changements effectués)
      <div className="py-6 space-y-8">
        <div className="bg-white rounded-xl shadow-sm p-6 animate-fade-in">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-white shadow-sm">
                <img src={userProfile.avatar} alt={userProfile.name} />
              </Avatar>
              <div className="absolute -bottom-2 -right-2 flex items-center bg-white rounded-full p-1 shadow-sm">
                {userProfile.isPublic ? <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                    <Eye className="h-3 w-3 mr-1" /> Public
                  </Badge> : <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                    <EyeOff className="h-3 w-3 mr-1" /> Privé
                  </Badge>}
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold">{userProfile.name}</h1>
              <p className="text-gray-500">{userProfile.username}</p>
              
              <p className="mt-2 text-gray-700">{userProfile.bio}</p>
              
              <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
                <Badge variant="outline" className="flex items-center p-2 bg-purple-50 text-purple-700 border-purple-200">
                  <Calendar className="h-3 w-3 mr-1.5" />
                  <span className="font-bold">{userProfile.stats.organized}</span>
                  <span className="ml-1">organisés</span>
                </Badge>
                
                <Badge variant="outline" className="flex items-center p-2 bg-pink-50 text-pink-700 border-pink-200">
                  <Users className="h-3 w-3 mr-1.5" />
                  <span className="font-bold">{userProfile.stats.participated}</span>
                  <span className="ml-1">participés</span>
                </Badge>
                
                <Badge variant="outline" className="flex items-center p-2 bg-blue-50 text-blue-700 border-blue-200">
                  <Image className="h-3 w-3 mr-1.5" />
                  <span className="font-bold">{userProfile.stats.photos}</span>
                  <span className="ml-1">photos</span>
                </Badge>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button 
                variant="outline" 
                className="flex items-center"
                onClick={handleEditProfile}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Éditer le profil
              </Button>
<<<<<<< HEAD
              <Button variant={privacyTab ? "secondary" : "ghost"} className="flex items-center" onClick={togglePrivacySettings}>
=======
              
              <Button 
                variant={privacyTab ? "secondary" : "ghost"} 
                className="flex items-center"
                onClick={togglePrivacySettings}
              >
>>>>>>> c58c14a (Votre message de commit ici, décrivant les changements effectués)
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center"
                onClick={() => signOutUser()}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
        
        {privacyTab && <Card className="animate-fade-down">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Lock className="h-4 w-4 mr-2" />
                Paramètres de confidentialité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-3">Statut du profil</h3>
                    <FormField control={form.control} name="profileVisibility" render={({
                  field
                }) => <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-4">
                          <div className="flex items-start space-x-2">
                            <RadioGroupItem value="public" id="public-profile" />
                            <div className="grid gap-1.5">
                              <FormLabel htmlFor="public-profile" className="font-medium">Public</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Votre profil est visible par tous
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <RadioGroupItem value="private" id="private-profile" />
                            <div className="grid gap-1.5">
                              <FormLabel htmlFor="private-profile" className="font-medium">Privé</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Seuls vos amis peuvent voir votre profil
                              </p>
                            </div>
                          </div>
                        </RadioGroup>} />
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-3">Visibilité des événements passés</h3>
                    <FormField control={form.control} name="eventVisibility" render={({
                  field
                }) => <RadioGroup value={field.value} onValueChange={field.onChange} className="space-y-3">
                          <div className="flex items-start space-x-2">
                            <RadioGroupItem value="public" id="public-events" />
                            <div className="grid gap-1.5">
                              <FormLabel htmlFor="public-events" className="font-medium">Public</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Visibles par tous les utilisateurs
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <RadioGroupItem value="friends" id="friends-events" />
                            <div className="grid gap-1.5">
                              <FormLabel htmlFor="friends-events" className="font-medium">Amis</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Visibles uniquement par vos amis
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <RadioGroupItem value="participants" id="participants-events" />
                            <div className="grid gap-1.5">
                              <FormLabel htmlFor="participants-events" className="font-medium">Participants</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Visibles uniquement par les participants de l'événement
                              </p>
                            </div>
                          </div>
                        </RadioGroup>} />
                  </div>
                  <CardFooter className="px-0">
                    <Button 
                      type="submit" 
                      size="sm" 
                      className="ml-auto"
                      disabled={savingSettings}
                    >
                      {savingSettings ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </CardContent>
          </Card>}
        
        {!privacyTab && <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in">
            
            
            <TabsContent value="upcoming" className="mt-6">
              <div className="space-y-4">
                {upcomingEvents.length > 0 ? upcomingEvents.map(event => <Link to={`/events/${event.id}`} key={event.id} className="block group">
                      <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-1/3 h-40 overflow-hidden">
                            <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="font-medium text-lg mb-2">{event.title}</h3>
                              <div className="space-y-2">
                                <div className="flex items-center text-gray-600">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  <span className="text-sm">{formatDate(event.date)}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <MapPin className="h-4 w-4 mr-2" />
                                  <span className="text-sm">{event.location}</span>
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex items-center text-gray-600">
                                <Users className="h-4 w-4 mr-2" />
                                <span className="text-sm">{event.participants} participants</span>
                              </div>
                              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>) : <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Calendar className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Aucun événement à venir</h3>
                    <p className="text-gray-500 mt-1">Explorez les événements pour découvrir de nouvelles activités</p>
                    <Button className="mt-4" asChild>
                      <Link to="/explore">Explorer les événements</Link>
                    </Button>
                  </div>}
              </div>
            </TabsContent>
            
            <TabsContent value="past" className="mt-6">
              <div className="space-y-4">
                {pastEvents.length > 0 ? pastEvents.map(event => <Link to={`/events/${event.id}`} key={event.id} className="block group">
                      <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-1/3 h-40 overflow-hidden relative">
                            <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <div className="absolute top-2 right-2 flex gap-1">
                              {event.hasPhotos && <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm">
                                  <Image className="h-3 w-3 mr-1" />
                                  Photos
                                </Badge>}
                              {event.hasVideo && <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm">
                                  <Film className="h-3 w-3 mr-1" />
                                  Vidéo
                                </Badge>}
                            </div>
                          </div>
                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="font-medium text-lg mb-2">{event.title}</h3>
                              <div className="space-y-2">
                                <div className="flex items-center text-gray-600">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  <span className="text-sm">{formatDate(event.date)}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <MapPin className="h-4 w-4 mr-2" />
                                  <span className="text-sm">{event.location}</span>
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex items-center text-gray-600">
                                <Users className="h-4 w-4 mr-2" />
                                <span className="text-sm">{event.participants} participants</span>
                              </div>
                              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>) : <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Image className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Aucun événement passé</h3>
                    <p className="text-gray-500 mt-1">Vos événements passés apparaîtront ici</p>
                  </div>}
              </div>
            </TabsContent>
          </Tabs>}
      </div>
    </AppLayout>;
};
<<<<<<< HEAD
=======

>>>>>>> c58c14a (Votre message de commit ici, décrivant les changements effectués)
export default Profile;