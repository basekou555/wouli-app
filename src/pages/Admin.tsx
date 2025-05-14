
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EventAdminForm from '../components/admin/EventAdminForm';
import EventAdminList from '../components/admin/EventAdminList';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Admin = () => {
  const [activeTab, setActiveTab] = useState<string>('manage');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Liste d'administrateurs (dans un vrai cas d'utilisation, ces IDs seraient stockés dans Firestore)
  const adminUsers = [
    'admin@wouli.app',
    'adechinan91@gmail.com' // Ajoutez votre email ici pour les tests
  ];

  const isAdmin = user && adminUsers.includes(user.email || '');

  if (!user) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Connexion requise</h2>
          <p className="text-gray-500 mb-4">Vous devez être connecté pour accéder au panneau d'administration.</p>
          <Button onClick={() => navigate('/login')}>Se connecter</Button>
        </div>
      </AppLayout>
    );
  }

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Accès non autorisé</h2>
          <p className="text-gray-500 mb-4">Vous n'avez pas les droits d'accès au panneau d'administration.</p>
          <Button onClick={() => navigate('/dashboard')} variant="outline">Retour au tableau de bord</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Administration Wouli</h1>
          <p className="text-gray-500 mt-1">Gérez les événements et contenus de la plateforme</p>
        </header>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:w-[400px]">
            <TabsTrigger value="manage">Gérer les événements</TabsTrigger>
            <TabsTrigger value="create">Créer un événement</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Liste des événements</CardTitle>
              </CardHeader>
              <CardContent>
                <EventAdminList />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Créer un nouvel événement</CardTitle>
              </CardHeader>
              <CardContent>
                <EventAdminForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Admin;
