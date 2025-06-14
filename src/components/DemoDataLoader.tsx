
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Download, BarChart3, Users, Eye } from 'lucide-react';
import { useDemoData } from '@/hooks/useDemoData';

const DemoDataLoader = () => {
  const { loadDemoEvents, getTotalStats, isLoading, demoEvents, demoConfigs } = useDemoData();
  const stats = getTotalStats();

  const handleLoadDemo = async () => {
    await loadDemoEvents();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="h-5 w-5 mr-2 text-blue-600" />
          Données de Démonstration Wouli
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{demoEvents.length}</div>
            <div className="text-sm text-gray-600">Événements</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{demoConfigs.length}</div>
            <div className="text-sm text-gray-600">Établissements</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.averageParticipation}</div>
            <div className="text-sm text-gray-600">Participation moy.</div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Établissements inclus :</h3>
          {demoConfigs.map((config, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <div className="font-medium">{config.client_name}</div>
                <div className="text-sm text-gray-600">{config.client_type} • {config.location}</div>
              </div>
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: config.brand_color }}
              ></div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <Eye className="h-5 w-5 mx-auto mb-1 text-gray-400" />
            <div className="text-lg font-semibold">{stats.views.toLocaleString()}</div>
            <div className="text-xs text-gray-600">Vues totales</div>
          </div>
          <div className="text-center">
            <BarChart3 className="h-5 w-5 mx-auto mb-1 text-gray-400" />
            <div className="text-lg font-semibold">{stats.likes}</div>
            <div className="text-xs text-gray-600">Likes</div>
          </div>
          <div className="text-center">
            <Users className="h-5 w-5 mx-auto mb-1 text-gray-400" />
            <div className="text-lg font-semibold">{stats.participants}</div>
            <div className="text-xs text-gray-600">Participants</div>
          </div>
        </div>

        <Button 
          onClick={handleLoadDemo}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          <Download className="h-4 w-4 mr-2" />
          {isLoading ? 'Chargement...' : 'Charger les Données de Démo'}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          Ces données simulent un environnement réel avec 3 établissements partenaires et leurs événements.
        </p>
      </CardContent>
    </Card>
  );
};

export default DemoDataLoader;
