
import React, { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Heart, 
  Star, 
  Edit3, 
  Settings, 
  TrendingUp,
  Activity,
  Award,
  LogOut
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Link, useNavigate } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const UserProfile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [userStats, setUserStats] = useState({
    eventsParticipated: 0,
    eventsLiked: 0,
    friendsMet: 0,
    weeklyActivity: 0
  });

  const [recentActivities] = useState([
    {
      id: '1',
      type: 'participation',
      event: 'Concert Jazz au Sunset',
      date: '2024-06-15',
      venue: 'Sunset Jazz Club'
    },
    {
      id: '2',
      type: 'like',
      event: 'Atelier Cuisine Italienne',
      date: '2024-06-14',
      venue: 'École de Cuisine'
    },
    {
      id: '3',
      type: 'participation',
      event: 'Afterwork Startup',
      date: '2024-06-10',
      venue: 'La Défense'
    }
  ]);

  const [favoriteCategories] = useState([
    { name: 'Concerts', count: 8, icon: '🎵' },
    { name: 'Restaurants', count: 6, icon: '🍽️' },
    { name: 'Bars', count: 4, icon: '🍺' },
    { name: 'Sport', count: 2, icon: '⚽' }
  ]);

  // Rediriger vers l'authentification si pas connecté
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Charger les statistiques de l'utilisateur
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;

      try {
        // Récupérer le nombre d'événements likés
        const { count: likesCount } = await supabase
          .from('event_likes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Récupérer le nombre d'événements auxquels l'utilisateur participe
        const { count: participationsCount } = await supabase
          .from('event_participants')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        setUserStats({
          eventsParticipated: participationsCount || 0,
          eventsLiked: likesCount || 0,
          friendsMet: 45, // Mock data pour le moment
          weeklyActivity: 3 // Mock data pour le moment
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };

    fetchUserStats();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'participation':
        return <Calendar className="h-4 w-4 text-green-600" />;
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getActivityText = (activity: any) => {
    switch (activity.type) {
      case 'participation':
        return `Tu as participé à "${activity.event}"`;
      case 'like':
        return `Tu as aimé "${activity.event}"`;
      default:
        return `Activité sur "${activity.event}"`;
    }
  };

  if (!user) {
    return null; // ou un loader
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <AppLayout>
        <div className="py-6 space-y-6">
          {/* Header profil */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.user_metadata?.username || user.email?.split('@')[0] || 'Utilisateur'}
                  </h1>
                  <p className="text-gray-500">Membre depuis {new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
                  <Badge variant="secondary" className="mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    Lyon, France
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Button variant="outline" size="sm">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{userStats.eventsParticipated}</div>
                <p className="text-sm text-gray-500">Événements</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Heart className="h-5 w-5 text-red-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{userStats.eventsLiked}</div>
                <p className="text-sm text-gray-500">Favoris</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{userStats.friendsMet}</div>
                <p className="text-sm text-gray-500">Rencontres</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{userStats.weeklyActivity}</div>
                <p className="text-sm text-gray-500">Cette semaine</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="activity" className="flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                Activité
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center">
                <Star className="h-4 w-4 mr-2" />
                Préférences
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center">
                <Award className="h-4 w-4 mr-2" />
                Badges
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Activité récente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {getActivityText(activity)}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {activity.venue} • {new Date(activity.date).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <Link to="/historique">
                      <Button variant="outline" size="sm">
                        Voir l'historique complet
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Catégories préférées</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {favoriteCategories.map((category, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{category.icon}</span>
                          <span className="font-medium text-gray-900">{category.name}</span>
                        </div>
                        <Badge variant="secondary">{category.count} événements</Badge>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      💡 Nous personnalisons vos recommandations selon vos préférences !
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Vos badges</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <Award className="h-8 w-8 text-yellow-600 mb-2" />
                      <span className="font-medium text-yellow-800">Explorateur</span>
                      <span className="text-xs text-yellow-600">10+ événements</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <Star className="h-8 w-8 text-purple-600 mb-2" />
                      <span className="font-medium text-purple-800">Sociable</span>
                      <span className="text-xs text-purple-600">25+ rencontres</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg border border-green-200">
                      <Heart className="h-8 w-8 text-green-600 mb-2" />
                      <span className="font-medium text-green-800">Passionné</span>
                      <span className="text-xs text-green-600">20+ favoris</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg border border-gray-300 opacity-60">
                      <TrendingUp className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="font-medium text-gray-500">Influenceur</span>
                      <span className="text-xs text-gray-400">50+ événements</span>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      🏆 Participez à plus d'événements pour débloquer de nouveaux badges !
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AppLayout>
      <BottomNavigation />
    </div>
  );
};

export default UserProfile;
