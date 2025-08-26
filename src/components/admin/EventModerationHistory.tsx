
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, User, FileEdit, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ModerationLog {
  id: string;
  action: string;
  from_status: string | null;
  to_status: string | null;
  reason: string | null;
  admin_id: string;
  changed_fields: any;
  created_at: string;
}

interface EventModerationHistoryProps {
  eventId: string | null;
  eventTitle: string;
  onClose: () => void;
}

const EventModerationHistory = ({ eventId, eventTitle, onClose }: EventModerationHistoryProps) => {
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchLogs();
    }
  }, [eventId]);

  const fetchLogs = async () => {
    if (!eventId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('event_moderation_logs')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Erreur fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'approve': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'reject': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'unapprove':
      case 'unreject':
      case 'revert': return <RotateCcw className="w-4 h-4 text-orange-600" />;
      case 'edit': return <FileEdit className="w-4 h-4 text-blue-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      approve: 'Approuvé',
      reject: 'Rejeté',
      unapprove: 'Désapprouvé',
      unreject: 'Dé-rejeté',
      revert: 'Statut modifié',
      edit: 'Modifié'
    };
    return labels[action] || action;
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return null;
    
    const variants: Record<string, any> = {
      pending: { variant: 'secondary', label: 'En attente' },
      active: { variant: 'default', label: 'Validé' },
      rejected: { variant: 'destructive', label: 'Rejeté' }
    };
    
    const config = variants[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

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
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Chargement de l'historique...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune action de modération enregistrée
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.action)}
                      <span className="font-medium">
                        {getActionLabel(log.action)}
                      </span>
                      {log.from_status && log.to_status && (
                        <div className="flex items-center gap-2 text-sm">
                          {getStatusBadge(log.from_status)}
                          <span>→</span>
                          {getStatusBadge(log.to_status)}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(log.created_at)}
                    </div>
                  </div>

                  {log.reason && (
                    <div className="mb-2">
                      <span className="text-sm font-medium">Raison : </span>
                      <span className="text-sm text-muted-foreground">{log.reason}</span>
                    </div>
                  )}

                  {log.changed_fields && Object.keys(log.changed_fields).length > 0 && (
                    <div className="mt-2 p-2 bg-background rounded border">
                      <span className="text-xs font-medium text-muted-foreground">Champs modifiés :</span>
                      <div className="mt-1 text-xs">
                        {Object.entries(log.changed_fields).map(([field, value]) => (
                          <div key={field} className="flex gap-2">
                            <span className="font-medium">{field}:</span>
                            <span className="text-muted-foreground break-all">
                              {typeof value === 'string' ? value : JSON.stringify(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <User className="w-3 h-3" />
                    Admin: {log.admin_id}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default EventModerationHistory;
