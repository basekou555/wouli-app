
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Download, BarChart3, Users, Eye, CheckCircle } from 'lucide-react';
import { useSupabaseDemoData } from '@/hooks/useSupabaseDemoData';

const SupabaseDemoDataLoader = () => {
  const { loadDemoEvents, getTotalStats, isLoading, demoEvents, demoConfigs } = useSupabaseDemoData();
  const stats = getTotalStats();

  const handleLoadDemo = async () => {
    await loadDemoEvents();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="h-5 w-5 mr-2 text-blue-600" />
          Données Réelles Supabase
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {demoEvents.length > 0 && (
          <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            <span className="text-green-800 font-medium">Données chargées depuis Supabase</span>
          </div>
        )}

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

        {demoConfigs.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Établissements Supabase :</h3>
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
        )}

        {demoEvents.length > 0 && (
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
        )}

        <Button 
          onClick={handleLoadDemo}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          <Download className="h-4 w-4 mr-2" />
          {isLoading ? 'Chargement...' : 'Charger depuis Supabase'}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          Ces données proviennent directement de votre base Supabase avec 3 établissements réels.
        </p>
      </CardContent>
    </Card>
  );
};

export default SupabaseDemoDataLoader;
