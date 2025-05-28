
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Heart, X, MapPin, Calendar, Users } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

// Données d'exemple pour les événements
const mockEvents = [
  {
    id: 1,
    title: "Soirée Jazz au Blue Note",
    venue: "Blue Note Bar",
    date: "Vendredi 15 Mars, 21h",
    participants: 45,
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop",
    description: "Une soirée jazz intimiste avec des musiciens locaux"
  },
  {
    id: 2,
    title: "Tournoi de Ping-Pong",
    venue: "Café des Sports",
    date: "Samedi 16 Mars, 14h",
    participants: 12,
    image: "https://images.unsplash.com/photo-1534158914592-062992fbe900?w=400&h=600&fit=crop",
    description: "Compétition amicale avec prix à gagner"
  },
  {
    id: 3,
    title: "Dégustation de Vins",
    venue: "Le Petit Bouchon",
    date: "Dimanche 17 Mars, 18h",
    participants: 8,
    image: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&h=600&fit=crop",
    description: "Découverte de vins régionaux avec un sommelier"
  }
];

const UserApp = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { toast } = useToast();

  const handleLike = () => {
    toast({
      title: "Événement aimé !",
      description: `Tu as aimé "${mockEvents[currentIndex]?.title}"`,
    });
    nextCard();
  };

  const handlePass = () => {
    nextCard();
  };

  const nextCard = () => {
    if (currentIndex < mockEvents.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      toast({
        title: "C'est tout !",
        description: "Plus d'événements à découvrir pour le moment",
      });
      setCurrentIndex(0);
    }
  };

  const currentEvent = mockEvents[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <h1 className="text-2xl font-bold text-center text-gradient">Wouli</h1>
        <p className="text-center text-gray-600 mt-1">Découvre des événements près de toi</p>
      </div>

      {/* Card Container */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {currentEvent ? (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Image */}
              <div className="relative h-96">
                <img
                  src={currentEvent.image}
                  alt={currentEvent.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h2 className="text-2xl font-bold mb-2">{currentEvent.title}</h2>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      {currentEvent.venue}
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      {currentEvent.date}
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-2" />
                      {currentEvent.participants} participants
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="p-4">
                <p className="text-gray-600">{currentEvent.description}</p>
              </div>

              {/* Actions */}
              <div className="flex justify-center space-x-4 p-4">
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
                  className="h-14 w-14 rounded-full border-2 border-green-400 text-green-500 hover:bg-green-50"
                  onClick={handleLike}
                >
                  <Heart className="h-6 w-6" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center p-8">
              <p className="text-gray-500">Aucun événement disponible</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white p-4 text-center text-sm text-gray-500">
        Événement {currentIndex + 1} sur {mockEvents.length}
      </div>
    </div>
  );
};

export default UserApp;
