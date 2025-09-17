import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check, X, Edit, Eye, History, MoreHorizontal, 
  Calendar, MapPin, Euro, ExternalLink, Instagram 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PendingEvent } from '@/hooks/utils/adminEventMappers';
import { getCategoryById } from '@/data/wouliCategories';

interface AdminEventTableRowProps {
  event: PendingEvent;
  isSelected: boolean;
  onSelect: (eventId: string) => void;
  onPreview: (event: PendingEvent) => void;
  onEdit: (event: PendingEvent) => void;
  onHistory: (eventId: string, eventTitle: string) => void;
  onStatusChange: (eventIds: string[], currentStatus: string, targetStatus: string) => void;
  calculateScore: (event: PendingEvent) => number;
  getScoreColor: (score: number) => string;
}

export const AdminEventTableRow: React.FC<AdminEventTableRowProps> = ({
  event,
  isSelected,
  onSelect,
  onPreview,
  onEdit,
  onHistory,
  onStatusChange,
  calculateScore,
  getScoreColor
}) => {
  const category = getCategoryById(event.category);
  const score = calculateScore(event);
  
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
      rejected: { variant: 'destructive', label: '❌ Rejeté' }
    };
    const config = variants[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
  };

  return (
    <TableRow className="group hover:bg-muted/50">
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
              <h4 className="font-semibold text-sm line-clamp-2 text-foreground">
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

      {/* Score & Statut */}
      <TableCell className="text-center">
        <div className="space-y-2">
          <div className={`text-lg font-bold ${getScoreColor(score)}`}>
            {score}/10
          </div>
          {getStatusBadge(event.status)}
        </div>
      </TableCell>

      {/* Actions rapides */}
      <TableCell className="w-32">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onPreview(event)}
            className="h-8 w-8 p-0"
          >
            <Eye className="w-4 h-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {/* Actions contextuelles selon le statut */}
              {event.status === 'pending' && (
                <>
                  <DropdownMenuItem 
                    onClick={() => onStatusChange([event.id], 'pending', 'active')}
                    className="text-green-600"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Valider
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onStatusChange([event.id], 'pending', 'rejected')}
                    className="text-red-600"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Rejeter
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              
              {event.status !== 'pending' && (
                <>
                  <DropdownMenuItem 
                    onClick={() => onStatusChange([event.id], event.status, 'pending')}
                  >
                    <History className="w-4 h-4 mr-2" />
                    Remettre en attente
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              
              <DropdownMenuItem onClick={() => onEdit(event)}>
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => onHistory(event.id, event.title)}>
                <History className="w-4 h-4 mr-2" />
                Historique
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
};