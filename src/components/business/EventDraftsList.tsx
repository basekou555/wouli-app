
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Trash2, Edit, Clock, Calendar } from 'lucide-react';
import { EventDraft } from '@/hooks/useEventDrafts';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface EventDraftsListProps {
  drafts: EventDraft[];
  onResume: (draft: EventDraft) => void;
  onDelete: (draftId: string) => void;
}

const EventDraftsList: React.FC<EventDraftsListProps> = ({ drafts, onResume, onDelete }) => {
  if (drafts.length === 0) {
    return null;
  }

  return (
    <Card className="border-amber-500/20 bg-amber-500/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="p-1.5 rounded-md bg-amber-500/10">
            <FileText className="h-4 w-4 text-amber-500" />
          </div>
          Brouillons ({drafts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="flex items-center justify-between p-3 bg-background rounded-lg border border-border/50 hover:border-amber-500/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm truncate">
                    {draft.title || 'Sans titre'}
                  </h4>
                  {!draft.title && (
                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                      Incomplet
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {draft.date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(draft.date).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(draft.savedAt), { addSuffix: true, locale: fr })}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onResume(draft)}
                  className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Reprendre
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(draft.id)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventDraftsList;
