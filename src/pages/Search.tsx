
import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon, MapPin, Calendar, Users, Heart, X, Filter, Building } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { categories } from '../data/mockEvents';
import { useAllEvents } from '@/hooks/useAllEvents';
import { UnifiedEvent } from '@/types/unified';
import BottomNavigation from '../components/BottomNavigation';
import { PageSkeleton } from '@/components/LoadingSkeleton';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');
  const [likedEvents, setLikedEvents] = useState<string[]>([]);
  const [participatingEvents, setParticipatingEvents] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();
  
  const { events: allEvents, loading } = useAllEvents();

  const dateFilters = [
    { id: 'all', name: 'Toutes les dates' },
    { id: 'today', name: 'Aujourd\'hui' },
    { id: 'weekend', name: 'Ce weekend' },
    { id: 'week', name: 'Cette semaine' },
    { id: 'month', name: 'Ce mois' }
  ];

  const filteredEvents = useMemo(() => {
    let filtered = allEvents;

    // Filtre par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.organizer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par catégorie
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    // Filtre par date (simplifié pour la démo)
    if (selectedDate !== 'all') {
      const today = new Date();
      
      switch (selectedDate) {
        case 'today':
          filtered = filtered.filter(event => {
            const eDate = new Date(event.date);
            return eDate.toDateString() === today.toDateString();
          });
          break;
        case 'weekend':
          // Logique simplifiée pour le weekend
          filtered = filtered.filter(event => {
            const eDate = new Date(event.date);
            const day = eDate.getDay();
            return day === 0 || day === 6; // Dimanche ou Samedi
          });
          break;
        case 'week':
          // Événements de cette semaine
          filtered = filtered.filter(event => {
            const eDate = new Date(event.date);
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            return eDate >= weekStart && eDate <= weekEnd;
          });
          break;
      }
    }

    return filtered;
  }, [allEvents, searchTerm, selectedCategory, selectedDate]);

  const handleLike = (eventId: string) => {
    if (!likedEvents.includes(eventId)) {
      setLikedEvents([...likedEvents, eventId]);
      const event = allEvents.find(e => e.id === eventId);
      toast({
        title: "❤️ Événement aimé !",
        description: `Tu as aimé "${event?.title}"`,
      });
    }
  };

  const handleParticipate = (eventId: string) => {
    if (!participatingEvents.includes(eventId)) {
      setParticipatingEvents([...participatingEvents, eventId]);
      const event = allEvents.find(e => e.id === eventId);
      toast({
        title: "🎉 Participation confirmée !",
        description: `Tu participes à "${event?.title}"`,
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedDate('all');
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

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Rechercher</h1>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Barre de recherche */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher un événement, lieu, organisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtres */}
        {showFilters && (
          <div className="space-y-3 pt-2 border-t">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Catégorie</p>
              <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <Badge
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.icon} {category.name}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Date</p>
              <div className="flex gap-2 flex-wrap">
                {dateFilters.map((filter) => (
                  <Badge
                    key={filter.id}
                    variant={selectedDate === filter.id ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedDate(filter.id)}
                  >
                    {filter.name}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">📍 Lyon, France (fixe)</p>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Effacer les filtres
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Résultats */}
      <div className="p-4">
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600">
            {filteredEvents.length} événement{filteredEvents.length !== 1 ? 's' : ''} trouvé{filteredEvents.length !== 1 ? 's' : ''}
          </p>
          {(searchTerm || selectedCategory !== 'all' || selectedDate !== 'all') && (
            <Badge variant="secondary">
              Filtres actifs
            </Badge>
          )}
        </div>

        {filteredEvents.length > 0 ? (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden">
                <div className="flex">
                  <div className="w-24 h-24 flex-shrink-0">
                    <img
                      src={event.image_url || "https://picsum.photos/200/200?random=event"}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="flex-1 p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-lg line-clamp-1">{event.title}</h3>
                        <div className="flex gap-1 ml-2">
                          <Badge variant="outline" className="text-xs">
                            {categories.find(c => c.id === event.category)?.icon}
                          </Badge>
                          {event.source === 'business' && (
                            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                              ★
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Building className="h-3 w-3 mr-1" />
                        <span className="text-xs font-medium">Proposé par {event.organizer}</span>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {event.location}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(event.date)}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {event.participants} participants
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLike(event.id)}
                            disabled={likedEvents.includes(event.id)}
                            className="h-8"
                          >
                            <Heart className="h-3 w-3 mr-1" />
                            {likedEvents.includes(event.id) ? 'Aimé' : 'J\'aime'}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleParticipate(event.id)}
                            disabled={participatingEvents.includes(event.id)}
                            className="h-8"
                          >
                            {participatingEvents.includes(event.id) ? '✅ Inscrit' : 'Participer'}
                          </Button>
                        </div>
                        {event.price_text && (
                          <Badge variant="secondary" className="text-green-600">
                            {event.price_text}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <SearchIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Aucun événement trouvé</h3>
            <p className="text-gray-500 mt-2">
              {searchTerm 
                ? `Aucun résultat pour "${searchTerm}"`
                : "Essayez de modifier vos critères de recherche"
              }
            </p>
            <Button variant="outline" onClick={clearFilters} className="mt-4">
              Afficher tous les événements
            </Button>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Search;
