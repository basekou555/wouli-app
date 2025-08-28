import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Link2, Share2 } from 'lucide-react';
import { UnifiedEvent } from '@/types/unified';
import { useToast } from '@/hooks/use-toast';

interface QuickActionsProps {
  event: UnifiedEvent;
  onShare?: () => void;
  className?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({ event, onShare, className = '' }) => {
  const { toast } = useToast();

  const handleAddToCalendar = () => {
    try {
      const startDate = new Date(`${event.date}${event.time ? `T${event.time}` : ''}`);
      const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // +2 hours
      
      const calendarData = {
        title: event.title,
        start: startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
        end: endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
        location: event.venue || event.location || '',
        description: event.description || ''
      };

      const url = `data:text/calendar;charset=utf8,BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${calendarData.start}
DTEND:${calendarData.end}
SUMMARY:${calendarData.title}
LOCATION:${calendarData.location}
DESCRIPTION:${calendarData.description}
END:VEVENT
END:VCALENDAR`;

      const link = document.createElement('a');
      link.href = url;
      link.download = `${event.title}.ics`;
      link.click();

      toast({
        title: "📅 Événement ajouté",
        description: "L'événement a été téléchargé dans votre calendrier"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'événement au calendrier",
        variant: "destructive"
      });
    }
  };

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/events/${event.id}`;
      await navigator.clipboard.writeText(url);
      
      toast({
        title: "🔗 Lien copié",
        description: "Le lien de l'événement a été copié"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien",
        variant: "destructive"
      });
    }
  };

  return (
    <div className={`flex gap-1 ${className}`}>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleAddToCalendar}
        className="h-8 w-8 p-0 hover:bg-muted"
      >
        <Calendar className="w-4 h-4" />
      </Button>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={handleCopyLink}
        className="h-8 w-8 p-0 hover:bg-muted"
      >
        <Link2 className="w-4 h-4" />
      </Button>
      
      {onShare && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onShare}
          className="h-8 w-8 p-0 hover:bg-muted"
        >
          <Share2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

export default QuickActions;