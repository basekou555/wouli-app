
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Users, MapPin, Palette, Globe, Save, Eye, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBusinessConfig } from '@/hooks/useBusinessConfig';

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { config, loading, updateConfig } = useBusinessConfig();

  const [presetConfigs] = React.useState([
    {
      name: 'Bar/Restaurant',
      config: {
        client_name: 'Blue Note Bar',
        client_type: 'Bar/Restaurant',
        location: 'Lyon',
        brand_color: '#FF7A1F',
        features: ['events', 'stats', 'redirections']
      }
    },
    {
      name: 'Boîte de Nuit',
      config: {
        client_name: 'Club Nyx',
        client_type: 'Boîte de Nuit',
        location: 'Lyon',
        brand_color: '#8B5CF6',
        features: ['events', 'stats', 'redirections', 'ranking']
      }
    },
    {
      name: 'Salle de Sport',
      config: {
        client_name: 'FitMax Gym',
        client_type: 'Salle de Sport',
        location: 'Lyon',
        brand_color: '#10B981',
        features: ['events', 'stats', 'redirections', 'classes']
      }
    },
    {
      name: 'Centre Commercial',
      config: {
        client_name: 'Confluence Shopping',
        client_type: 'Centre Commercial',
        location: 'Lyon',
        brand_color: '#3B82F6',
        features: ['events', 'stats', 'redirections', 'stores']
      }
    }
  ]);

  const [formData, setFormData] = React.useState(config || {
    client_name: '',
    client_type: 'Bar/Restaurant',
    location: '',
    brand_color: '#FF7A1F',
    features: []
  });

  React.useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  const handleSaveConfig = () => {
    updateConfig(formData);
  };

  const loadPreset = (preset: any) => {
    setFormData(preset.config);
  };

  const handlePreviewDemo = () => {
    handleSaveConfig();
    navigate('/business');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/business')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Paramètres du Profil</h1>
              <p className="text-gray-600 mt-2">Configurez votre établissement</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button onClick={handlePreviewDemo} className="bg-green-600 hover:bg-green-700">
              <Eye className="h-4 w-4 mr-2" />
              Voir mon profil
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
                  Informations de l'établissement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'établissement
                  </label>
                  <Input
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    placeholder="Ex: Blue Note Bar"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type d'établissement
                    </label>
                    <select
                      value={formData.client_type}
                      onChange={(e) => setFormData({ ...formData, client_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Bar/Restaurant">Bar/Restaurant</option>
                      <option value="Boîte de Nuit">Boîte de Nuit</option>
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
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Ex: Lyon"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur de marque
                  </label>
                  <Input
                    type="color"
                    value={formData.brand_color}
                    onChange={(e) => setFormData({ ...formData, brand_color: e.target.value })}
                    className="h-10 w-20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fonctionnalités activées
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['events', 'stats', 'redirections', 'ranking', 'classes', 'stores', 'analytics'].map((feature) => (
                      <label key={feature} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.features.includes(feature)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, features: [...formData.features, feature] });
                            } else {
                              setFormData({ ...formData, features: formData.features.filter(f => f !== feature) });
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
                  Sauvegarder
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Presets et aperçu */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Modèles rapides</CardTitle>
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
                <CardTitle>Aperçu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm"><strong>Établissement:</strong> {formData.client_name}</p>
                  <p className="text-sm"><strong>Type:</strong> {formData.client_type}</p>
                  <p className="text-sm"><strong>Lieu:</strong> {formData.location}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm mr-2"><strong>Couleur:</strong></span>
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: formData.brand_color }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
