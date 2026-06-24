import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Check, X, Edit, Eye, History, RotateCcw, FileEdit,
  Calendar, MapPin, Euro, ExternalLink, Instagram, Sparkles, Music, Mic2
} from 'lucide-react';
import { PendingEvent, ENERGY_META, isAIEnriched, aiConfidencePct } from '@/hooks/utils/adminEventMappers';
import { getCategoryById } from '@/data/wouliCategories';

// Libellés lisibles des drapeaux de revue posés par l'extraction IA (extract-event).
const REVIEW_FLAG_LABELS: Record<string, { label: string; cls: string }> = {
  date_passee: { label: 'Date passée', cls: 'border-red-300 text-red-700 bg-red-50' },
  date_incertaine: { label: 'Date incertaine', cls: 'border-amber-300 text-amber-700 bg-amber-50' },
  lieu_inconnu: { label: 'Lieu inconnu', cls: 'border-amber-300 text-amber-700 bg-amber-50' },
  confiance_basse: { label: 'Confiance basse', cls: 'border-amber-300 text-amber-700 bg-amber-50' },
};

const AMBER = 'border-amber-300 text-amber-700 bg-amber-50';

// Transforme manual_review_reason ("a,b") + needs_manual_image en badges affichables.
function getReviewFlags(event: PendingEvent): { code: string; label: string; cls: string }[] {
  const flags: { code: string; label: string; cls: string }[] = [];
  const reasons = (event.manual_review_reason ?? '')
    .split(',').map((s) => s.trim()).filter(Boolean);
  for (const code of reasons) {
    const meta = REVIEW_FLAG_LABELS[code];
    flags.push(meta ? { code, ...meta } : { code, label: code, cls: AMBER });
  }
  if (event.needs_manual_image) {
    flags.push({ code: 'needs_manual_image', label: 'Image à vérifier', cls: AMBER });
  }
  return flags;
}

interface AdminEventTableRowProps {
  event: PendingEvent;
  isSelected: boolean;
  isFocused?: boolean;
  onSelect: (eventId: string) => void;
  onPreview: (event: PendingEvent) => void;
  onEdit: (event: PendingEvent) => void;
  onProcessManualReview?: (event: PendingEvent) => void;
  onHistory: (eventId: string, eventTitle: string) => void;
  onStatusChange: (eventIds: string[], currentStatus: string, targetStatus: string) => void;
  onQuickApprove?: (eventId: string) => void;
  isProcessing?: boolean;
  calculateScore: (event: PendingEvent) => number;
  getScoreColor: (score: number) => string;
}

export const AdminEventTableRow: React.FC<AdminEventTableRowProps> = ({
  event,
  isSelected,
  isFocused = false,
  onSelect,
  onPreview,
  onEdit,
  onProcessManualReview,
  onHistory,
  onStatusChange,
  onQuickApprove,
  isProcessing = false,
  calculateScore,
  getScoreColor
}) => {
  const category = getCategoryById(event.category);
  const score = calculateScore(event);
  const confidence = aiConfidencePct(event);

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatPrice = (price: number | null) => {
    if (!price || price === 0) return 'Gratuit';
    return `${price}€`;
  };

  const getLinkLabel = (url: string | null) => {
    if (!url) return 'Lien externe';
    if (url.includes('instagram.com')) return 'Instagram';
    if (url.includes('shotgun') || url.includes('dice') || url.includes('eventbrite') || url.includes('billetterie')) return 'Billetterie';
    return 'Lien externe';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: 'secondary', label: '⏳ En attente' },
      active: { variant: 'default', label: '✅ Validé' },
      rejected: { variant: 'destructive', label: '❌ Rejeté' },
      manual_review: { variant: 'warning', label: '🔶 À traiter' }
    };
    const config = variants[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
  };

  return (
    <TableRow
      data-event-id={event.id}
      className={`group hover:bg-muted/50 ${isFocused ? 'ring-2 ring-inset ring-purple-400 bg-purple-50/40' : ''} ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {/* Sélection */}
      <TableCell className="w-12">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(event.id)}
          className="w-4 h-4 text-purple-600 rounded"
        />
      </TableCell>

      {/* Événement (Image + Info principale) */}
      <TableCell className="min-w-[300px]">
        <div className="flex gap-3 items-start">
          {/* Image 4:5 preview */}
          <div 
            className="w-16 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => onPreview(event)}
          >
            {event.image_url ? (
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
                <Eye className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Info principale */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 
                className="font-semibold text-sm line-clamp-2 text-foreground cursor-pointer hover:text-purple-600 transition-colors"
                onClick={() => onPreview(event)}
              >
                {event.title}
              </h4>
              <div className="flex items-center gap-1 flex-shrink-0">
                {category && (
                  <Badge variant="outline" className="text-xs">
                    {category.icon} {category.name}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatEventDate(event.date)} • {formatEventTime(event.date)}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-[120px]">{event.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Euro className="w-3 h-3" />
                {formatPrice(event.price)}
              </div>
            </div>

            {/* Drapeaux de revue IA + statut d'enrichissement */}
            {(() => {
              const flags = getReviewFlags(event);
              const enriched = isAIEnriched(event);
              const energy = event.energy ? ENERGY_META[event.energy] : null;
              const lineup = (event.lineup ?? []).filter(Boolean);
              const hasAIContent = enriched || energy || event.music_style || lineup.length;
              if (!flags.length && event.parsing_method === undefined && !hasAIContent) return null;
              return (
                <div className="mt-2 space-y-1">
                  {/* Ligne 1 : statut d'enrichissement + drapeaux de revue */}
                  <div className="flex flex-wrap items-center gap-1">
                    {enriched ? (
                      <Badge variant="outline" className="text-[10px] border-green-300 text-green-700 bg-green-50">
                        <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                        Enrichi IA{confidence !== null ? ` ${confidence}%` : ''}
                      </Badge>
                    ) : event.parsing_method === null ? (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground" title="Pas encore traité par l'extraction IA">
                        Brut
                      </Badge>
                    ) : null}
                    {flags.map((f) => (
                      <Badge key={f.code} variant="outline" className={`text-[10px] ${f.cls}`}>
                        {f.label}
                      </Badge>
                    ))}
                  </div>
                  {/* Ligne 2 : ce que l'IA a compris (évite d'ouvrir l'event pour décider) */}
                  {hasAIContent ? (
                    <div className="flex flex-wrap items-center gap-1">
                      {energy && (
                        <Badge variant="outline" className={`text-[10px] ${energy.cls}`}>
                          {energy.label}
                        </Badge>
                      )}
                      {event.music_style && (
                        <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
                          <Music className="w-2.5 h-2.5 mr-0.5" />
                          {event.music_style}
                        </Badge>
                      )}
                      {lineup.length > 0 && (
                        <Badge
                          variant="outline"
                          className="text-[10px] border-border text-muted-foreground"
                          title={lineup.join(', ')}
                        >
                          <Mic2 className="w-2.5 h-2.5 mr-0.5" />
                          {lineup.slice(0, 2).join(', ')}
                          {lineup.length > 2 ? ` +${lineup.length - 2}` : ''}
                        </Badge>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })()}
          </div>
        </div>
      </TableCell>

      {/* Description */}
      <TableCell className="max-w-[200px]">
        <div className="line-clamp-2 text-sm text-muted-foreground">
          {event.description || 'Aucune description'}
        </div>
        {event.external_url && (
          <div className="flex items-center gap-1 mt-1 text-xs text-blue-600">
            {event.external_url.includes('instagram.com') ? <Instagram className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />}
            <span className="truncate max-w-[100px]">{getLinkLabel(event.external_url)}</span>
          </div>
        )}
      </TableCell>

      {/* Confiance IA (primaire) + complétude (secondaire) + statut */}
      <TableCell className="text-center">
        <div className="space-y-2">
          {confidence !== null ? (
            <div>
              <div
                className={`text-lg font-bold ${
                  confidence >= 85 ? 'text-green-600' : confidence >= 65 ? 'text-yellow-600' : 'text-red-600'
                }`}
                title="Confiance de l'extraction IA"
              >
                {confidence}%
              </div>
              <div className="text-[10px] text-muted-foreground" title="Score de complétude des champs">
                complétude {score}/10
              </div>
            </div>
          ) : (
            <div className={`text-lg font-bold ${getScoreColor(score)}`} title="Score de complétude (événement non enrichi par l'IA)">
              {score}/10
            </div>
          )}
          {getStatusBadge(event.status)}
        </div>
      </TableCell>

      {/* Actions rapides - Boutons sur 2 lignes */}
      <TableCell className="w-auto min-w-[200px]">
        <div className="flex flex-col gap-1">
          {/* Ligne 1 : Modifier + Historique */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(event)}
              className="h-7 px-2 text-xs hover:bg-muted"
              title="Modifier l'événement"
            >
              <Edit className="w-3.5 h-3.5 sm:mr-1" />
              <span className="hidden sm:inline">Modifier</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onHistory(event.id, event.title)}
              className="h-7 px-2 text-xs hover:bg-muted"
              title="Voir l'historique"
            >
              <History className="w-3.5 h-3.5 sm:mr-1" />
              <span className="hidden sm:inline">Historique</span>
            </Button>
          </div>
          
          {/* Ligne 2 : Actions contextuelles selon statut */}
          <div className="flex items-center gap-1">
            {event.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => (onQuickApprove ? onQuickApprove(event.id) : onStatusChange([event.id], 'pending', 'active'))}
                  className="h-7 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                  title="Valider l'événement (raccourci : A)"
                >
                  <Check className="w-3.5 h-3.5 sm:mr-1" />
                  <span className="hidden sm:inline">Accepter</span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onStatusChange([event.id], 'pending', 'rejected')}
                  className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Rejeter l'événement"
                >
                  <X className="w-3.5 h-3.5 sm:mr-1" />
                  <span className="hidden sm:inline">Refuser</span>
                </Button>
              </>
            )}

            {event.status === 'manual_review' && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onProcessManualReview?.(event)}
                  className="h-7 px-2 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                  title="Créer les événements manuellement"
                >
                  <FileEdit className="w-3.5 h-3.5 sm:mr-1" />
                  <span className="hidden sm:inline">Traiter</span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onStatusChange([event.id], 'manual_review', 'archived')}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
                  title="Archiver sans traiter"
                >
                  <X className="w-3.5 h-3.5 sm:mr-1" />
                  <span className="hidden sm:inline">Ignorer</span>
                </Button>
              </>
            )}

            {(event.status === 'active' || event.status === 'rejected') && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onStatusChange([event.id], event.status, 'pending')}
                className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                title="Remettre en attente"
              >
                <RotateCcw className="w-3.5 h-3.5 sm:mr-1" />
                <span className="hidden sm:inline">Réactiver</span>
              </Button>
            )}
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
};