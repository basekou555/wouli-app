import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Eye, Heart, Users } from 'lucide-react';
import { UnifiedEvent } from '@/types/unified';
import { BusinessEvent } from '@/types/events';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TopEventsGridProps {
  events: (UnifiedEvent | BusinessEvent)[];
  title?: string;
  className?: string;
  onEventClick?: (eventId: string) => void;
}

const TopEventsGrid: React.FC<TopEventsGridProps> = ({ 
  events,
  title = "Top Événements",
  className = '',
  onEventClick
}) => {
  if (!events || events.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Aucun événement disponible</p>
        </CardContent>
      </Card>
    );
  }

  const getPerformanceBadge = (event: UnifiedEvent | BusinessEvent) => {
    const score = (event.views || 0) * 0.4 + (event.likes || 0) * 1.5 + (event.participants || 0) * 2;
    if (score >= 100) return { variant: 'default' as const, label: 'Excellent' };
    if (score >= 50) return { variant: 'secondary' as const, label: 'Bon' };
    return { variant: 'outline' as const, label: 'Moyen' };
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.slice(0, 3).map((event, index) => {
          const badge = getPerformanceBadge(event);
          
          return (
            <div key={event.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary" 
                   style={{ backgroundColor: index === 0 ? 'hsl(var(--primary))' : index === 1 ? 'hsl(var(--secondary))' : 'hsl(var(--muted-foreground))' }} />
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{event.title}</h4>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(event.date), { addSuffix: true, locale: fr })}
                </p>
                
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    <span>{event.views || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Heart className="h-3 w-3" />
                    <span>{event.likes || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{event.participants || 0}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <Badge variant={badge.variant} className="text-xs">
                  {badge.label}
                </Badge>
                
                {onEventClick && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 w-6 p-0"
                    onClick={() => onEventClick(event.id)}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default TopEventsGrid;