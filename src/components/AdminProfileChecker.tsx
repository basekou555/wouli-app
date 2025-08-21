
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Shield, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AdminProfileChecker = () => {
  const { user, profile } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('is_admin_user');
      if (error) throw error;
      setIsAdmin(data);
    } catch (error) {
      console.error('Erreur vérification admin:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const makeAdmin = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ type: 'admin' })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "✅ Profil mis à jour",
        description: "Vous êtes maintenant administrateur. Rechargez la page."
      });

      // Recheck admin status
      setTimeout(checkAdminStatus, 1000);
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span>Vérification des permissions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Statut Administrateur
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="font-medium">Utilisateur:</span>
                <Badge variant="outline">{profile?.username || user?.email}</Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <Badge className="bg-green-100 text-green-800">Administrateur</Badge>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <Badge variant="secondary">Utilisateur standard</Badge>
                </>
              )}
            </div>
          </div>

          {!isAdmin && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-amber-800 mb-1">
                    Accès administrateur requis
                  </h4>
                  <p className="text-sm text-amber-700 mb-3">
                    Pour voir les événements en attente de validation, votre profil doit être configuré comme administrateur.
                  </p>
                  <Button 
                    onClick={makeAdmin}
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Activer les permissions admin
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isAdmin && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <h4 className="font-medium text-green-800">
                    Accès administrateur actif
                  </h4>
                  <p className="text-sm text-green-700">
                    Vous pouvez maintenant voir et gérer les événements en attente de validation.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminProfileChecker;
