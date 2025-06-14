
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, User, Bell, Shield, MapPin, Heart, Save, Camera, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';

const UserProfileSettings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useUserProfile();

  const [formData, setFormData] = React.useState({
    username: profile?.username || '',
    city: profile?.city || 'Lyon',
    bio: profile?.bio || '',
    phone: profile?.phone || '',
    website: profile?.website || ''
  });

  const [notifications, setNotifications] = React.useState({
    newEvents: true,
    friendRequests: true,
    eventReminders: true,
    marketing: false,
    weeklyDigest: true
  });

  const [privacy, setPrivacy] = React.useState({
    profileVisibility: 'public',
    showActivity: true,
    showStats: true,
    allowMessages: true,
    showLocation: true
  });

  const [interests, setInterests] = React.useState([
    'Concerts', 'Restaurants', 'Sport', 'Cinéma', 'Art', 'Technologie'
  ]);

  const availableInterests = [
    'Concerts', 'Restaurants', 'Sport', 'Cinéma', 'Art', 'Technologie', 
    'Voyage', 'Mode', 'Photographie', 'Musique', 'Danse', 'Théâtre',
    'Littérature', 'Gaming', 'Cuisine', 'Nature', 'Fitness', 'Business'
  ];

  const handleSave = () => {
    // Ici on sauvegarderait les données
    console.log('Saving user profile:', formData, notifications, privacy, interests);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/profile')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Paramètres du Profil</h1>
              <p className="text-gray-600 mt-2">Gérez vos informations personnelles et préférences</p>
            </div>
          </div>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="interests">Intérêts</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Confidentialité</TabsTrigger>
            <TabsTrigger value="account">Compte</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Informations personnelles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4 mb-6">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl">
                        {formData.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Button variant="outline" size="sm">
                        <Camera className="h-4 w-4 mr-2" />
                        Changer la photo
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG max 2MB</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom d'utilisateur
                    </label>
                    <Input
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="Votre nom d'utilisateur"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ville
                      </label>
                      <Input
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Lyon"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="06 12 34 56 78"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Parlez-nous de vous..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site web
                    </label>
                    <Input
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://votre-site.com"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Aperçu du profil</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          {formData.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{formData.username || 'Nom d\'utilisateur'}</h3>
                        <p className="text-sm text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {formData.city}
                        </p>
                      </div>
                    </div>
                    {formData.bio && (
                      <p className="text-sm text-gray-600 mb-3">{formData.bio}</p>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {interests.slice(0, 3).map((interest) => (
                        <span key={interest} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {interest}
                        </span>
                      ))}
                      {interests.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{interests.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="interests" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Centres d'intérêt
                </CardTitle>
                <p className="text-sm text-gray-600">Sélectionnez vos centres d'intérêt pour personnaliser vos recommandations</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {availableInterests.map((interest) => (
                    <div
                      key={interest}
                      onClick={() => {
                        if (interests.includes(interest)) {
                          setInterests(interests.filter(i => i !== interest));
                        } else {
                          setInterests([...interests, interest]);
                        }
                      }}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        interests.includes(interest)
                          ? 'bg-blue-50 border-blue-200 text-blue-800'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-sm font-medium">{interest}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Nouveaux événements</h4>
                    <p className="text-sm text-gray-600">Recevoir des notifications pour les nouveaux événements près de chez vous</p>
                  </div>
                  <Switch
                    checked={notifications.newEvents}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, newEvents: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Demandes d'amis</h4>
                    <p className="text-sm text-gray-600">Être notifié des nouvelles demandes d'amis</p>
                  </div>
                  <Switch
                    checked={notifications.friendRequests}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, friendRequests: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Rappels d'événements</h4>
                    <p className="text-sm text-gray-600">Recevoir des rappels avant vos événements</p>
                  </div>
                  <Switch
                    checked={notifications.eventReminders}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, eventReminders: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Résumé hebdomadaire</h4>
                    <p className="text-sm text-gray-600">Recevoir un résumé de votre activité chaque semaine</p>
                  </div>
                  <Switch
                    checked={notifications.weeklyDigest}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyDigest: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Confidentialité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Visibilité du profil</h4>
                    <p className="text-sm text-gray-600">Qui peut voir votre profil</p>
                  </div>
                  <select
                    value={privacy.profileVisibility}
                    onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="public">Public</option>
                    <option value="friends">Amis seulement</option>
                    <option value="private">Privé</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Afficher l'activité</h4>
                    <p className="text-sm text-gray-600">Permettre aux autres de voir votre activité récente</p>
                  </div>
                  <Switch
                    checked={privacy.showActivity}
                    onCheckedChange={(checked) => setPrivacy({ ...privacy, showActivity: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Afficher les statistiques</h4>
                    <p className="text-sm text-gray-600">Rendre vos stats d'événements visibles</p>
                  </div>
                  <Switch
                    checked={privacy.showStats}
                    onCheckedChange={(checked) => setPrivacy({ ...privacy, showStats: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres du compte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Email</h4>
                  <p className="text-sm text-gray-600 mb-2">{user?.email}</p>
                  <Button variant="outline" size="sm">Changer l'email</Button>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Mot de passe</h4>
                  <Button variant="outline" size="sm">Changer le mot de passe</Button>
                </div>
                <div className="border-t pt-6">
                  <h4 className="font-medium mb-2 text-red-600">Zone de danger</h4>
                  <p className="text-sm text-gray-600 mb-4">Ces actions sont irréversibles</p>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                      Supprimer mon compte
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserProfileSettings;
