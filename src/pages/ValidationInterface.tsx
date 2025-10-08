import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, MapPin, Euro, ExternalLink, Check, X, Clock, Filter, RefreshCw, 
  AlertCircle, Instagram, Edit, RotateCcw, History, ArrowUpDown, Sparkles 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getProxiedImageUrl, handleImageError } from '@/utils/corsProxyHelpers';
import AdminProfileChecker from '@/components/AdminProfileChecker';
import { WOULI_CATEGORIES, getCategoryById } from '@/data/wouliCategories';
import EventEditModal from '@/components/admin/EventEditModal';
import EventModerationHistory from '@/components/admin/EventModerationHistory';
import StatusChangeModal from '@/components/admin/StatusChangeModal';
import EnhanceWithAIModal from '@/components/admin/EnhanceWithAIModal';
import { getEventStatus } from '@/utils/eventStatus';
import { AdminEventPreview } from '@/components/admin/AdminEventPreview';
import { AdminEventTableRow } from '@/components/admin/AdminEventTableRow';

interface PendingEvent {
  id: string;
  title: string;
  description: string | null;
  date: string;
  end_time?: string;
  location: string;
  address: string | null;
  category: string;
  price: number | null;
  external_url: string | null;
  submitter_email: string | null;
  status: string;
  created_at: string;
  validated_at?: string;
  image_url: string | null;
}

interface EventStats {
  pending: number;
  active: number;
  rejected: number;
  todayValidated: number;
}

const ValidationInterface = () => {
  const [events, setEvents] = useState<PendingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [showDetails, setShowDetails] = useState<PendingEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<PendingEvent | null>(null);
  const [historyEventId, setHistoryEventId] = useState<string | null>(null);
  const [historyEventTitle, setHistoryEventTitle] = useState<string>('');
  const [statusChange, setStatusChange] = useState<{
    eventIds: string[];
    currentStatus: string;
    targetStatus: string;
  }>({ eventIds: [], currentStatus: '', targetStatus: '' });
  const [enhanceWithAI, setEnhanceWithAI] = useState<PendingEvent[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
    
    // Realtime subscription sur la table events
    const channel = supabase
      .channel('events_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events'
        },
        () => {
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .in('status', ['pending', 'active', 'rejected'])
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('❌ Erreur fetch events:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les événements",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Actions rapides (legacy - pour compatibilité)
  const handleApprove = async (eventIds: string | string[]) => {
    const ids = Array.isArray(eventIds) ? eventIds : [eventIds];
    setStatusChange({
      eventIds: ids,
      currentStatus: 'pending',
      targetStatus: 'active'
    });
  };

  const handleReject = async (eventIds: string | string[]) => {
    const ids = Array.isArray(eventIds) ? eventIds : [eventIds];
    setStatusChange({
      eventIds: ids,
      currentStatus: 'pending',
      targetStatus: 'rejected'
    });
  };

  const handleStatusChange = (eventIds: string[], currentStatus: string, targetStatus: string) => {
    setStatusChange({ eventIds, currentStatus, targetStatus });
  };

  const onStatusChangeSuccess = () => {
    fetchEvents();
    setSelectedIds(new Set());
  };

  // Utility functions
  const calculateScore = (event: PendingEvent) => {
    let score = 0;
    if (event.image_url) score += 2;
    if (event.external_url) score += 2;
    if (event.description && event.description.length > 100) score += 2;
    if (event.price !== null) score += 2;
    if (new Date(event.date) > new Date()) score += 2;
    return score;
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleSelectAll = () => {
    const filtered = getFilteredEvents();
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(e => e.id)));
    }
  };

  const handleSelect = (eventId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(eventId)) {
      newSelected.delete(eventId);
    } else {
      newSelected.add(eventId);
    }
    setSelectedIds(newSelected);
  };

  const getFilteredEvents = () => {
    return events
      .filter(event => {
        // Exclure les événements archivés par statut ou par temporalité
        if (event.status === 'archived' || getEventStatus(event) === 'archived') return false;
        if (activeTab !== 'all' && event.status !== activeTab) return false;
        if (filter !== 'all' && event.category !== filter) return false;
        return true;
      })
      .sort((a, b) => {
        switch(sortBy) {
          case 'date': return new Date(a.date).getTime() - new Date(b.date).getTime();
          case 'score': return calculateScore(b) - calculateScore(a);
          case 'created': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          default: return 0;
        }
      });
  };

  const filteredEvents = getFilteredEvents();

  const counts = React.useMemo(() => {
    const notArchived = events.filter(e => e.status !== 'archived' && getEventStatus(e) !== 'archived');
    const today = new Date().toISOString().split('T')[0];
    
    return {
      pending: notArchived.filter(e => e.status === 'pending').length,
      active: notArchived.filter(e => e.status === 'active').length,
      rejected: notArchived.filter(e => e.status === 'rejected').length,
      todayValidated: notArchived.filter(e => 
        e.status === 'active' && 
        e.validated_at && 
        e.validated_at.startsWith(today)
      ).length,
      // Filtered counts for tabs
      scopedPending: (filter === 'all' ? notArchived : notArchived.filter(e => e.category === filter)).filter(e => e.status === 'pending').length,
      scopedActive: (filter === 'all' ? notArchived : notArchived.filter(e => e.category === filter)).filter(e => e.status === 'active').length,
      scopedRejected: (filter === 'all' ? notArchived : notArchived.filter(e => e.category === filter)).filter(e => e.status === 'rejected').length,
      scopedAll: (filter === 'all' ? notArchived : notArchived.filter(e => e.category === filter)).length,
    };
  }, [events, filter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement des événements..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header avec stats */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Validation des Événements
              </h1>
              <p className="text-muted-foreground mt-1">
                Modération complète • {new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>
            
            <Button
              onClick={fetchEvents}
              variant="outline"
              size="icon"
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Stats rapides */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">{counts.pending}</div>
              <div className="text-sm text-orange-700">En attente</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">{counts.active}</div>
              <div className="text-sm text-green-700">Validés</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">{counts.rejected}</div>
              <div className="text-sm text-red-700">Rejetés</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">+{counts.todayValidated}</div>
              <div className="text-sm text-purple-700">Aujourd'hui</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AdminProfileChecker />

        {/* Onglets par statut */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">En attente ({counts.scopedPending})</TabsTrigger>
            <TabsTrigger value="active">Validés ({counts.scopedActive})</TabsTrigger>
            <TabsTrigger value="rejected">Rejetés ({counts.scopedRejected})</TabsTrigger>
            <TabsTrigger value="all">Tous ({counts.scopedAll})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {/* Contrôles */}
            <div className="flex flex-wrap gap-4 items-center justify-between bg-card p-4 rounded-lg border">
              <div className="flex items-center gap-4">
                {/* Filtres catégories */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => setFilter('all')}
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                  >
                    Tous
                  </Button>
                  {WOULI_CATEGORIES.slice(0, 4).map((category) => (
                    <Button
                      key={category.id}
                      onClick={() => setFilter(category.id)}
                      variant={filter === category.id ? 'default' : 'outline'}
                      size="sm"
                    >
                      {category.icon} {category.name}
                    </Button>
                  ))}
                </div>
                
                {/* Tri */}
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1 border rounded-lg text-sm bg-background"
                >
                  <option value="date">Par date event</option>
                  <option value="score">Par score</option>
                  <option value="created">Plus récents</option>
                </select>
              </div>
              
              {/* Actions groupées */}
              <div className="flex gap-2">
                {selectedIds.size > 0 && (
                  <>
                    <span className="text-purple-600 font-medium px-3 py-2">
                      {selectedIds.size} sélectionné(s)
                    </span>
                    
                    {/* Actions selon l'onglet actif */}
                    {activeTab === 'pending' && (
                      <>
                        <Button
                          onClick={() => {
                            const selectedEvents = filteredEvents.filter(e => selectedIds.has(e.id));
                            setEnhanceWithAI(selectedEvents);
                          }}
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <Sparkles className="w-4 h-4 mr-1" />
                          Améliorer avec l'IA
                        </Button>
                        <Button
                          onClick={() => handleStatusChange(Array.from(selectedIds), 'pending', 'active')}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Valider
                        </Button>
                        <Button
                          onClick={() => handleStatusChange(Array.from(selectedIds), 'pending', 'rejected')}
                          size="sm"
                          variant="destructive"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Rejeter
                        </Button>
                      </>
                    )}
                    
                    {activeTab === 'active' && (
                      <Button
                        onClick={() => handleStatusChange(Array.from(selectedIds), 'active', 'pending')}
                        size="sm"
                        variant="outline"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Remettre en attente
                      </Button>
                    )}
                    
                    {activeTab === 'rejected' && (
                      <Button
                        onClick={() => handleStatusChange(Array.from(selectedIds), 'rejected', 'pending')}
                        size="sm"
                        variant="outline"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Remettre en attente
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Sélection globale */}
            {filteredEvents.length > 0 && (
              <div className="bg-card rounded-lg border p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredEvents.length}
                    onChange={handleSelectAll}
                    className="w-5 h-5 text-purple-600 rounded"
                  />
                  <span className="font-medium">Tout sélectionner ({filteredEvents.length})</span>
                </label>
              </div>
            )}

            {/* Tableau moderne des événements */}
            {processingId === 'bulk' ? (
              <div className="text-center py-12">
                <LoadingSpinner size="lg" text="Traitement en cours..." />
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="bg-card rounded-lg border p-12 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Aucun événement {activeTab === 'all' ? '' : activeTab === 'pending' ? 'en attente' : activeTab === 'active' ? 'validé' : 'rejeté'}
                </p>
              </div>
            ) : (
              <div className="bg-card rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedIds.size === filteredEvents.length}
                          onChange={handleSelectAll}
                          className="w-4 h-4 text-purple-600 rounded"
                        />
                      </TableHead>
                      <TableHead className="min-w-[300px]">Événement</TableHead>
                      <TableHead className="max-w-[200px]">Description</TableHead>
                      <TableHead className="text-center w-24">Score</TableHead>
                      <TableHead className="w-32">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.map((event) => (
                      <AdminEventTableRow
                        key={event.id}
                        event={event}
                        isSelected={selectedIds.has(event.id)}
                        onSelect={handleSelect}
                        onPreview={setShowDetails}
                        onEdit={setEditingEvent}
                        onHistory={(eventId, eventTitle) => {
                          setHistoryEventId(eventId);
                          setHistoryEventTitle(eventTitle);
                        }}
                        onStatusChange={handleStatusChange}
                        calculateScore={calculateScore}
                        getScoreColor={getScoreColor}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Preview Modal avec WouliEventCard */}
      <Dialog open={!!showDetails} onOpenChange={() => setShowDetails(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {showDetails && (
            <AdminEventPreview
              event={showDetails}
              onEdit={setEditingEvent}
              onHistory={(eventId, eventTitle) => {
                setHistoryEventId(eventId);
                setHistoryEventTitle(eventTitle);
                setShowDetails(null);
              }}
              onClose={() => setShowDetails(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal d'édition */}
      {editingEvent && (
        <EventEditModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSuccess={() => {
            fetchEvents();
            setEditingEvent(null);
          }}
        />
      )}

      {/* Modal historique */}
      {historyEventId && (
        <EventModerationHistory
          eventId={historyEventId}
          eventTitle={historyEventTitle}
          onClose={() => {
            setHistoryEventId(null);
            setHistoryEventTitle('');
          }}
        />
      )}

      {/* Modal changement de statut */}
      {statusChange.eventIds.length > 0 && (
        <StatusChangeModal
          eventIds={statusChange.eventIds}
          currentStatus={statusChange.currentStatus}
          targetStatus={statusChange.targetStatus}
          onClose={() => setStatusChange({ eventIds: [], currentStatus: '', targetStatus: '' })}
          onSuccess={onStatusChangeSuccess}
        />
      )}

      {/* Modal amélioration IA */}
      {enhanceWithAI.length > 0 && (
        <EnhanceWithAIModal
          events={enhanceWithAI}
          onClose={() => setEnhanceWithAI([])}
          onSuccess={() => {
            fetchEvents();
            setEnhanceWithAI([]);
          }}
        />
      )}
    </div>
  );
};

export default ValidationInterface;