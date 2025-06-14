
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Play, Users, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import DemoDataLoader from '@/components/DemoDataLoader';
import { useDemoData } from '@/hooks/useDemoData';

const DemoSetup = () => {
  const { demoEvents, demoConfigs } = useDemoData();

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
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center">
            <Button variant="ghost" asChild className="mr-4">
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Configuration Démo</h1>
              <p className="text-gray-600 mt-1">Préparez votre environnement de démonstration</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Chargement des données */}
        <DemoDataLoader />

        {/* Scénarios de démo */}
        <Card>
          <CardHeader>
            <CardTitle>Scénarios de Démonstration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
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

        {/* Guide de démo */}
        <Card>
          <CardHeader>
            <CardTitle>Guide de Démonstration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center">1</div>
                <div>
                  <div className="font-medium">Chargez les données de démo</div>
                  <div className="text-sm text-gray-600">Utilisez le bouton ci-dessus pour initialiser les événements</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center">2</div>
                <div>
                  <div className="font-medium">Testez le parcours utilisateur</div>
                  <div className="text-sm text-gray-600">Naviguez dans l'app, swipez les événements, testez les filtres</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center">3</div>
                <div>
                  <div className="font-medium">Explorez le dashboard business</div>
                  <div className="text-sm text-gray-600">Créez des événements, consultez les stats, testez les fonctionnalités</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques rapides */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{demoEvents.length}</div>
              <div className="text-sm text-gray-600">Événements de démo</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{demoConfigs.length}</div>
              <div className="text-sm text-gray-600">Établissements simulés</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">5</div>
              <div className="text-sm text-gray-600">Catégories d'événements</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DemoSetup;
