
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Settings, Palette, BarChart3, Eye, ExternalLink, Trophy } from 'lucide-react';
import { BusinessConfig } from '@/types/business';

interface BusinessFeatureConfiguratorProps {
  configs: BusinessConfig[];
  onUpdateConfig: (configId: string, updates: Partial<BusinessConfig>) => void;
}

const BusinessFeatureConfigurator = ({ configs, onUpdateConfig }: BusinessFeatureConfiguratorProps) => {
  const [selectedConfigId, setSelectedConfigId] = useState<string>(configs[0]?.id || '');
  
  const selectedConfig = configs.find(config => config.id === selectedConfigId);

  const featureOptions = [
    { key: 'events', label: 'Gestion d\'événements', icon: <Settings className="h-4 w-4" /> },
    { key: 'stats', label: 'Statistiques', icon: <BarChart3 className="h-4 w-4" /> },
    { key: 'analytics', label: 'Analytics avancées', icon: <Eye className="h-4 w-4" /> },
    { key: 'redirections', label: 'Redirections', icon: <ExternalLink className="h-4 w-4" /> },
    { key: 'ranking', label: 'Classement local', icon: <Trophy className="h-4 w-4" /> }
  ];

  const handleFeatureToggle = (feature: string, enabled: boolean) => {
    if (!selectedConfig) return;
    
    const updatedFeatures = enabled 
      ? [...selectedConfig.features, feature]
      : selectedConfig.features.filter(f => f !== feature);
    
    onUpdateConfig(selectedConfig.id!, { features: updatedFeatures });
  };

  const handleColorChange = (color: string) => {
    if (!selectedConfig) return;
    onUpdateConfig(selectedConfig.id!, { brand_color: color });
  };

  if (!selectedConfig) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Aucune configuration disponible</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Configuration Business
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sélecteur d'établissement */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Établissement à configurer
          </label>
          <select
            value={selectedConfigId}
            onChange={(e) => setSelectedConfigId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {configs.map((config) => (
              <option key={config.id} value={config.id}>
                {config.client_name} ({config.client_type})
              </option>
            ))}
          </select>
        </div>

        {/* Configuration de la couleur */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Palette className="h-4 w-4 inline mr-1" />
            Couleur de marque
          </label>
          <div className="flex items-center space-x-3">
            <Input
              type="color"
              value={selectedConfig.brand_color}
              onChange={(e) => handleColorChange(e.target.value)}
              className="h-10 w-20"
            />
            <span className="text-sm text-gray-600">{selectedConfig.brand_color}</span>
          </div>
        </div>

        {/* Configuration des features */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Fonctionnalités activées
          </label>
          <div className="space-y-3">
            {featureOptions.map((feature) => (
              <div key={feature.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {feature.icon}
                  <span className="font-medium">{feature.label}</span>
                </div>
                <Switch
                  checked={selectedConfig.features.includes(feature.key)}
                  onCheckedChange={(checked) => handleFeatureToggle(feature.key, checked)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Prévisualisation */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Aperçu de la configuration</h4>
          <div className="text-sm space-y-1">
            <p><strong>Établissement:</strong> {selectedConfig.client_name}</p>
            <p><strong>Type:</strong> {selectedConfig.client_type}</p>
            <p><strong>Localisation:</strong> {selectedConfig.location}</p>
            <p><strong>Features actives:</strong> {selectedConfig.features.length}</p>
            <div className="flex items-center mt-2">
              <span className="mr-2">Couleur:</span>
              <div 
                className="w-6 h-6 rounded border"
                style={{ backgroundColor: selectedConfig.brand_color }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessFeatureConfigurator;
