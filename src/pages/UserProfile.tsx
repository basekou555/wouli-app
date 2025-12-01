import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, Settings, MapPin, Calendar, Heart, Camera, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserHistory } from '@/hooks/useUserHistory';
import { PageSkeleton } from '@/components/LoadingSkeleton';
import MenuDrawer from '@/components/MenuDrawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { UnifiedEvent } from '@/types/unified';

const UserProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useUserProfile();
  const { 
    likedEvents, 
    participatingEvents, 
    loading: historyLoading,
    removeLikedEvent,
    removeParticipation
  } = useUserHistory();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const loading = profileLoading || historyLoading;

  if (loading || !user) {
    return <PageSkeleton />;
  }

  const memoriesCount = 0; // TODO: Implement memories count

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header style App */}
      <header className="flex-shrink-0 h-14 px-4 flex items-center justify-between bg-card border-b border-border">
        <button
          onClick={() => setIsMenuOpen(true)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-accent transition-colors"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <span className="font-bold text-lg tracking-wide">WOULI</span>
        
        <button
          onClick={() => navigate('/user-settings')}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-accent transition-colors"
          aria-label="Paramètres"
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Section Profil avec Gradient */}
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 px-4 py-6">
        <div className="max-w-md mx-auto">
          {/* Avatar + Username */}
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-white text-purple-600 text-2xl font-bold">
                {profile?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-white">
              <h1 className="text-2xl font-bold">
                {profile?.username || user.email?.split('@')[0] || 'Utilisateur'}
              </h1>
              <p className="text-white/80 text-sm flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {profile?.city || 'Lyon, France'}
              </p>
              {profile?.bio && (
                <p className="text-white/90 text-sm mt-1 line-clamp-2">{profile.bio}</p>
              )}
            </div>
          </div>
          
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{likedEvents.length}</p>
              <p className="text-xs text-white/80">Favoris</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{participatingEvents.length}</p>
              <p className="text-xs text-white/80">Participations</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{memoriesCount}</p>
              <p className="text-xs text-white/80">Souvenirs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="favorites" className="w-full flex-1 flex flex-col">
        {/* Tabs navigation - sticky */}
        <div className="sticky top-14 z-30 bg-background px-4 py-3 border-b border-border">
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-3 bg-accent rounded-full p-1">
            <TabsTrigger 
              value="favorites" 
              className="rounded-full text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              ❤️ Favoris
            </TabsTrigger>
            <TabsTrigger 
              value="participations" 
              className="rounded-full text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              ✓ Participations
            </TabsTrigger>
            <TabsTrigger 
              value="memories" 
              className="rounded-full text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              📸 Souvenirs
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Content */}
        <TabsContent value="favorites" className="flex-1 mt-0">
          <EventsList 
            events={likedEvents} 
            onRemove={removeLikedEvent} 
            emptyIcon={<Heart className="w-6 h-6 text-muted-foreground" />} 
            emptyText="Aucun favori" 
          />
        </TabsContent>
        
        <TabsContent value="participations" className="flex-1 mt-0">
          <EventsList 
            events={participatingEvents} 
            onRemove={removeParticipation} 
            emptyIcon={<Calendar className="w-6 h-6 text-muted-foreground" />} 
            emptyText="Aucune participation" 
          />
        </TabsContent>
        
        <TabsContent value="memories" className="flex-1 mt-0">
          <MemoriesGrid />
        </TabsContent>
      </Tabs>

      {/* Menu Drawer */}
      <MenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  );
};

// Composant EventsList
interface EventsListProps {
  events: UnifiedEvent[];
  onRemove: (eventId: string) => void;
  emptyIcon: React.ReactNode;
  emptyText: string;
}

const EventsList: React.FC<EventsListProps> = ({ events, onRemove, emptyIcon, emptyText }) => {
  const navigate = useNavigate();

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'd MMM yyyy', { locale: fr });
    } catch {
      return date;
    }
  };

  if (events.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 px-4"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          {emptyIcon}
        </div>
        <p className="text-muted-foreground mb-4">{emptyText}</p>
        <Button 
          onClick={() => navigate('/app')}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full"
        >
          Découvrir des événements
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3 px-4 py-4">
      {events.map(event => (
        <motion.div
          key={event.id}
          whileTap={{ scale: 0.98 }}
          className="bg-card rounded-xl overflow-hidden border border-border flex gap-3 cursor-pointer"
          onClick={() => navigate(`/event/${event.id}`)}
        >
          {/* Thumbnail */}
          <img 
            src={event.image_url || '/placeholder.svg'} 
            alt={event.title}
            className="w-24 h-24 object-cover flex-shrink-0"
          />
          
          {/* Infos */}
          <div className="flex-1 py-3 pr-2 min-w-0">
            <h3 className="font-semibold text-sm line-clamp-2 text-foreground mb-1">
              {event.title}
            </h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              {formatDate(event.date)}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{event.location || event.venue}</span>
            </p>
          </div>
          
          {/* Bouton supprimer */}
          <Button 
            variant="ghost" 
            size="icon"
            className="self-center mr-2 text-muted-foreground hover:text-destructive flex-shrink-0"
            onClick={(e) => { 
              e.stopPropagation(); 
              onRemove(event.id); 
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </motion.div>
      ))}
    </div>
  );
};

// Composant MemoriesGrid (placeholder pour le moment)
const MemoriesGrid: React.FC = () => {
  const navigate = useNavigate();
  
  // TODO: Implémenter la récupération des souvenirs (événements passés avec photos)
  const memories: any[] = [];

  if (memories.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 px-4"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Camera className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground mb-2">Aucun souvenir</p>
        <p className="text-xs text-muted-foreground mb-4">
          Vos événements passés apparaîtront ici
        </p>
        <Button 
          onClick={() => navigate('/app')}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full"
        >
          Découvrir des événements
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 px-4 py-4">
      {memories.map((event) => (
        <motion.div 
          key={event.id}
          whileTap={{ scale: 0.95 }}
          className="aspect-square relative cursor-pointer overflow-hidden rounded-lg"
          onClick={() => navigate(`/event/${event.id}`)}
        >
          <img 
            src={event.image_url || '/placeholder.svg'} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 hover:bg-black/40 transition-colors" />
        </motion.div>
      ))}
    </div>
  );
};

export default UserProfile;
