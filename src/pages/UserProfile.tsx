import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Settings, MapPin, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserHistory } from '@/hooks/useUserHistory';
import { useFriendships } from '@/hooks/useFriendships';
import { useProfileStats } from '@/hooks/useProfileStats';
import { useMemories } from '@/hooks/useMemories';
import { useEventViews } from '@/hooks/useEventViews';
import { useProfile } from '@/hooks/useProfile';
import { PageSkeleton } from '@/components/LoadingSkeleton';
import MenuDrawer from '@/components/MenuDrawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { FavoritesTab } from '@/components/profile/FavoritesTab';
import { ParticipationsTab } from '@/components/profile/ParticipationsTab';
import { MemoriesTab } from '@/components/profile/MemoriesTab';
import { HistoryTab } from '@/components/profile/HistoryTab';

const UserProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useProfile();
  const { stats, loading: statsLoading, refetch: refetchStats } = useProfileStats();
  const { 
    likedEvents, 
    participatingEvents, 
    loading: historyLoading,
    removeLikedEvent,
    removeParticipation
  } = useUserHistory();
  const { 
    acceptedFriends, 
    pendingCount, 
    loading: friendsLoading 
  } = useFriendships();
  const {
    memories,
    memoriesWithPhotos,
    memoriesWithoutPhotos,
    loading: memoriesLoading,
    saveMemory,
    uploadMemoryPhoto,
    refetch: refetchMemories
  } = useMemories();
  const {
    groupedViews,
    loading: viewsLoading
  } = useEventViews();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const loading = profileLoading || historyLoading || friendsLoading || statsLoading;

  if (loading || !user) {
    return <PageSkeleton />;
  }

  const handleRemoveLike = async (eventId: string) => {
    await removeLikedEvent(eventId);
    refetchStats();
  };

  const handleRemoveParticipation = async (eventId: string) => {
    await removeParticipation(eventId);
    refetchStats();
  };

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
          
          {/* Stats Row - 4 colonnes */}
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{stats.favoritesCount}</p>
              <p className="text-xs text-white/80">Favoris</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{stats.participationsCount}</p>
              <p className="text-xs text-white/80">Participations</p>
            </div>
            <div 
              className="text-center cursor-pointer relative" 
              onClick={() => navigate('/friends')}
            >
              <p className="text-2xl font-bold text-white">{acceptedFriends.length}</p>
              <p className="text-xs text-white/80">Amis</p>
              {pendingCount > 0 && (
                <span className="absolute -top-1 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {pendingCount}
                </span>
              )}
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{stats.memoriesCount}</p>
              <p className="text-xs text-white/80">Souvenirs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs - 4 onglets */}
      <Tabs defaultValue="favorites" className="w-full flex-1 flex flex-col">
        {/* Tabs navigation - sticky */}
        <div className="sticky top-14 z-30 bg-background px-4 py-3 border-b border-border">
          <TabsList className="w-full max-w-lg mx-auto grid grid-cols-4 bg-accent rounded-full p-1">
            <TabsTrigger 
              value="favorites" 
              className="rounded-full text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white px-2"
            >
              ❤️ Favoris
            </TabsTrigger>
            <TabsTrigger 
              value="participations" 
              className="rounded-full text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white px-2"
            >
              ✓ Participe
            </TabsTrigger>
            <TabsTrigger 
              value="memories" 
              className="rounded-full text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white px-2"
            >
              📸 Souvenirs
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="rounded-full text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white px-2"
            >
              👁️ Vus
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Content */}
        <TabsContent value="favorites" className="flex-1 mt-0">
          <FavoritesTab 
            events={likedEvents}
            onRemove={handleRemoveLike}
            loading={historyLoading}
          />
        </TabsContent>
        
        <TabsContent value="participations" className="flex-1 mt-0">
          <ParticipationsTab 
            events={participatingEvents}
            onRemove={handleRemoveParticipation}
            loading={historyLoading}
          />
        </TabsContent>
        
        <TabsContent value="memories" className="flex-1 mt-0">
          <MemoriesTab 
            memories={memories}
            memoriesWithPhotos={memoriesWithPhotos}
            memoriesWithoutPhotos={memoriesWithoutPhotos}
            loading={memoriesLoading}
            onSaveMemory={saveMemory}
            onUploadPhoto={uploadMemoryPhoto}
            onRefetch={() => {
              refetchMemories();
              refetchStats();
            }}
          />
        </TabsContent>
        
        <TabsContent value="history" className="flex-1 mt-0">
          <HistoryTab 
            groupedViews={groupedViews}
            loading={viewsLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Menu Drawer */}
      <MenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  );
};

export default UserProfile;
