
import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Heart, Calendar, MapPin, Users, Tag, Euro, Search as SearchIcon, Filter, X } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { mockEvents, categories, Event } from '../data/mockEvents';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');
  const [likedEvents, setLikedEvents] = useState<string[]>([]);
  const [participatingEvents, setParticipatingEvents] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { toast } = useToast();

  // Options de filtrage par date
  const dateFilters = [
    { id: 'all', label: 'Toutes les dates' },
    { id: 'today', label: 'Aujourd\'hui' },
    { id: 'weekend', label: 'Ce week-end' },
    { id: 'week', label: 'Cette semaine' },
    { id: 'next-week', label: 'Semaine prochaine' }
  ];

  // Fonction de filtrage en temps réel
  const filteredEvents = useMemo(() => {
    return mockEvents.filter(event => {
      // Filtre par mots-clés
      const matchesSearch = searchTerm === '' || 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtre par catégorie
      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;

      // Filtre par date (simplifié pour la démo)
      const matchesDate = selectedDate === 'all' || true; // Pour l'instant, tous les événements

      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [searchTerm, selectedCategory, selectedDate]);

  const handleLike = (eventId: string) => {
    if (!likedEvents.includes(eventId)) {
      setLikedEvents([...likedEvents, eventId]);
      const event = mockEvents.find(e => e.id === eventId);
      toast({
        title: "❤️ Événement aimé !",
        description: `Tu as aimé "${event?.title}"`,
      });
    }
  };

  const handleParticipate = (eventId: string) => {
    if (!participatingEvents.includes(eventId)) {
      setParticipatingEvents([...participatingEvents, eventId]);
      const event = mockEvents.find(e => e.id === eventId);
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

  const hasActiveFilters = searchTerm || selectedCategory !== 'all' || selectedDate !== 'all';

  if (selectedEvent) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header détails */}
        <div className="bg-white shadow-sm p-4 flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSelectedEvent(null)}
            className="mr-3"
          >
            <X className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Détails de l'événement</h1>
        </div>

        {/* Contenu détails (réutilisation de la logique existante) */}
        <div className="p-4">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="relative h-64">
              <img
                src={selectedEvent.image}
                alt={selectedEvent.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4">
                <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                  {categories.find(c => c.id === selectedEvent.category)?.icon} {categories.find(c => c.id === selectedEvent.category)?.name}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <h1 className="text-2xl font-bold text-gray-900">{selectedEvent.title}</h1>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 text-purple-500" />
                  <span className="text-sm">{selectedEvent.venue}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                  <span className="text-sm">{new Date(selectedEvent.date).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-2 text-purple-500" />
                  <span className="text-sm">{selectedEvent.participants} participants</span>
                </div>
                {selectedEvent.price && (
                  <div className="flex items-center text-gray-600">
                    <Euro className="h-4 w-4 mr-2 text-green-500" />
                    <span className="text-sm font-medium">{selectedEvent.price}</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{selectedEvent.description}</p>
              </div>

              {selectedEvent.tags.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.tags.map((tag, index) => (
                      <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 pt-0 space-y-3">
              <Button 
                className="w-full h-12"
                onClick={() => handleParticipate(selectedEvent.id)}
                disabled={participatingEvents.includes(selectedEvent.id)}
              >
                {participatingEvents.includes(selectedEvent.id) ? '✅ Tu participes déjà' : '🗓️ Participer'}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full h-12"
                onClick={() => handleLike(selectedEvent.id)}
                disabled={likedEvents.includes(selectedEvent.id)}
              >
                {likedEvents.includes(selectedEvent.id) ? '❤️ Déjà dans tes favoris' : '❤️ Sauvegarder'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <h1 className="text-2xl font-bold text-purple-600 mb-2">🔍 Rechercher</h1>
        <p className="text-gray-600 text-sm">Trouve l'événement parfait pour toi</p>
      </div>

      {/* Filtres de recherche */}
      <div className="bg-white border-b p-4 space-y-4">
        {/* Barre de recherche */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par titre, description ou lieu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtres */}
        <div className="grid grid-cols-2 gap-3">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {categories.slice(1).map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger>
              <SelectValue placeholder="Quand ?" />
            </SelectTrigger>
            <SelectContent>
              {dateFilters.map((filter) => (
                <SelectItem key={filter.id} value={filter.id}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ville fixe */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Lyon</span>
            <Badge variant="secondary" className="ml-2 text-xs">Ville fixe</Badge>
          </div>
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4 mr-1" />
              Effacer
            </Button>
          )}
        </div>
      </div>

      {/* Résultats */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-600 text-sm">
            {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''} trouvé{filteredEvents.length > 1 ? 's' : ''}
          </p>
          {hasActiveFilters && (
            <div className="flex items-center text-xs text-purple-600">
              <Filter className="h-3 w-3 mr-1" />
              Filtres actifs
            </div>
          )}
        </div>

        {filteredEvents.length > 0 ? (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="relative h-48">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute top-3 right-3">
                    <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                      {categories.find(c => c.id === event.category)?.icon}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="text-lg font-bold mb-1">{event.title}</h3>
                    <div className="flex items-center text-sm mb-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {event.venue}
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(event.date).toLocaleDateString('fr-FR')} à {event.time}
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">{event.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-1" />
                      {event.participants} participants
                      {event.price && (
                        <>
                          <span className="mx-2">•</span>
                          <Euro className="h-4 w-4 mr-1" />
                          {event.price}
                        </>
                      )}
                    </div>
                    
                    <Button 
                      variant="link" 
                      size="sm"
                      onClick={() => setSelectedEvent(event)}
                      className="text-purple-600 p-0 h-auto"
                    >
                      Détails →
                    </Button>
                  </div>

                  <div className="flex justify-center space-x-3 mt-4 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-green-400 text-green-600 hover:bg-green-50"
                      onClick={() => handleLike(event.id)}
                      disabled={likedEvents.includes(event.id)}
                    >
                      <Heart className="h-4 w-4 mr-1" />
                      {likedEvents.includes(event.id) ? 'Aimé' : 'Aimer'}
                    </Button>
                    
                    <Button
                      className="flex-1"
                      onClick={() => handleParticipate(event.id)}
                      disabled={participatingEvents.includes(event.id)}
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      {participatingEvents.includes(event.id) ? 'Inscrit' : 'Participer'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <SearchIcon className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun événement trouvé</h3>
            <p className="text-gray-500 mb-4">
              Essayez de modifier vos critères de recherche
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
              >
                Effacer tous les filtres
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
