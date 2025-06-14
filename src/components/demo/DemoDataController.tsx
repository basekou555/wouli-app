
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Database, RefreshCw, Trash2, Plus, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DemoDataControllerProps {
  onGenerateEvents: (count: number) => void;
  onClearData: () => void;
  onLoadSupabaseData: () => void;
  isLoading: boolean;
}

const DemoDataController = ({ 
  onGenerateEvents, 
  onClearData, 
  onLoadSupabaseData,
  isLoading 
}: DemoDataControllerProps) => {
  const [eventCount, setEventCount] = useState(10);
  const { toast } = useToast();

  const handleGenerateEvents = () => {
    if (eventCount < 1 || eventCount > 50) {
      toast({
        title: "Erreur",
        description: "Le nombre d'événements doit être entre 1 et 50",
        variant: "destructive"
      });
      return;
    }
    onGenerateEvents(eventCount);
  };

  const handleClearData = () => {
    if (window.confirm('Êtes-vous sûr de vouloir effacer toutes les données de démo ?')) {
      onClearData();
    }
  };

  const presetCounts = [5, 10, 20, 30];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="h-5 w-5 mr-2" />
          Contrôle des Données de Démo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chargement depuis Supabase */}
        <div>
          <h4 className="font-medium mb-3">Données Réelles</h4>
          <Button 
            onClick={onLoadSupabaseData}
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            {isLoading ? 'Chargement...' : 'Charger depuis Supabase'}
          </Button>
        </div>

        {/* Génération d'événements de test */}
        <div>
          <h4 className="font-medium mb-3">Génération d'Événements</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre d'événements à générer
              </label>
              <Input
                type="number"
                min="1"
                max="50"
                value={eventCount}
                onChange={(e) => setEventCount(parseInt(e.target.value) || 1)}
                className="w-full"
              />
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {presetCounts.map((count) => (
                <Button
                  key={count}
                  variant="outline"
                  size="sm"
                  onClick={() => setEventCount(count)}
                  className="text-xs"
                >
                  {count}
                </Button>
              ))}
            </div>

            <Button 
              onClick={handleGenerateEvents}
              disabled={isLoading}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Générer les Événements
            </Button>
          </div>
        </div>

        {/* Actions de maintenance */}
        <div>
          <h4 className="font-medium mb-3">Maintenance</h4>
          <div className="space-y-2">
            <Button 
              onClick={handleClearData}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Effacer toutes les données
            </Button>
          </div>
        </div>

        {/* Informations */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">💡 Conseils</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Utilisez les données Supabase pour une démo réaliste</li>
            <li>• Générez 10-20 événements pour tester les analytics</li>
            <li>• Effacez les données entre les différents tests</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default DemoDataController;
