import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  CheckCircle, 
  AlertTriangle, 
  Lightbulb, 
  Clock,
  Target,
  ArrowRight,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';

interface Insight {
  type: 'positive' | 'warning' | 'opportunity' | 'timing' | 'competition';
  title: string;
  description: string;
  action?: string;
  priority: number;
}

interface RecommendationsSectionProps {
  insights: Insight[];
  className?: string;
}

const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  insights,
  className = ''
}) => {
  const [readInsights, setReadInsights] = useState<Set<number>>(new Set());

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'opportunity':
        return <Lightbulb className="h-5 w-5 text-primary" />;
      case 'timing':
        return <Clock className="h-5 w-5 text-accent" />;
      case 'competition':
        return <Target className="h-5 w-5 text-secondary" />;
      default:
        return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getInsightBadgeVariant = (type: string) => {
    switch (type) {
      case 'positive':
        return 'default';
      case 'warning':
        return 'destructive';
      case 'opportunity':
        return 'secondary';
      case 'timing':
        return 'outline';
      case 'competition':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getInsightTitle = (type: string) => {
    switch (type) {
      case 'positive':
        return 'Succès';
      case 'warning':
        return 'Attention';
      case 'opportunity':
        return 'Opportunité';
      case 'timing':
        return 'Timing';
      case 'competition':
        return 'Position';
      default:
        return 'Insight';
    }
  };

  const getDetailedRecommendation = (insight: Insight) => {
    const recommendations = {
      positive: {
        title: "Comment capitaliser sur ce succès",
        content: [
          "Dupliquez cette stratégie pour vos prochains événements",
          "Analysez les éléments qui ont contribué au succès",
          "Partagez cette réussite sur vos réseaux sociaux",
          "Utilisez ce format comme template pour de futurs événements"
        ]
      },
      warning: {
        title: "Actions correctives recommandées",
        content: [
          "Révisez votre description pour la rendre plus attractive",
          "Vérifiez que le prix est cohérent avec votre marché",
          "Améliorez vos visuels et photos d'événement",
          "Considérez un ajustement de l'horaire ou du format"
        ]
      },
      opportunity: {
        title: "Comment optimiser cette opportunité",
        content: [
          "Simplifiez le processus d'inscription",
          "Ajoutez des incitations (early bird, groupe, etc.)",
          "Clarifiez les informations pratiques",
          "Proposez différentes options de participation"
        ]
      },
      timing: {
        title: "Optimisations temporelles",
        content: [
          "Programmez vos publications aux heures optimales",
          "Adaptez votre calendrier de communication",
          "Anticipez les pics de réservation",
          "Créez des rappels automatiques"
        ]
      },
      competition: {
        title: "Stratégie concurrentielle",
        content: [
          "Analysez les meilleures pratiques de vos concurrents",
          "Différenciez-vous avec une proposition unique",
          "Surveillez les prix et offres du marché",
          "Renforcez vos points forts identifiés"
        ]
      }
    };

    return recommendations[insight.type as keyof typeof recommendations] || recommendations.opportunity;
  };

  const markAsRead = (index: number) => {
    setReadInsights(prev => new Set([...prev, index]));
  };

  if (insights.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Recommandations intelligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <h3 className="font-medium mb-2">Collecte de données en cours</h3>
            <p className="text-sm">
              Plus de données permettront des recommandations personnalisées basées sur l'IA.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Recommandations intelligentes
          <Badge variant="outline" className="ml-auto">
            {insights.length} insights
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => {
          const isRead = readInsights.has(index);
          const recommendation = getDetailedRecommendation(insight);
          
          return (
            <div
              key={index}
              className={`p-4 rounded-lg border transition-all hover:shadow-sm ${
                isRead ? 'bg-muted/30 border-muted' : 'bg-card border-border'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getInsightIcon(insight.type)}
                </div>
                
                <div className="flex-grow space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge 
                      variant={getInsightBadgeVariant(insight.type)} 
                      className="text-xs"
                    >
                      {getInsightTitle(insight.type)}
                    </Badge>
                    <h4 className="font-medium text-sm flex-grow">
                      {insight.title}
                    </h4>
                    {!isRead && (
                      <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {insight.description}
                  </p>
                  
                  <div className="flex items-center gap-2 pt-1">
                    {insight.action && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-auto p-2 text-xs hover:bg-primary/5 text-primary"
                            onClick={() => markAsRead(index)}
                          >
                            {insight.action}
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              {getInsightIcon(insight.type)}
                              {recommendation.title}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                              {insight.description}
                            </p>
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm">Actions recommandées :</h4>
                              <ul className="space-y-2 text-sm">
                                {recommendation.content.map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <CheckCircle className="h-3 w-3 text-success mt-0.5 flex-shrink-0" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="flex justify-end pt-2">
                              <Button size="sm" onClick={() => markAsRead(index)}>
                                Marquer comme lu
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    
                    {!isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => markAsRead(index)}
                      >
                        Marquer comme lu
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>
              Insights générés par l'IA Wouli - Mis à jour en temps réel
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <Calendar className="h-3 w-3" />
            <span>
              Prochaine analyse : dans 2h
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationsSection;