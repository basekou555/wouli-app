import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, MapPin, Calendar, Users } from 'lucide-react';
import { PageSkeleton } from '@/components/LoadingSkeleton';
import FriendButton from '@/components/FriendButton';
import { UserProfile } from '@/types/user';

const UserProfileView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) {
        setError('ID utilisateur manquant');
        setLoading(false);
        return;
      }

      // Si c'est son propre profil, rediriger vers /profile
      if (user?.id === id) {
        navigate('/profile');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, bio, city, avatar_url, type, created_at')
          .eq('id', id)
          .eq('type', 'user')
          .single();

        if (error) {
          setError('Utilisateur introuvable');
          console.error('Erreur récupération profil:', error);
        } else if (data) {
          setProfile(data as UserProfile);
        } else {
          setError('Utilisateur introuvable');
        }
      } catch (err) {
        setError('Erreur lors du chargement du profil');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, user?.id, navigate]);

  if (loading) {
    return <PageSkeleton />;
  }

  if (error) {
    return (
      <AppLayout>
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold text-destructive mb-4">Erreur</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold mb-4">Utilisateur introuvable</h1>
            <p className="text-muted-foreground mb-6">
              Cet utilisateur n'existe pas ou a supprimé son compte.
            </p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Profil utilisateur</h1>
          <div></div>
        </div>

        {/* Profil */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.avatar_url || ''} />
                <AvatarFallback className="text-2xl">
                  {profile.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <div>
                  <h1 className="text-2xl font-bold">{profile.username}</h1>
                  <p className="text-muted-foreground">
                    Membre depuis {new Date(profile.created_at).toLocaleDateString('fr-FR', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                  
                  {profile.city && (
                    <Badge variant="secondary" className="mt-2">
                      <MapPin className="h-3 w-3 mr-1" />
                      {profile.city}
                    </Badge>
                  )}
                </div>

                {profile.bio && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">À propos</h3>
                    <p className="text-muted-foreground">{profile.bio}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-2">
                <FriendButton 
                  userId={profile.id} 
                  username={profile.username}
                  size="sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques publiques */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Activité
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">0</div>
                <p className="text-sm text-muted-foreground">Événements participés</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">0</div>
                <p className="text-sm text-muted-foreground">Événements aimés</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">0</div>
                <p className="text-sm text-muted-foreground">Événements créés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Événements récents (à implémenter) */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Événements récents
            </h2>
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun événement récent à afficher</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default UserProfileView;