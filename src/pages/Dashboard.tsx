
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { useAuth } from '../context/AuthContext';
import { fetchEvents } from '../services/eventService';
import { EventData } from '../services/eventService'; // Fixed import

// UI Components
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

// Icons
import { 
  Plus, 
  Clock3, 
  CalendarIcon, 
  MapPin, 
  Heart, 
  Users, 
  RefreshCw,
  Filter,
  ChevronDown,
  Share2
} from 'lucide-react';

// Constants
const ITEMS_PER_PAGE = 9;
const DEFAULT_EVENT_IMAGE = '/assets/images/event-placeholder.jpg';

const Dashboard = () => {
  // State management
  const [feedFilter, setFeedFilter] = useState<'all' | 'future' | 'past'>('all');
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Hooks
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Infinite scroll with intersection observer
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });

  // Format date safely with proper error handling
  const formatEventDate = useCallback((dateValue: any): string => {
    if (!dateValue) return 'Date non spécifiée';
    
    try {
      let date;
      
      if (dateValue.toDate && typeof dateValue.toDate === 'function') {
        // Firestore Timestamp
        date = dateValue.toDate();
      } else if (dateValue instanceof Date) {
        // JavaScript Date object
        date = dateValue;
      } else {
        // Try to parse from other formats
        date = new Date(dateValue);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Date invalide';
      }
      
      return date.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Date invalide';
    }
  }, []);

  // Check if event is upcoming
  const isUpcomingEvent = useCallback((dateValue: any): boolean => {
    try {
      let date;
      
      if (dateValue.toDate && typeof dateValue.toDate === 'function') {
        date = dateValue.toDate();
      } else if (dateValue instanceof Date) {
        date = dateValue;
      } else {
        date = new Date(dateValue);
      }
      
      return date > new Date();
    } catch {
      return false;
    }
  }, []);

  // Fetch events function
  const fetchEventData = useCallback(async (reset = false) => {
    if (!user) return;
    
    try {
      const currentPage = reset ? 1 : page;
      setLoading(true);
      setError(null);
      
      if (reset) {
        setEvents([]);
      }
      
      const eventsData = await fetchEvents(feedFilter, currentPage, ITEMS_PER_PAGE);
      
      if (reset) {
        setEvents(eventsData);
      } else {
        setEvents(prev => [...prev, ...eventsData]);
      }
      
      setHasMore(eventsData.length === ITEMS_PER_PAGE);
      setPage(currentPage + 1);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError("Impossible de charger les événements. Veuillez réessayer.");
      toast({
        title: "Erreur",
        description: "Impossible de charger les événements.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, [user, feedFilter, page, toast]);

  // Initial data loading effect
  useEffect(() => {
    fetchEventData(true);
  }, [feedFilter, user]);

  // Handle infinite scroll loading
  useEffect(() => {
    if (inView && !loading && hasMore && !initialLoading) {
      fetchEventData();
    }
  }, [inView, loading, hasMore, initialLoading]);

  // Pull-to-refresh functionality
  const handleRefresh = () => {
    setRefreshing(true);
    fetchEventData(true);
  };

  // Calculate grouped event statistics
  const eventStats = useMemo(() => {
    if (events.length === 0) return { upcoming: 0, past: 0, total: 0 };
    
    return events.reduce((stats, event) => {
      const isUpcoming = isUpcomingEvent(event.date);
      return {
        upcoming: stats.upcoming + (isUpcoming ? 1 : 0),
        past: stats.past + (isUpcoming ? 0 : 1),
        total: stats.total + 1
      };
    }, { upcoming: 0, past: 0, total: 0 });
  }, [events, isUpcomingEvent]);

  // Event card component
  const EventCard = useCallback(({ event }: { event: EventData }) => {
    const isUpcoming = isUpcomingEvent(event.date);
    
    return (
      <Card className="overflow-hidden border-gray-100 hover:shadow-md transition-all group">
        <CardHeader className="px-4 py-3 flex flex-row items-center justify-between border-b border-gray-50 bg-gray-50">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8 border border-gray-100">
              <AvatarImage src={event.organizerAvatar} />
              <AvatarFallback>{event.organizerName?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{event.organizerName || 'Utilisateur'}</p>
              <p className="text-xs text-gray-500 flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {event.location || 'Lieu non spécifié'}
              </p>
            </div>
          </div>
          {isUpcoming && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              À venir
            </Badge>
          )}
        </CardHeader>

        <Link to={`/events/${event.id}`} className="block relative">
          <div className="aspect-[16/9] overflow-hidden bg-gray-100">
            <img 
              src={event.image || DEFAULT_EVENT_IMAGE} 
              alt={event.title} 
              className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_EVENT_IMAGE;
              }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
            <div className="w-full p-4 text-white">
              <span className="text-sm font-medium">Voir les détails</span>
            </div>
          </div>
        </Link>

        <CardContent className="py-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 line-clamp-1">{event.title}</h3>
            </div>

            <div className="flex items-center text-gray-600">
              <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="text-sm">
                {formatEventDate(event.date)}
              </span>
            </div>
            
            {event.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {event.description}
              </p>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="py-3 px-4 border-t border-gray-50 flex justify-between items-center">
          <div className="flex space-x-4">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
              <Heart className="h-4 w-4 text-gray-500" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
              <Share2 className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1 text-gray-400" />
            <span className="text-xs text-gray-600 font-medium">
              {(event.participants?.length || 0)} participant{(event.participants?.length || 0) !== 1 ? 's' : ''}
            </span>
          </div>
        </CardFooter>
      </Card>
    );
  }, [formatEventDate, isUpcomingEvent]);

  // Skeleton loaders for events
  const EventSkeleton = () => (
    <Card className="overflow-hidden border-gray-100">
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-50 bg-gray-50">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16 mt-1" />
          </div>
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>

      <Skeleton className="aspect-[16/9] w-full" />

      <div className="p-4">
        <div className="space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
      
      <div className="px-4 py-3 border-t border-gray-50 flex justify-between">
        <div className="flex space-x-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
        <Skeleton className="h-4 w-20" />
      </div>
    </Card>
  );

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header section */}
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Accueil</h1>
              <p className="text-sm text-gray-500 mt-1">Découvrez ce qui se passe dans votre réseau</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="hidden md:flex items-center"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              
              <Link 
                to="/events/create" 
                className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity shadow-sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Créer un événement
              </Link>
            </div>
          </div>
          
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-none shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total</p>
                  <p className="text-2xl font-bold">{eventStats.total}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Filter className="h-5 w-5 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-none shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">À venir</p>
                  <p className="text-2xl font-bold">{eventStats.upcoming}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CalendarIcon className="h-5 w-5 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-none shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Passés</p>
                  <p className="text-2xl font-bold">{eventStats.past}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Clock3 className="h-5 w-5 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs filter */}
          <div className="border-b border-gray-200 bg-white sticky top-0 z-10 -mx-4 px-4 py-2 shadow-sm">
            <Tabs 
              defaultValue="all" 
              className="w-full" 
              onValueChange={value => {
                setFeedFilter(value as 'all' | 'future' | 'past');
                setPage(1);
              }}
            >
              <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
                <TabsTrigger value="all">Tous les événements</TabsTrigger>
                <TabsTrigger value="future">À venir</TabsTrigger>
                <TabsTrigger value="past">Passés</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <p className="text-xs text-center text-gray-500">Affichage de tous les événements</p>
              </TabsContent>
              <TabsContent value="future">
                <p className="text-xs text-center text-gray-500">Événements à venir uniquement</p>
              </TabsContent>
              <TabsContent value="past">
                <p className="text-xs text-center text-gray-500">Événements passés uniquement</p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center justify-between">
              <p>{error}</p>
              <Button 
                variant="outline" 
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-50" 
                onClick={() => fetchEventData(true)}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Réessayer
              </Button>
            </div>
          )}

          {/* Events grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
            
            {/* Skeleton loaders */}
            {(loading || initialLoading) && 
              Array(initialLoading ? 6 : 3).fill(0).map((_, index) => <EventSkeleton key={`skeleton-${index}`} />)
            }
            
            {/* Empty state */}
            {!loading && !initialLoading && events.length === 0 && !error && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 px-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <CalendarIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Aucun événement trouvé</h3>
                <p className="text-gray-500 text-center mt-2 max-w-md">
                  Aucun événement ne correspond à vos critères actuels. Essayez de modifier vos filtres ou créez votre propre événement.
                </p>
                <div className="mt-6 flex flex-wrap gap-3 justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => setFeedFilter('all')}
                    className="flex items-center"
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Voir tous les événements
                  </Button>
                  <Link to="/events/create">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90">
                      <Plus className="mr-2 h-4 w-4" />
                      Créer un événement
                    </Button>
                  </Link>
                </div>
              </div>
            )}
            
            {/* Load more reference element */}
            {hasMore && !loading && events.length > 0 && (
              <div ref={loadMoreRef} className="col-span-full flex justify-center py-8">
                <div className="animate-pulse flex flex-col items-center">
                  <ChevronDown className="h-6 w-6 text-gray-400" />
                  <p className="text-sm text-gray-500">Chargement d'autres événements</p>
                </div>
              </div>
            )}
          </div>

          {/* Call to action */}
          <Link to="/events/create" className="block">
            <Card className="border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-8 transition-colors hover:from-purple-50 hover:to-pink-50 group">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center mb-4 shadow-md group-hover:shadow-lg transition-shadow">
                <Plus className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Créer un nouvel événement</h3>
              <p className="text-center text-gray-600 text-sm max-w-md">
                Partagez vos passions, organisez des sorties et connectez-vous avec d'autres personnes. Quelques clics suffisent pour commencer.
              </p>
              <Button className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90">
                Commencer maintenant
              </Button>
            </Card>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
