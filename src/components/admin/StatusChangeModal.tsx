
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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

// Raisons de rejet en accès rapide : un clic = rejet immédiat avec ce motif.
// Les 3 premières sont celles demandées ; les suivantes couvrent les cas fréquents à Lyon.
const REJECT_REASONS: { value: string; icon: string }[] = [
  { value: 'Date passée', icon: '📅' },
  { value: "Ce n'est pas un événement", icon: '🚫' },
  { value: 'Doublon', icon: '🔁' },
  { value: 'Hors Lyon', icon: '📍' },
  { value: 'Infos insuffisantes', icon: '✂️' },
  { value: 'Pub / spam', icon: '📢' },
];

const StatusChangeModal = ({ eventIds, currentStatus, targetStatus, onClose, onSuccess }: StatusChangeModalProps) => {
  const [reason, setReason] = useState('');
  const [showOther, setShowOther] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();
  const isReject = targetStatus === 'rejected';

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

  const handleConfirm = async (finalReason?: string) => {
    const usedReason = (finalReason ?? reason).trim();
    setProcessing(true);
    try {
      // Utiliser les fonctions RPC existantes selon le statut cible
      for (const eventId of eventIds) {
        if (targetStatus === 'active') {
          await supabase.rpc('approve_pending_event', { p_event_id: eventId });
        } else if (targetStatus === 'rejected') {
          await supabase.rpc('reject_pending_event', { p_event_id: eventId });
        } else {
          // Pour remettre en attente, mettre à jour directement le statut
          await supabase
            .from('events')
            .update({
              status: 'pending',
              validated_at: null,
              validated_by: null
            })
            .eq('id', eventId);
        }
      }

      toast({
        title: "✅ Statut modifié",
        description: `${eventIds.length} événement(s) ${getActionLabel().toLowerCase()}(s)${isReject && usedReason ? ` — ${usedReason}` : ''}`
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

          {isReject ? (
            // Rejet : un clic sur une raison rejette immédiatement (pas de saisie).
            <div className="space-y-2">
              <Label>Raison du rejet</Label>
              <div className="grid grid-cols-1 gap-2">
                {REJECT_REASONS.map((r) => (
                  <Button
                    key={r.value}
                    variant="outline"
                    disabled={processing}
                    onClick={() => handleConfirm(r.value)}
                    className="justify-start h-auto py-2.5 text-sm font-normal hover:border-red-300 hover:bg-red-50"
                  >
                    <span className="mr-2 text-base">{r.icon}</span> {r.value}
                  </Button>
                ))}

                {!showOther ? (
                  <Button
                    variant="outline"
                    disabled={processing}
                    onClick={() => setShowOther(true)}
                    className="justify-start h-auto py-2.5 text-sm font-normal"
                  >
                    <span className="mr-2 text-base">✏️</span> Autre…
                  </Button>
                ) : (
                  <div className="space-y-2 rounded-lg border p-3">
                    <Textarea
                      id="reason"
                      autoFocus
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Préciser la raison…"
                      rows={2}
                    />
                    <Button
                      onClick={() => handleConfirm(reason || 'Autre')}
                      disabled={processing}
                      variant="destructive"
                      className="w-full"
                    >
                      {processing ? 'Traitement...' : 'Rejeter'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
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
          )}
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Annuler
          </Button>
          {/* En mode rejet, chaque raison déclenche déjà l'action : pas de bouton de confirmation global. */}
          {!isReject && (
            <Button
              onClick={() => handleConfirm()}
              disabled={processing}
              className="flex-1"
            >
              {processing ? 'Traitement...' : `${getActionLabel()}`}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StatusChangeModal;
