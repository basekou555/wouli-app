import React from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, MapPin, Eye, Heart, ExternalLink, Trash2, 
  Clock, Edit, Copy, Users, Flame, Zap, TrendingUp, Minus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BusinessEvent } from '@/types/events';
import { getProxiedImageUrl, handleImageError } from '@/utils/corsProxyHelpers';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BusinessConfig {
  client_name: string;
  client_type: string;
  location: string;
  brand_color: string;
  features: string[];
}

interface EventListProps {
  config: BusinessConfig;
  events: BusinessEvent[];
  onDeleteEvent: (id: string) => void;
  onEditEvent: (event: BusinessEvent) => void;
  onDuplicateEvent?: (event: BusinessEvent) => void;
}

// Performance badge based on views
const getPerformanceBadge = (views: number) => {
  if (views >= 200) return { label: 'Excellent', icon: Flame, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
  if (views >= 100) return { label: 'Bon', icon: Zap, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
  if (views >= 50) return { label: 'Moyen', icon: TrendingUp, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
  return { label: 'À booster', icon: Minus, color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };
};

// Status badge based on date
const getStatusBadge = (date: string) => {
  const eventDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (eventDate < today) {
    return { label: 'Passé', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', dot: 'bg-slate-400' };
  }
  if (eventDate.getTime() === today.getTime()) {
    return { label: "Aujourd'hui", color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', dot: 'bg-amber-400' };
  }
  if (eventDate.getTime() === tomorrow.getTime()) {
    return { label: 'Demain', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', dot: 'bg-blue-400' };
  }
  return { label: 'À venir', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' };
};

const EventList = ({ config, events, onDeleteEvent, onEditEvent, onDuplicateEvent }: EventListProps) => {
  const navigate = useNavigate();

  const handleViewDetails = (event: BusinessEvent) => {
    navigate(`/business/event/${event.id}`, { state: { event } });
  };

  const getLocationDisplay = (event: BusinessEvent) => {
    return event.custom_venue || event.venue || 'Lieu à définir';
  };

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <Calendar className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">Aucun événement trouvé</h3>
        <p className="text-muted-foreground text-sm max-w-sm">
          Créez votre premier événement pour le voir apparaître ici
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event, index) => {
        const performance = getPerformanceBadge(event.views || 0);
        const status = getStatusBadge(event.date);
        const PerformanceIcon = performance.icon;

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.005 }}
            className="group"
          >
            <div className="relative bg-card border border-border rounded-xl p-4 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200">
              <div className="flex gap-4">
                {/* Image */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                  {event.image_url ? (
                    <img 
                      src={getProxiedImageUrl(event.image_url)} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Calendar className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                  )}
                  {/* Performance overlay */}
                  <div className="absolute bottom-1 left-1">
                    <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0.5 backdrop-blur-sm', performance.color)}>
                      <PerformanceIcon className="h-3 w-3 mr-0.5" />
                      {performance.label}
                    </Badge>
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate text-base sm:text-lg">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={cn('text-xs', status.color)}>
                          <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', status.dot)} />
                          {status.label}
                        </Badge>
                        {event.event_type && (
                          <span className="text-xs text-muted-foreground">
                            {event.event_type}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <TooltipProvider>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10"
                              onClick={() => onEditEvent(event)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Modifier</TooltipContent>
                        </Tooltip>
                        
                        {onDuplicateEvent && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-purple-500 hover:bg-purple-500/10"
                                onClick={() => onDuplicateEvent(event)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Dupliquer</TooltipContent>
                          </Tooltip>
                        )}
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10"
                              onClick={() => handleViewDetails(event)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Voir détails</TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                              onClick={() => onDeleteEvent(event.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Supprimer</TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                  </div>
                  
                  {/* Info row */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1.5" />
                      {new Date(event.date).toLocaleDateString('fr-FR', { 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                      <span className="mx-1">•</span>
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      {event.time}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-3.5 w-3.5 mr-1.5" />
                      <span className="truncate max-w-[150px]">{getLocationDisplay(event)}</span>
                    </div>
                    {event.external_url && (
                      <a 
                        href={event.external_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        Billetterie
                      </a>
                    )}
                  </div>
                  
                  {/* Stats row */}
                  <div className="flex items-center gap-4 pt-2 border-t border-border/50">
                    <div className="flex items-center text-sm">
                      <Eye className="h-4 w-4 mr-1.5 text-blue-400" />
                      <span className="font-medium text-foreground">{event.views || 0}</span>
                      <span className="text-muted-foreground ml-1 hidden sm:inline">vues</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Heart className="h-4 w-4 mr-1.5 text-red-400" />
                      <span className="font-medium text-foreground">{event.likes || 0}</span>
                      <span className="text-muted-foreground ml-1 hidden sm:inline">likes</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-1.5 text-emerald-400" />
                      <span className="font-medium text-foreground">{event.participants || 0}</span>
                      <span className="text-muted-foreground ml-1 hidden sm:inline">participants</span>
                    </div>
                    {event.price && (
                      <div className="ml-auto text-sm font-medium text-emerald-400">
                        {event.price}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default EventList;
