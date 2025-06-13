
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Users, MapPin, Palette, Globe, Save, Eye } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';

interface DemoConfig {
  clientName: string;
  clientType: string;
  location: string;
  brandColor: string;
  sampleEvents: number;
  features: string[];
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [config, setConfig] = useState<DemoConfig>({
    clientName: 'Blue Note Bar',
    clientType: 'Bar/Restaurant',
    location: 'Lyon',
    brandColor: '#FF7A1F',
    sampleEvents: 3,
    features: ['events', 'stats', 'participants']
  });

  const [presetConfigs] = useState([
    {
      name: 'Bar/Restaurant',
      config: {
        clientName: 'Blue Note Bar',
        clientType: 'Bar/Restaurant',
        location: 'Lyon',
        brandColor: '#FF7A1F',
        sampleEvents: 3,
        features: ['events', 'stats', 'participants']
      }
    },
    {
      name: 'Salle de Sport',
      config: {
        clientName: 'FitMax Gym',
        clientType: 'Salle de Sport',
        location: 'Lyon',
        brandColor: '#10B981',
        sampleEvents: 5,
        features: ['events', 'stats', 'participants', 'classes']
      }
    },
    {
      name: 'Centre Commercial',
      config: {
        clientName: 'Confluence Shopping',
        clientType: 'Centre Commercial',
        location: 'Lyon',
        brandColor: '#3B82F6',
        sampleEvents: 8,
        features: ['events', 'stats', 'participants', 'stores']
      }
    }
  ]);

  const handleSaveConfig = () => {
    // En production, ceci serait sauvegardé en base
    localStorage.setItem('demoConfig', JSON.stringify(config));
    toast({
      title: "✅ Configuration sauvegardée",
      description: "La configuration de démo a été mise à jour",
    });
  };

  const loadPreset = (preset: any) => {
    setConfig(preset.config);
    toast({
      title: "📋 Preset chargé",
      description: `Configuration "${preset.name}" appliquée`,
    });
  };

  const handlePreviewDemo = () => {
    handleSaveConfig();
    navigate('/business');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin - Configuration Démo</h1>
            <p className="text-gray-600 mt-2">Configurez l'app pour vos démonstrations client</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => navigate('/business')}>
              Retour Business
            </Button>
            <Button onClick={handlePreviewDemo} className="bg-green-600 hover:bg-green-700">
              <Eye className="h-4 w-4 mr-2" />
              Prévisualiser
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Configuration principale */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Configuration Client
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du client
                  </label>
                  <Input
                    value={config.clientName}
                    onChange={(e) => setConfig({ ...config, clientName: e.target.value })}
                    placeholder="Ex: Blue Note Bar"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type d'établissement
                    </label>
                    <select
                      value={config.clientType}
                      onChange={(e) => setConfig({ ...config, clientType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Bar/Restaurant">Bar/Restaurant</option>
                      <option value="Salle de Sport">Salle de Sport</option>
                      <option value="Centre Commercial">Centre Commercial</option>
                      <option value="Cinéma">Cinéma</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Localisation
                    </label>
                    <Input
                      value={config.location}
                      onChange={(e) => setConfig({ ...config, location: e.target.value })}
                      placeholder="Ex: Lyon"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Couleur de marque
                    </label>
                    <Input
                      type="color"
                      value={config.brandColor}
                      onChange={(e) => setConfig({ ...config, brandColor: e.target.value })}
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre d'événements exemple
                    </label>
                    <Input
                      type="number"
                      value={config.sampleEvents}
                      onChange={(e) => setConfig({ ...config, sampleEvents: parseInt(e.target.value) })}
                      min="1"
                      max="10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fonctionnalités à présenter
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['events', 'stats', 'participants', 'classes', 'stores', 'analytics'].map((feature) => (
                      <label key={feature} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.features.includes(feature)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setConfig({ ...config, features: [...config.features, feature] });
                            } else {
                              setConfig({ ...config, features: config.features.filter(f => f !== feature) });
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm capitalize">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button onClick={handleSaveConfig} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder Configuration
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Presets et aperçu */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Presets Rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {presetConfigs.map((preset, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => loadPreset(preset)}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    {preset.name}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Aperçu Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm"><strong>Client:</strong> {config.clientName}</p>
                  <p className="text-sm"><strong>Type:</strong> {config.clientType}</p>
                  <p className="text-sm"><strong>Lieu:</strong> {config.location}</p>
                  <p className="text-sm"><strong>Événements:</strong> {config.sampleEvents}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm mr-2"><strong>Couleur:</strong></span>
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: config.brandColor }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Données Démo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>📊 Stats simulées en temps réel</p>
                  <p>👥 {Math.floor(Math.random() * 100) + 50} participants actifs</p>
                  <p>👁️ {Math.floor(Math.random() * 500) + 200} vues cette semaine</p>
                  <p>❤️ {Math.floor(Math.random() * 50) + 20} likes total</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
