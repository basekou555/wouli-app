import React from 'react';
import WouliEventCard from '@/components/cards/WouliEventCard';
import { PendingEvent, mapPendingEventToUnified } from '@/hooks/utils/adminEventMappers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, History, BarChart3, X } from 'lucide-react';

interface AdminEventPreviewProps {
  event: PendingEvent;
  onEdit?: (event: PendingEvent) => void;
  onHistory?: (eventId: string, eventTitle: string) => void;
  onStats?: (eventId: string) => void;
  onClose: () => void;
}

export const AdminEventPreview: React.FC<AdminEventPreviewProps> = ({
  event,
  onEdit,
  onHistory,
  onStats,
  onClose
}) => {
  const unifiedEvent = mapPendingEventToUnified(event);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: 'secondary', label: '⏳ En attente' },
      active: { variant: 'default', label: '✅ Validé' },
      rejected: { variant: 'destructive', label: '❌ Rejeté' }
    };
    const config = variants[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Mock handlers for card interactions (admin preview only)
  const handleMockInteraction = () => {
    // No-op for admin preview
  };

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Aperçu événement
          </h3>
          <p className="text-sm text-muted-foreground">
            Prévisualisation identique à l'affichage utilisateur
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(event.status)}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* User Preview - Identical to user view */}
      <div className="flex justify-center bg-muted/50 p-8 rounded-lg">
        <div className="w-[343px]">
          <WouliEventCard
            event={unifiedEvent}
            variant="swipe"
            onLike={handleMockInteraction}
            onParticipate={handleMockInteraction}
            onDislike={handleMockInteraction}
            onShare={handleMockInteraction}
            isLiked={false}
            isParticipating={false}
            className="shadow-2xl"
          />
        </div>
      </div>

      {/* Admin Actions */}
      <div className="flex gap-3 justify-center pt-4 border-t">
        {onEdit && (
          <Button
            onClick={() => onEdit(event)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Modifier
          </Button>
        )}
        
        {onHistory && (
          <Button
            onClick={() => onHistory(event.id, event.title)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            Historique
          </Button>
        )}
        
        {onStats && event.status === 'active' && (
          <Button
            onClick={() => onStats(event.id)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Statistiques
          </Button>
        )}
      </div>

      {/* Admin Info */}
      <div className="bg-card border rounded-lg p-4 space-y-2 text-sm">
        <div><span className="font-medium">ID:</span> {event.id}</div>
        <div><span className="font-medium">Soumis le:</span> {new Date(event.created_at).toLocaleString('fr-FR')}</div>
        {event.submitter_email && (
          <div><span className="font-medium">Par:</span> {event.submitter_email}</div>
        )}
        {event.validated_at && (
          <div><span className="font-medium">Validé le:</span> {new Date(event.validated_at).toLocaleString('fr-FR')}</div>
        )}
      </div>
    </div>
  );
};