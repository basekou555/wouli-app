import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  UserPlus, 
  Search, 
  Clock, 
  Check, 
  X, 
  MapPin,
  UserMinus,
  Send
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFriendships } from '@/hooks/useFriendships';
import { useDebounce } from '@/hooks/useDebounce';

const Friends = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);
  
  const {
    friends,
    incomingRequests,
    outgoingRequests,
    loading,
    searchResults,
    searchLoading,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    unfriend
  } = useFriendships();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    searchUsers(debouncedSearch);
  }, [debouncedSearch, searchUsers]);

  const UserCard = ({ 
    profile, 
    buttonText, 
    buttonIcon, 
    onAction, 
    variant = "default",
    disabled = false,
    showLocation = true 
  }: {
    profile: any;
    buttonText: string;
    buttonIcon: React.ReactNode;
    onAction: () => void;
    variant?: "default" | "destructive" | "outline" | "secondary";
    disabled?: boolean;
    showLocation?: boolean;
  }) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-sm transition-shadow">
      <div className="flex items-center space-x-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={profile.avatar_url} alt={profile.username} />
          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
            {profile.username?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-gray-900">{profile.username}</p>
          {showLocation && profile.city && (
            <div className="flex items-center text-sm text-gray-500 mt-0.5">
              <MapPin className="h-3 w-3 mr-1" />
              {profile.city}
            </div>
          )}
        </div>
      </div>
      <Button
        variant={variant}
        size="sm"
        onClick={onAction}
        disabled={disabled}
        className="flex items-center space-x-1"
      >
        {buttonIcon}
        <span className="hidden sm:inline">{buttonText}</span>
      </Button>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 bg-white rounded-lg border">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div>
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-9 w-20" />
        </div>
      ))}
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <AppLayout>
        <div className="py-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes Amis</h1>
            <p className="text-gray-500">Gérez vos connexions et découvrez de nouveaux amis</p>
          </div>

          {/* Recherche */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Search className="h-5 w-5 mr-2" />
                Trouver des amis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Rechercher par nom d'utilisateur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
                
                {searchLoading && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Recherche en cours...</p>
                    <LoadingSkeleton />
                  </div>
                )}

                {searchQuery && !searchLoading && searchResults.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucun utilisateur trouvé</p>
                    <p className="text-sm">Essayez un autre nom d'utilisateur</p>
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 font-medium">
                      {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''}
                    </p>
                    {searchResults.map((profile) => (
                      <UserCard
                        key={profile.id}
                        profile={profile}
                        buttonText="Ajouter"
                        buttonIcon={<UserPlus className="h-4 w-4" />}
                        onAction={() => sendFriendRequest(profile.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Onglets */}
          <Tabs defaultValue="friends" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="friends" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Amis ({friends.length})</span>
              </TabsTrigger>
              <TabsTrigger value="incoming" className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Reçues ({incomingRequests.length})</span>
              </TabsTrigger>
              <TabsTrigger value="outgoing" className="flex items-center space-x-2">
                <Send className="h-4 w-4" />
                <span>Envoyées ({outgoingRequests.length})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="friends" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Mes amis</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <LoadingSkeleton />
                  ) : friends.length > 0 ? (
                    <div className="space-y-2">
                      {friends.map((friendship) => {
                        const friend = friendship.user_id === user.id 
                          ? friendship.friend_profile 
                          : friendship.user_profile;
                        
                        return (
                          <UserCard
                            key={friendship.id}
                            profile={friend}
                            buttonText="Supprimer"
                            buttonIcon={<UserMinus className="h-4 w-4" />}
                            onAction={() => unfriend(friendship.id)}
                            variant="destructive"
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900">Aucun ami</h3>
                      <p className="text-gray-500 mt-2">
                        Utilisez la recherche pour trouver et ajouter des amis
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="incoming" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Demandes reçues</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <LoadingSkeleton />
                  ) : incomingRequests.length > 0 ? (
                    <div className="space-y-2">
                      {incomingRequests.map((request) => (
                        <div 
                          key={request.id} 
                          className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={request.user_profile?.avatar_url} />
                              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                                {request.user_profile?.username?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">
                                {request.user_profile?.username}
                              </p>
                              <div className="flex items-center text-sm text-gray-500 mt-0.5">
                                <Clock className="h-3 w-3 mr-1" />
                                {new Date(request.requested_at).toLocaleDateString('fr-FR')}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              onClick={() => acceptFriendRequest(request.id)}
                              className="flex items-center space-x-1"
                            >
                              <Check className="h-4 w-4" />
                              <span className="hidden sm:inline">Accepter</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => rejectFriendRequest(request.id)}
                              className="flex items-center space-x-1"
                            >
                              <X className="h-4 w-4" />
                              <span className="hidden sm:inline">Refuser</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900">Aucune demande</h3>
                      <p className="text-gray-500 mt-2">
                        Vous n'avez pas de demandes d'ami en attente
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="outgoing" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Demandes envoyées</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <LoadingSkeleton />
                  ) : outgoingRequests.length > 0 ? (
                    <div className="space-y-2">
                      {outgoingRequests.map((request) => (
                        <div 
                          key={request.id}
                          className="flex items-center justify-between p-4 bg-white rounded-lg border"
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={request.friend_profile?.avatar_url} />
                              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                                {request.friend_profile?.username?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">
                                {request.friend_profile?.username}
                              </p>
                              <div className="flex items-center space-x-2 mt-0.5">
                                <Badge variant="outline" className="text-xs">
                                  En attente
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  {new Date(request.requested_at).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => rejectFriendRequest(request.id)}
                            className="flex items-center space-x-1"
                          >
                            <X className="h-4 w-4" />
                            <span className="hidden sm:inline">Annuler</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Send className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900">Aucune demande envoyée</h3>
                      <p className="text-gray-500 mt-2">
                        Recherchez des utilisateurs pour leur envoyer des demandes d'ami
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AppLayout>
    </div>
  );
};

export default Friends;
