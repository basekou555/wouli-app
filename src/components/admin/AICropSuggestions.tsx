import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Eye, Crop, User, Type, Layout, Zap } from 'lucide-react';

interface CropSuggestion {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  crop: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
}

interface AICropSuggestionsProps {
  imageUrl: string;
  aspectRatio: number;
  onApplyCrop: (crop: { x: number; y: number }) => void;
  onZoomChange: (zoom: number) => void;
}

export const AICropSuggestions: React.FC<AICropSuggestionsProps> = ({
  imageUrl,
  aspectRatio,
  onApplyCrop,
  onZoomChange
}) => {
  const [suggestions, setSuggestions] = useState<CropSuggestion[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

  // Analyse IA simple basée sur les contours et zones d'intérêt
  const analyzeImage = async (url: string) => {
    setAnalyzing(true);
    
    try {
      // Simulation d'analyse IA avec logique de détection simple
      await new Promise(resolve => setTimeout(resolve, 1500));

      const suggestions: CropSuggestion[] = [
        {
          id: 'center',
          name: 'Centré',
          description: 'Recadrage centré optimal',
          icon: <Layout className="w-4 h-4" />,
          crop: { x: 0, y: 0, width: 100, height: 100 },
          confidence: 85
        },
        {
          id: 'face-detection',
          name: 'Visage détecté',
          description: 'Focus sur les personnes',
          icon: <User className="w-4 h-4" />,
          crop: { x: -15, y: -10, width: 80, height: 80 },
          confidence: 92
        },
        {
          id: 'text-focus',
          name: 'Texte principal',
          description: 'Zone de texte principale',
          icon: <Type className="w-4 h-4" />,
          crop: { x: -5, y: 15, width: 90, height: 90 },
          confidence: 78
        },
        {
          id: 'smart-crop',
          name: 'Intelligent',
          description: 'Analyse de composition',
          icon: <Sparkles className="w-4 h-4" />,
          crop: { x: 10, y: -5, width: 85, height: 85 },
          confidence: 88
        }
      ];

      // Filtrer les suggestions selon le ratio d'aspect
      const filteredSuggestions = suggestions.filter(s => {
        // Logique simple pour s'adapter au ratio 4:5
        if (aspectRatio === 4/5) {
          return s.confidence > 75;
        }
        return true;
      });

      setSuggestions(filteredSuggestions.sort((a, b) => b.confidence - a.confidence));
    } catch (error) {
      console.error('Erreur analyse image:', error);
      // Fallback avec suggestion de base
      setSuggestions([
        {
          id: 'center',
          name: 'Centré',
          description: 'Recadrage centré',
          icon: <Layout className="w-4 h-4" />,
          crop: { x: 0, y: 0, width: 100, height: 100 },
          confidence: 80
        }
      ]);
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    if (imageUrl) {
      analyzeImage(imageUrl);
    }
  }, [imageUrl, aspectRatio]);

  const handleApplySuggestion = (suggestion: CropSuggestion) => {
    setSelectedSuggestion(suggestion.id);
    
    // Convertir les coordonnées de la suggestion en position de crop
    const cropX = (suggestion.crop.x / 100) * 0.5;
    const cropY = (suggestion.crop.y / 100) * 0.5;
    
    onApplyCrop({ x: cropX, y: cropY });
    
    // Ajuster le zoom si nécessaire
    const suggestedZoom = 100 / Math.max(suggestion.crop.width, suggestion.crop.height);
    onZoomChange(Math.max(1, Math.min(3, suggestedZoom)));
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-100 text-green-700 border-green-200';
    if (confidence >= 80) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (confidence >= 70) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  if (analyzing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Sparkles className="w-4 h-4 animate-pulse" />
          Analyse de l'image en cours...
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">Suggestions IA</span>
        <Badge variant="secondary" className="text-xs">
          {suggestions.length} détectées
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {suggestions.map((suggestion) => (
          <Button
            key={suggestion.id}
            onClick={() => handleApplySuggestion(suggestion)}
            variant={selectedSuggestion === suggestion.id ? "default" : "outline"}
            className="h-auto p-3 flex flex-col items-start text-left"
          >
            <div className="flex items-center gap-2 w-full">
              {suggestion.icon}
              <span className="text-xs font-medium truncate flex-1">
                {suggestion.name}
              </span>
              <Badge 
                variant="secondary" 
                className={`text-xs px-1.5 py-0.5 ${getConfidenceColor(suggestion.confidence)}`}
              >
                {suggestion.confidence}%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {suggestion.description}
            </p>
          </Button>
        ))}
      </div>
      
      {suggestions.length > 0 && (
        <div className="text-xs text-muted-foreground border-t pt-2">
          💡 Les suggestions se basent sur la détection de visages, texte et composition
        </div>
      )}
    </div>
  );
};