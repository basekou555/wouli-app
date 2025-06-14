
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Heart, X, MapPin, Calendar, Users, Filter, ArrowLeft, Clock, Tag, Euro, Building } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { categories } from '../data/mockEvents';
import { UnifiedEvent } from '@/types/unified';
import { useAllEvents } from '@/hooks/useAllEvents';
import BottomNavigation from '../components/BottomNavigation';
import { PageSkeleton } from '@/components/LoadingSkeleton';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const UserApp = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [likedEvents, setLikedEvents] = useState<string[]>([]);
  const [participatingEvents, setParticipatingEvents] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<UnifiedEvent | null>(null);
  const { toast } = useToast();
  
  const { events: allEvents, loading, incrementViews, likeEvent, participateEvent } = useAllEvents();

  // Filter events based on selected category
  const filteredEvents = selectedCategory === 'all' 
    ? allEvents 
    : allEvents.filter(event => event.category === selectedCategory);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentIndex(0);
    setShowFilters(false);
  };

  const handleLike = async () => {
    const event = filteredEvents[currentIndex];
    if (event && !likedEvents.includes(event.id)) {
      setLikedEvents([...likedEvents, event.id]);
      // Note: In a real app, you'd get the user ID from auth context
      // await likeEvent(event.id, userId);
      toast({
        title: "❤️ Événement aimé !",
        description: `Tu as aimé "${event.title}"`,
      });
    }
    nextCard();
  };

  const handleParticipate = async () => {
    const event = filteredEvents[currentIndex];
    if (event && !participatingEvents.includes(event.id)) {
      setParticipatingEvents([...participatingEvents, event.id]);
      // Note: In a real app, you'd get the user ID from auth context
      // await participateEvent(event.id, userId);
      toast({
        title: "🎉 Participation confirmée !",
        description: `Tu participes à "${event.title}"`,
      });
    }
    nextCard();
  };

  const handlePass = () => {
    nextCard();
  };

  const nextCard = () => {
    if (currentIndex < filteredEvents.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      toast({
        title: "C'est tout !",
        description: "Plus d'événements à découvrir pour le moment",
      });
      setCurrentIndex(0);
    }
  };

  const currentEvent = filteredEvents[currentIndex];

  if (loading) {
    return <PageSkeleton />;
  }

  if (selectedEvent) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-white shadow-sm p-4 flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSelectedEvent(null)}
            className="mr-3"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-gradient">Détails de l'événement</h1>
        </div>

        {/* Event Details */}
        <div className="p-4">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Image */}
            <div className="relative h-64">
              <img
                src={selectedEvent.image_url || "https://picsum.photos/400/200?random=event"}
                alt={selectedEvent.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4">
                <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                  {categories.find(c => c.id === selectedEvent.category)?.icon} {categories.find(c => c.id === selectedEvent.category)?.name}
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700 inline-flex items-center">
                  <Building className="h-4 w-4 mr-1" />
                  Proposé par {selectedEvent.organizer}
                  {selectedEvent.source === 'business' && (
                    <span className="ml-2 bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs">
                      Établissement
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <h1 className="text-2xl font-bold text-gray-900">{selectedEvent.title}</h1>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 text-purple-500" />
                  <span className="text-sm">{selectedEvent.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                  <span className="text-sm">{formatDate(selectedEvent.date)}</span>
                </div>
                {selectedEvent.time && (
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2 text-purple-500" />
                    <span className="text-sm">{selectedEvent.time}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-2 text-purple-500" />
                  <span className="text-sm">{selectedEvent.participants} participants</span>
                </div>
              </div>

              {selectedEvent.price_text && (
                <div className="flex items-center text-gray-600">
                  <Euro className="h-4 w-4 mr-2 text-green-500" />
                  <span className="text-sm font-medium">{selectedEvent.price_text}</span>
                </div>
              )}

              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{selectedEvent.description}</p>
              </div>

              {selectedEvent.tags && selectedEvent.tags.length > 0 && (
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

              <div className="border-t pt-4">
                <p className="text-xs text-gray-500">Organisé par {selectedEvent.organizer}</p>
                {selectedEvent.max_participants && (
                  <p className="text-xs text-gray-500">Places limitées à {selectedEvent.max_participants} personnes</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 pt-0 space-y-3">
              <Button 
                className="w-full h-12"
                onClick={() => {
                  const eventId = selectedEvent.id;
                  if (!participatingEvents.includes(eventId)) {
                    setParticipatingEvents([...participatingEvents, eventId]);
                    toast({
                      title: "🎉 Participation confirmée !",
                      description: `Tu participes à "${selectedEvent.title}"`,
                    });
                  }
                }}
                disabled={participatingEvents.includes(selectedEvent.id)}
              >
                {participatingEvents.includes(selectedEvent.id) ? '✅ Tu participes déjà' : '🗓️ Participer'}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full h-12"
                onClick={() => {
                  const eventId = selectedEvent.id;
                  if (!likedEvents.includes(eventId)) {
                    setLikedEvents([...likedEvents, eventId]);
                    toast({
                      title: "❤️ Événement sauvegardé !",
                      description: `"${selectedEvent.title}" ajouté à tes favoris`,
                    });
                  }
                }}
                disabled={likedEvents.includes(selectedEvent.id)}
              >
                {likedEvents.includes(selectedEvent.id) ? '❤️ Déjà dans tes favoris' : '❤️ Sauvegarder'}
              </Button>
            </div>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gradient">Wouli</h1>
            <p className="text-gray-600 text-sm">Découvre des événements près de toi</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="h-4 w-4" />
            {selectedCategory !== 'all' && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full"></div>
            )}
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border-b p-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange(category.id)}
                className="whitespace-nowrap"
              >
                {category.icon} {category.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Card Container */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {currentEvent ? (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Image */}
              <div className="relative h-96">
                <img
                  src={currentEvent.image_url || "https://picsum.photos/400/200?random=event"}
                  alt={currentEvent.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute top-4 right-4">
                  <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                    {categories.find(c => c.id === currentEvent.category)?.icon}
                  </span>
                </div>
                <div className="absolute top-4 left-4">
                  <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700 flex items-center">
                    <Building className="h-3 w-3 mr-1" />
                    {currentEvent.organizer}
                    {currentEvent.source === 'business' && (
                      <span className="ml-1 text-orange-600">★</span>
                    )}
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h2 className="text-2xl font-bold mb-2">{currentEvent.title}</h2>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      {currentEvent.location}
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(currentEvent.date)}
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-2" />
                      {currentEvent.participants} participants
                    </div>
                    {currentEvent.price_text && (
                      <div className="flex items-center text-sm">
                        <Euro className="h-4 w-4 mr-2" />
                        {currentEvent.price_text}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="p-4">
                <p className="text-gray-600 text-sm line-clamp-2">{currentEvent.description}</p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-purple-500 text-sm"
                  onClick={() => setSelectedEvent(currentEvent)}
                >
                  Voir les détails →
                </Button>
              </div>

              {/* Actions */}
              <div className="flex justify-center space-x-3 p-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-14 w-14 rounded-full border-2 border-red-400 text-red-500 hover:bg-red-50"
                  onClick={handlePass}
                >
                  <X className="h-6 w-6" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-14 w-14 rounded-full border-2 border-purple-400 text-purple-500 hover:bg-purple-50"
                  onClick={() => setSelectedEvent(currentEvent)}
                >
                  <Tag className="h-6 w-6" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-14 w-14 rounded-full border-2 border-blue-400 text-blue-500 hover:bg-blue-50"
                  onClick={handleParticipate}
                >
                  <Calendar className="h-6 w-6" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-14 w-14 rounded-full border-2 border-green-400 text-green-500 hover:bg-green-50"
                  onClick={handleLike}
                >
                  <Heart className="h-6 w-6" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center p-8">
              <p className="text-gray-500">Aucun événement disponible dans cette catégorie</p>
              <Button 
                variant="outline" 
                onClick={() => handleCategoryChange('all')}
                className="mt-4"
              >
                Voir tous les événements
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white p-4 text-center text-sm text-gray-500 space-y-1">
        <p>Événement {currentIndex + 1} sur {filteredEvents.length}</p>
        <p>{likedEvents.length} favoris • {participatingEvents.length} participations</p>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default UserApp;
