
import React, { useState } from 'react';
import AppLayout from '../components/AppLayout';
import ContentGenerator from '../components/ContentGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const ContentCreation = () => {
  const { user } = useAuth();
  const [generatedContents, setGeneratedContents] = useState<{ id: number; content: string; timestamp: Date }[]>([]);
  const [activeTab, setActiveTab] = useState('generator');
  
  // Handle new generated content
  const handleContentGenerated = (content: string) => {
    // Add new content to history
    setGeneratedContents(prev => [
      { id: Date.now(), content, timestamp: new Date() },
      ...prev
    ]);
    
    // Switch to history tab
    setActiveTab('history');
  };
  
  // Format timestamp
  const formatTimestamp = (date: Date) => {
    return date.toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Création de contenu</h1>
          <p className="text-gray-500">Générez du contenu pour vos événements avec l'IA</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="generator">Générateur</TabsTrigger>
                <TabsTrigger value="history">Historique ({generatedContents.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="generator">
                <ContentGenerator 
                  onContentGenerated={handleContentGenerated}
                  containerClassName="mt-6"
                />
              </TabsContent>
              
              <TabsContent value="history">
                <div className="mt-6 space-y-4">
                  {generatedContents.length > 0 ? (
                    generatedContents.map((item) => (
                      <Card key={item.id}>
                        <CardHeader className="py-3">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-sm font-medium">
                              Contenu généré
                            </CardTitle>
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(item.timestamp)}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="py-2">
                          <div className="bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap border border-gray-100">
                            {item.content}
                          </div>
                          <div className="flex justify-end mt-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(item.content);
                              }}
                            >
                              Copier
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-md">
                      <p className="text-gray-500">Aucun contenu généré pour l'instant</p>
                      <Button 
                        variant="link" 
                        onClick={() => setActiveTab('generator')}
                        className="mt-2"
                      >
                        Commencer à générer du contenu
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Conseils d'utilisation</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Description d'événement</h3>
                  <p className="text-gray-600">
                    "Écrivez une description attractive pour un atelier de cuisine italienne à Paris, comprenant les détails sur les plats préparés et l'ambiance."
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Biographie de profil</h3>
                  <p className="text-gray-600">
                    "Rédigez une biographie professionnelle pour un organisateur d'événements spécialisé dans les conférences tech, mettant en avant son expertise et son approche."
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Message d'invitation</h3>
                  <p className="text-gray-600">
                    "Créez un message d'invitation pour un événement de networking professionnel en soirée qui encourage les participants à s'inscrire rapidement."
                  </p>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Notez que tout le contenu généré doit être vérifié et personnalisé avant utilisation.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ContentCreation;
