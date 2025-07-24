
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Users, MapPin, Palette, Globe, Save, Eye, ArrowLeft, Bell, Shield, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBusinessConfig } from '@/hooks/useBusinessConfig';
import { useProfile } from '@/hooks/useProfile';
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CardDescription } from "@/components/ui/card";

const BusinessProfileSettings = () => {
  const navigate = useNavigate();
  const { config, loading, updateConfig } = useBusinessConfig();
  const { profile, updateProfile } = useProfile();

  const [formData, setFormData] = React.useState(config || {
    client_name: '',
    client_type: 'Bar/Restaurant',
    location: '',
    brand_color: '#FF7A1F',
    features: []
  });

  const [profileData, setProfileData] = React.useState({
    username: '',
    bio: '',
    website: '',
    phone: '',
    city: ''
  });

  const [notifications, setNotifications] = React.useState({
    newParticipants: true,
    weeklyReport: true,
    marketing: false,
    events: true
  });

  const [privacy, setPrivacy] = React.useState({
    publicProfile: true,
    showStats: true,
    allowMessages: true
  });

  React.useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  React.useEffect(() => {
    if (profile) {
      setProfileData({
        username: profile.username || '',
        bio: profile.bio || '',
        website: profile.website || '',
        phone: profile.phone || '',
        city: profile.city || ''
      });
    }
  }, [profile]);

  const handleSaveConfig = async () => {
    await updateConfig(formData);
  };

  const handleSaveProfile = async () => {
    await updateProfile({
      username: profileData.username,
      bio: profileData.bio,
      website: profileData.website,
      phone: profileData.phone,
      city: profileData.city
    });
  };

  const handleSaveAll = async () => {
    await Promise.all([
      handleSaveConfig(),
      handleSaveProfile()
    ]);
  };

  const businessTypes = [
    'Bar/Restaurant',
    'Boîte de Nuit',
    'Salle de Sport',
    'Centre Commercial',
    'Cinéma',
    'Salle de Concert',
    'Théâtre',
    'Autre'
  ];

  const availableFeatures = [
    { key: 'events', label: 'Gestion d\'événements', description: 'Créer et gérer vos événements' },
    { key: 'stats', label: 'Statistiques de base', description: 'Vues, likes, participants' },
    { key: 'analytics', label: 'Analytics avancées', description: 'Analyses détaillées et insights' },
    { key: 'redirections', label: 'Redirections', description: 'Liens personnalisés' },
    { key: 'ranking', label: 'Classement local', description: 'Position dans les classements' },
    { key: 'notifications', label: 'Notifications push', description: 'Alertes en temps réel' },
    { key: 'api', label: 'Accès API', description: 'Intégration avec vos systèmes' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/business')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Paramètres Business</h1>
              <p className="text-gray-600 mt-2">Gérez votre profil et vos préférences d'établissement</p>
            </div>
          </div>
          <Button onClick={handleSaveAll} className="bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="features">Fonctionnalités</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Confidentialité</TabsTrigger>
            <TabsTrigger value="billing">Facturation</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Informations de l'établissement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de l'établissement
                    </label>
                    <Input
                      value={formData.client_name}
                      onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                      placeholder="Ex: Blue Note Bar"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type d'établissement
                      </label>
                      <select
                        value={formData.client_type}
                        onChange={(e) => setFormData({ ...formData, client_type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {businessTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Localisation
                      </label>
                      <Input
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Ex: Lyon"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Palette className="h-4 w-4 inline mr-1" />
                      Couleur de marque
                    </label>
                    <div className="flex items-center space-x-3">
                      <Input
                        type="color"
                        value={formData.brand_color}
                        onChange={(e) => setFormData({ ...formData, brand_color: e.target.value })}
                        className="h-10 w-20"
                      />
                      <span className="text-sm text-gray-600">{formData.brand_color}</span>
                    </div>
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
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: formData.brand_color }}
                      >
                        {formData.client_name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{formData.client_name}</h3>
                        <p className="text-sm text-gray-600">{formData.client_type}</p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {formData.location}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p><strong>Features actives:</strong> {formData.features.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Profil */}
          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  Gérez vos informations de profil business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">Nom d'utilisateur</Label>
                    <Input
                      id="username"
                      value={profileData.username}
                      onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                      placeholder="Votre nom d'utilisateur"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      value={profileData.city}
                      onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                      placeholder="Votre ville"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bio">Biographie</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    placeholder="Décrivez votre établissement..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="website">Site web</Label>
                    <Input
                      id="website"
                      type="url"
                      value={profileData.website}
                      onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                      placeholder="https://votre-site.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Fonctionnalités disponibles</CardTitle>
                <p className="text-sm text-gray-600">Activez les fonctionnalités qui correspondent à vos besoins</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {availableFeatures.map((feature) => (
                    <div key={feature.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{feature.label}</h4>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                      <Switch
                        checked={formData.features.includes(feature.key)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({ ...formData, features: [...formData.features, feature.key] });
                          } else {
                            setFormData({ ...formData, features: formData.features.filter(f => f !== feature.key) });
                          }
                        }}
                      />
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
                  Préférences de notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Nouveaux participants</h4>
                    <p className="text-sm text-gray-600">Être notifié quand quelqu'un s'inscrit à vos événements</p>
                  </div>
                  <Switch
                    checked={notifications.newParticipants}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, newParticipants: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Rapport hebdomadaire</h4>
                    <p className="text-sm text-gray-600">Recevoir un résumé de vos performances chaque semaine</p>
                  </div>
                  <Switch
                    checked={notifications.weeklyReport}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReport: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Messages marketing</h4>
                    <p className="text-sm text-gray-600">Recevoir des conseils et actualités Wouli</p>
                  </div>
                  <Switch
                    checked={notifications.marketing}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, marketing: checked })}
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
                  Paramètres de confidentialité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Profil public</h4>
                    <p className="text-sm text-gray-600">Permettre aux utilisateurs de voir votre profil</p>
                  </div>
                  <Switch
                    checked={privacy.publicProfile}
                    onCheckedChange={(checked) => setPrivacy({ ...privacy, publicProfile: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Afficher les statistiques</h4>
                    <p className="text-sm text-gray-600">Rendre vos stats visibles publiquement</p>
                  </div>
                  <Switch
                    checked={privacy.showStats}
                    onCheckedChange={(checked) => setPrivacy({ ...privacy, showStats: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Facturation et abonnement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold text-blue-900">Plan Actuel: Gratuit</h3>
                  <p className="text-sm text-blue-800 mt-1">Accès aux fonctionnalités de base</p>
                </div>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Plan Pro</h4>
                    <p className="text-sm text-gray-600">Analytics avancées, support prioritaire</p>
                    <p className="font-semibold mt-2">29€/mois</p>
                    <Button className="mt-2" variant="outline">Passer au Pro</Button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Plan Enterprise</h4>
                    <p className="text-sm text-gray-600">Fonctionnalités avancées, API illimitée</p>
                    <p className="font-semibold mt-2">Sur devis</p>
                    <Button className="mt-2" variant="outline">Nous contacter</Button>
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

export default BusinessProfileSettings;
