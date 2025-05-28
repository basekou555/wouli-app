import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { checkApiKeyConfiguration, saveApiKey, generateContent } from '../services/eventService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ContentGeneratorProps {
  onContentGenerated?: (content: string) => void;
  initialPrompt?: string;
  containerClassName?: string;
}

const ContentGenerator: React.FC<ContentGeneratorProps> = ({
  onContentGenerated,
  initialPrompt = '',
  containerClassName = ''
}) => {
  // State
  const [prompt, setPrompt] = useState(initialPrompt);
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(500);
  
  // Hooks
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Check if API key is configured on mount
  useEffect(() => {
    const checkConfig = async () => {
      const configured = await checkApiKeyConfiguration('openai');
      setIsConfigured(configured);
      
      // If in development and key is stored locally, load it
      if (typeof window !== 'undefined') {
        const storedKey = localStorage.getItem('openai_api_key');
        if (storedKey) {
          setApiKey(storedKey);
        }
      }
    };
    
    checkConfig();
  }, []);
  
  // Handle API key save
  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      setError("La clé API ne peut pas être vide.");
      return;
    }
    
    saveApiKey('openai', apiKey.trim());
    setIsConfigured(true);
    setError(null);
    
    toast({
      title: "Configuration sauvegardée",
      description: "Votre clé API a été sauvegardée localement."
    });
  };
  
  // Handle content generation
  const handleGenerateContent = async () => {
    if (!prompt.trim()) {
      setError("Veuillez entrer un prompt.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await generateContent(prompt.trim(), {
        temperature,
        maxTokens
      });
      
      if (result.error) {
        setError(result.error);
      } else {
        setGeneratedContent(result.text);
        if (onContentGenerated) {
          onContentGenerated(result.text);
        }
        
        toast({
          title: "Contenu généré",
          description: "Le contenu a été généré avec succès."
        });
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la génération du contenu.");
    } finally {
      setLoading(false);
    }
  };
  
  // Handle content copy
  const handleCopyContent = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({
      title: "Copié",
      description: "Le contenu a été copié dans le presse-papiers."
    });
  };
  
  return (
    <div className={containerClassName}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Générateur de contenu</CardTitle>
          <CardDescription>
            Générez du contenu en utilisant l'intelligence artificielle.
          </CardDescription>
        </CardHeader>
        
        <Tabs defaultValue={isConfigured ? "generator" : "settings"}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generator">Générateur</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generator">
            <CardContent className="space-y-4 pt-4">
              {!isConfigured && (
                <Alert className="bg-amber-50 border-amber-200 text-amber-800">
                  <AlertTitle>Configuration requise</AlertTitle>
                  <AlertDescription>
                    Veuillez configurer votre clé API dans l'onglet Paramètres.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt</Label>
                <Textarea
                  id="prompt"
                  placeholder="Entrez votre prompt ici..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px]"
                  disabled={!isConfigured || loading}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="temperature">Température: {temperature}</Label>
                </div>
                <Slider
                  id="temperature"
                  min={0}
                  max={1}
                  step={0.1}
                  value={[temperature]}
                  onValueChange={(value) => setTemperature(value[0])}
                  disabled={!isConfigured || loading}
                />
                <p className="text-xs text-gray-500">
                  Valeurs basses = réponses plus prévisibles, valeurs élevées = plus de créativité
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="maxTokens">Longueur max: {maxTokens} tokens</Label>
                </div>
                <Slider
                  id="maxTokens"
                  min={100}
                  max={2000}
                  step={100}
                  value={[maxTokens]}
                  onValueChange={(value) => setMaxTokens(value[0])}
                  disabled={!isConfigured || loading}
                />
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Erreur</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {generatedContent && (
                <div className="space-y-2">
                  <Label>Contenu généré</Label>
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200 min-h-[150px] text-sm whitespace-pre-wrap">
                    {generatedContent}
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between gap-2">
              <Button
                variant="outline"
                onClick={() => setGeneratedContent('')}
                disabled={!generatedContent || loading}
              >
                Effacer
              </Button>
              
              <div className="flex gap-2">
                {generatedContent && (
                  <Button
                    variant="secondary"
                    onClick={handleCopyContent}
                  >
                    Copier
                  </Button>
                )}
                
                <Button
                  onClick={handleGenerateContent}
                  disabled={!isConfigured || !prompt.trim() || loading}
                >
                  {loading ? 'Génération en cours...' : 'Générer'}
                </Button>
              </div>
            </CardFooter>
          </TabsContent>
          
          <TabsContent value="settings">
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">Clé API OpenAI</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  La clé API est stockée localement dans votre navigateur et n'est jamais envoyée à nos serveurs.
                </p>
              </div>
              
              {isConfigured && (
                <Alert className="bg-green-50 border-green-200 text-green-800">
                  <AlertTitle>Configuré</AlertTitle>
                  <AlertDescription>
                    La clé API est déjà configurée. Vous pouvez la modifier si nécessaire.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            
            <CardFooter>
              <Button
                onClick={handleSaveApiKey}
                disabled={!apiKey.trim()}
                className="w-full"
              >
                Sauvegarder la clé API
              </Button>
            </CardFooter>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default ContentGenerator;
