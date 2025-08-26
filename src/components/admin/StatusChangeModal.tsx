
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StatusChangeModalProps {
  eventIds: string[];
  currentStatus: string;
  targetStatus: string;
  onClose: () => void;
  onSuccess: () => void;
}

const StatusChangeModal = ({ eventIds, currentStatus, targetStatus, onClose, onSuccess }: StatusChangeModalProps) => {
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const getStatusInfo = (status: string) => {
    const configs: Record<string, any> = {
      pending: { icon: <Clock className="w-4 h-4" />, label: 'En attente', color: 'text-orange-600' },
      active: { icon: <CheckCircle className="w-4 h-4" />, label: 'Validé', color: 'text-green-600' },
      rejected: { icon: <XCircle className="w-4 h-4" />, label: 'Rejeté', color: 'text-red-600' }
    };
    return configs[status] || { icon: <RotateCcw className="w-4 h-4" />, label: status, color: 'text-gray-600' };
  };

  const getActionLabel = () => {
    if (currentStatus === 'pending' && targetStatus === 'active') return 'Valider';
    if (currentStatus === 'pending' && targetStatus === 'rejected') return 'Rejeter';
    if (currentStatus === 'active' && targetStatus === 'pending') return 'Remettre en attente';
    if (currentStatus === 'rejected' && targetStatus === 'pending') return 'Remettre en attente';
    return 'Changer le statut';
  };

  const handleConfirm = async () => {
    setProcessing(true);
    try {
      if (eventIds.length === 1) {
        await supabase.rpc('admin_set_event_status', {
          p_event_id: eventIds[0],
          p_status: targetStatus,
          p_reason: reason || null
        });
      } else {
        await supabase.rpc('admin_bulk_set_event_status', {
          p_event_ids: eventIds,
          p_status: targetStatus,
          p_reason: reason || null
        });
      }

      toast({
        title: "✅ Statut modifié",
        description: `${eventIds.length} événement(s) ${getActionLabel().toLowerCase()}(s)`
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erreur changement statut:', error);
      toast({
        title: "Erreur",
        description: "Impossible de changer le statut",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const currentInfo = getStatusInfo(currentStatus);
  const targetInfo = getStatusInfo(targetStatus);

  return (
    <Dialog open={eventIds.length > 0} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
            {getActionLabel()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-2">
              {eventIds.length} événement(s) sélectionné(s)
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <div className={`flex items-center gap-2 ${currentInfo.color}`}>
                {currentInfo.icon}
                <span className="font-medium">{currentInfo.label}</span>
              </div>
              
              <span className="text-muted-foreground">→</span>
              
              <div className={`flex items-center gap-2 ${targetInfo.color}`}>
                {targetInfo.icon}
                <span className="font-medium">{targetInfo.label}</span>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="reason">Raison (optionnelle)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Pourquoi ce changement de statut ?"
              rows={3}
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Annuler
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={processing}
            className="flex-1"
            variant={targetStatus === 'rejected' ? 'destructive' : 'default'}
          >
            {processing ? 'Traitement...' : `${getActionLabel()}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StatusChangeModal;
