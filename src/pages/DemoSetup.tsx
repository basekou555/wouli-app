
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Play, Users, Calendar, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import SupabaseDemoDataLoader from '@/components/SupabaseDemoDataLoader';
import BusinessFeatureConfigurator from '@/components/business/BusinessFeatureConfigurator';
import DemoDataController from '@/components/demo/DemoDataController';
import { useSupabaseDemoData } from '@/hooks/useSupabaseDemoData';

const DemoSetup = () => {
  const { 
    demoEvents, 
    demoConfigs, 
    loadDemoEvents, 
    updateBusinessConfig,
    generateTestEvents,
    clearDemoData,
    isLoading 
  } = useSupabaseDemoData();

  const demoScenarios = [
    {
      title: "Parcours Utilisateur",
      description: "Tester l'expérience de découverte d'événements",
      icon: <Users className="h-5 w-5" />,
      route: "/app",
      color: "bg-blue-500"
    },
    {
      title: "Dashboard Business",
      description: "Interface de gestion pour les établissements",
      icon: <Calendar className="h-5 w-5" />,
      route: "/business",
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center">
            <Button variant="ghost" asChild className="mr-4">
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Configuration Démo Avancée</h1>
              <p className="text-gray-600 mt-1">Données réelles depuis Supabase avec contrôles étendus</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Première ligne - Chargement des données et configuration business */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Chargement des données depuis Supabase */}
          <SupabaseDemoDataLoader />

          {/* Configuration des features business */}
          {demoConfigs.length > 0 && (
            <BusinessFeatureConfigurator 
              configs={demoConfigs}
              onUpdateConfig={updateBusinessConfig}
            />
          )}
        </div>

        {/* Deuxième ligne - Contrôle des données et scénarios */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contrôleur de données de démo */}
          <DemoDataController
            onGenerateEvents={generateTestEvents}
            onClearData={clearDemoData}
            onLoadSupabaseData={loadDemoEvents}
            isLoading={isLoading}
          />

          {/* Scénarios de démo */}
          <Card>
            <CardHeader>
              <CardTitle>Scénarios de Démonstration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {demoScenarios.map((scenario, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-3">
                      <div className={`${scenario.color} text-white p-2 rounded`}>
                        {scenario.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{scenario.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
                        <Button asChild size="sm">
                          <Link to={scenario.route}>
                            <Play className="h-4 w-4 mr-2" />
                            Tester
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Guide de démo amélioré */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Guide de Démonstration Avancée
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Configuration Business</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">1</div>
                    <div>Activez les analytics dans la configuration business</div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">2</div>
                    <div>Personnalisez les couleurs de marque</div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">3</div>
                    <div>Testez les différentes features (stats, ranking, etc.)</div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Données de Test</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">1</div>
                    <div>Chargez les données réelles depuis Supabase</div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">2</div>
                    <div>Générez des événements de test pour plus de variété</div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">3</div>
                    <div>Naviguez dans les différents scénarios</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques rapides */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{demoEvents.length}</div>
              <div className="text-sm text-gray-600">Événements Supabase</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{demoConfigs.length}</div>
              <div className="text-sm text-gray-600">Établissements réels</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {demoConfigs.filter(c => c.features.includes('analytics')).length}
              </div>
              <div className="text-sm text-gray-600">Analytics activées</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {demoConfigs.filter(c => c.features.includes('ranking')).length}
              </div>
              <div className="text-sm text-gray-600">Avec classement</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DemoSetup;
