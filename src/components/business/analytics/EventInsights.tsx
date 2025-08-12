import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  AlertTriangle, 
  Lightbulb, 
  ArrowRight 
} from 'lucide-react';

interface Insight {
  type: 'positive' | 'warning' | 'opportunity';
  title: string;
  description: string;
  action?: string;
}

interface EventInsightsProps {
  insights: Insight[];
  className?: string;
}

const EventInsights: React.FC<EventInsightsProps> = ({
  insights,
  className = ''
}) => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'opportunity':
        return <Lightbulb className="h-4 w-4 text-blue-600" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
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
      default:
        return 'outline';
    }
  };

  const getInsightTitle = (type: string) => {
    switch (type) {
      case 'positive':
        return 'Point fort';
      case 'warning':
        return 'À améliorer';
      case 'opportunity':
        return 'Opportunité';
      default:
        return 'Insight';
    }
  };

  if (insights.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Insights automatiques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Pas d'insights disponibles pour le moment.</p>
            <p className="text-sm">Plus de données permettront des recommandations personnalisées.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          Insights automatiques
          <Badge variant="outline" className="ml-auto">
            {insights.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 rounded-lg border bg-card/50 transition-colors hover:bg-card"
          >
            <div className="flex-shrink-0 mt-0.5">
              {getInsightIcon(insight.type)}
            </div>
            
            <div className="flex-grow space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={getInsightBadgeVariant(insight.type)} className="text-xs">
                  {getInsightTitle(insight.type)}
                </Badge>
                <h4 className="font-medium text-sm">{insight.title}</h4>
              </div>
              
              <p className="text-sm text-muted-foreground leading-relaxed">
                {insight.description}
              </p>
              
              {insight.action && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-auto p-1 text-xs hover:bg-primary/5"
                >
                  {insight.action}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
          </div>
        ))}
        
        <div className="mt-4 pt-3 border-t text-xs text-muted-foreground">
          💡 Ces insights sont générés automatiquement en comparant vos performances 
          avec des événements similaires.
        </div>
      </CardContent>
    </Card>
  );
};

export default EventInsights;