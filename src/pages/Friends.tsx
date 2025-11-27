
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Search, UserPlus, Check, X, Users, Clock, Send, MapPin } from 'lucide-react';
import { useFriendships, useUserSearch } from '@/hooks/useFriendships';
import { useAuth } from '@/contexts/AuthContext';
import { PageSkeleton } from '@/components/LoadingSkeleton';
import { useDebounce } from '@/hooks/useDebounce';
import BottomNavigation from '@/components/BottomNavigation';
import PageHeader from '@/components/PageHeader';

const Friends = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('friends');
  
  const {
    acceptedFriends,
    receivedRequests,
    sentRequests,
    pendingCount,
    loading: friendshipsLoading,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest
  } = useFriendships();

  const {
    users: searchResults,
    loading: searchLoading,
    searchUsers,
    clearSearch
  } = useUserSearch();

  const debouncedSearch = useDebounce((query: string) => {
    if (query.trim().length >= 2) {
      searchUsers(query);
    } else {
      clearSearch();
    }
  }, 300);

  const handleSearchChange = (query: string) => {
    setLocalSearchQuery(query);
    debouncedSearch(query);
  };

  const filteredFriends = acceptedFriends.filter(friendship => {
    const friend = friendship.friend_profile;
    return friend?.username?.toLowerCase().includes(localSearchQuery.toLowerCase()) || false;
  });

  if (friendshipsLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader 
        title="Mes amis" 
        subtitle="Gérez vos amis et demandes d'amitié"
        showBack
      />
      
      <div className="px-4 py-6 max-w-2xl mx-auto space-y-6">
        {/* Barre de recherche */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher des amis ou des utilisateurs..."
                value={localSearchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {localSearchQuery.length >= 2 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Résultats de recherche
                </h3>
                {searchLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-2">
                    {searchResults.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar_url || ''} />
                            <AvatarFallback>
                              {user.username?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.username}</p>
                            {user.city && (
                              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>{user.city}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => navigate(`/user/${user.id}`)}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Voir profil
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Aucun utilisateur trouvé
                  </p>
                )}
                <Separator className="mt-4" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="friends" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Amis</span>
              {acceptedFriends.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {acceptedFriends.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="received" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Reçues</span>
              {receivedRequests.length > 0 && (
                <Badge variant="default" className="ml-1">
                  {receivedRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center space-x-2">
              <Send className="h-4 w-4" />
              <span>Envoyées</span>
              {sentRequests.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {sentRequests.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Onglet Amis */}
          <TabsContent value="friends">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Mes amis ({filteredFriends.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredFriends.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">
                      {localSearchQuery ? 'Aucun ami trouvé' : 'Pas encore d\'amis'}
                    </h3>
                    <p className="text-muted-foreground">
                      {localSearchQuery 
                        ? 'Essayez une autre recherche'
                        : 'Recherchez et ajoutez des amis pour commencer'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                     {filteredFriends.map((friendship) => {
                       const friend = friendship.friend_profile;
                       return (
                         <div key={friendship.id} className="flex items-center justify-between p-3 rounded-lg border">
                           <div className="flex items-center space-x-3">
                             <Avatar className="h-12 w-12">
                               <AvatarImage src={friend?.avatar_url || ''} />
                               <AvatarFallback>
                                 {friend?.username?.charAt(0).toUpperCase()}
                               </AvatarFallback>
                             </Avatar>
                             <div>
                               <p className="font-medium">{friend?.username}</p>
                               {friend?.city && (
                                 <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                   <MapPin className="h-3 w-3" />
                                   <span>{friend.city}</span>
                                 </div>
                               )}
                               {friendship.accepted_at && (
                                 <p className="text-xs text-muted-foreground">
                                   Amis depuis {new Date(friendship.accepted_at).toLocaleDateString()}
                                 </p>
                               )}
                             </div>
                           </div>
                           <Button
                             variant="outline"
                             size="sm"
                             onClick={() => navigate(`/user/${friend?.id}`)}
                           >
                             Voir profil
                           </Button>
                         </div>
                       );
                     })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Demandes reçues */}
          <TabsContent value="received">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Demandes reçues ({receivedRequests.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {receivedRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Aucune demande en attente</h3>
                    <p className="text-muted-foreground">
                      Les demandes d'amitié apparaîtront ici
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {receivedRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={request.user_profile?.avatar_url || ''} />
                            <AvatarFallback>
                              {request.user_profile?.username?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{request.user_profile?.username}</p>
                            {request.user_profile?.city && (
                              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>{request.user_profile.city}</span>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Demande envoyée {new Date(request.requested_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => acceptFriendRequest(request.id, request.user_profile?.username)}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Accepter
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => rejectFriendRequest(request.id)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Refuser
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Demandes envoyées */}
          <TabsContent value="sent">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Send className="h-5 w-5" />
                  <span>Demandes envoyées ({sentRequests.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sentRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Aucune demande envoyée</h3>
                    <p className="text-muted-foreground">
                      Les demandes que vous envoyez apparaîtront ici
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sentRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={request.friend_profile?.avatar_url || ''} />
                            <AvatarFallback>
                              {request.friend_profile?.username?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{request.friend_profile?.username}</p>
                            {request.friend_profile?.city && (
                              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>{request.friend_profile.city}</span>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Envoyée {new Date(request.requested_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline">En attente</Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cancelFriendRequest(request.id)}
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Friends;
