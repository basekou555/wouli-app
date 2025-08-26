
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, AlertCircle } from 'lucide-react';

interface EventModerationHistoryProps {
  eventId: string | null;
  eventTitle: string;
  onClose: () => void;
}

const EventModerationHistory = ({ eventId, eventTitle, onClose }: EventModerationHistoryProps) => {
  if (!eventId) return null;

  return (
    <Dialog open={!!eventId} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Historique de modération
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {eventTitle}
          </p>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <div className="text-muted-foreground">
              <p className="font-medium">Historique de modération temporairement indisponible</p>
              <p className="text-sm mt-2">
                Cette fonctionnalité sera disponible prochainement.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default EventModerationHistory;
