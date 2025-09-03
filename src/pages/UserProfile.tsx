import React, { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, Heart, Star, Edit3, TrendingUp, Activity, Award, LogOut, Clock, X, Trash2 } from 'lucide-react';
import FriendButton from '../components/FriendButton';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useUserHistory } from '../hooks/useUserHistory';
import { UserMemories } from '../components/memories/UserMemories';
import { PageSkeleton } from '../components/LoadingSkeleton';
import { UnifiedEvent } from '@/types/unified';

const UserProfile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { profile, userStats, recentActivities, loading } = useUserProfile();
  const { likedEvents, participatingEvents, loading: historyLoading, removeLikedEvent, removeParticipation } = useUserHistory();

  // Rediriger vers l'authentification si pas connecté
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const EventCard = ({ event, onRemove, removeText, removeIcon }: {
    event: UnifiedEvent;
    onRemove: (eventId: string) => void;
    removeText: string;
    removeIcon: React.ReactNode;
  }) => (
    <Card className="overflow-hidden">
      <div className="relative h-32">
        <img
          src={event.image_url || `https://picsum.photos/400/200?random=${event.id}`}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={() => onRemove(event.id)}
        >
          {removeIcon}
        </Button>
      </div>
      <CardContent className="p-3">
        <h4 className="font-semibold text-sm mb-2 truncate">{event.title}</h4>
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {formatDate(event.date)}
          </div>
          <div className="flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const favoriteCategories = [
    { name: 'Concerts', count: 8, icon: '🎵' },
    { name: 'Restaurants', count: 6, icon: '🍽️' },
    { name: 'Bars', count: 4, icon: '🍺' },
    { name: 'Sport', count: 2, icon: '⚽' }
  ];

  if (loading || !user) {
    return <PageSkeleton />;
  }

  return (
    <AppLayout>
      <div className="py-6 space-y-6">
        {/* Header profil */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {profile?.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile?.username || user.email?.split('@')[0] || 'Utilisateur'}
                </h1>
                <p className="text-gray-500">Membre depuis {new Date(user.created_at).toLocaleDateString('fr-FR', {
                  month: 'long',
                  year: 'numeric'
                })}</p>
                <Badge variant="secondary" className="mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {profile?.city || 'Lyon, France'}
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
              <Link to="/friends">
                <Button variant="outline" size="sm" className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Mes amis
                </Button>
              </Link>
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
              <div className="text-2xl font-bold text-gray-900">{userStats.eventsCreated}</div>
              <p className="text-sm text-gray-500">Créés</p>
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="activity" className="flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Activité
            </TabsTrigger>
            <TabsTrigger value="historique" className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Historique
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
                  {recentActivities.length > 0 ? (
                    recentActivities.map(activity => (
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
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Aucune activité récente</p>
                      <p className="text-sm">Découvrez des événements pour voir votre activité ici !</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historique" className="mt-6">
            <Tabs defaultValue="liked" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="liked" className="flex items-center">
                  <Heart className="h-4 w-4 mr-2" />
                  Favoris ({likedEvents.length})
                </TabsTrigger>
                <TabsTrigger value="participating" className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Participations ({participatingEvents.length})
                </TabsTrigger>
                <TabsTrigger value="memories" className="flex items-center">
                  <Star className="h-4 w-4 mr-2" />
                  Memories
                </TabsTrigger>
              </TabsList>

              <TabsContent value="liked" className="mt-4">
                {historyLoading ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-40 bg-gray-200 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : likedEvents.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {likedEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onRemove={removeLikedEvent}
                        removeText="Retirer"
                        removeIcon={<X className="h-3 w-3" />}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Aucun favori</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="participating" className="mt-4">
                {historyLoading ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-40 bg-gray-200 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : participatingEvents.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {participatingEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onRemove={removeParticipation}
                        removeText="Annuler"
                        removeIcon={<Trash2 className="h-3 w-3" />}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Aucune participation</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="memories" className="mt-4">
                <UserMemories />
              </TabsContent>
            </Tabs>
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
  );
};

export default UserProfile;
