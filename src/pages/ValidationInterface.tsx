
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, MapPin, Euro, ExternalLink, Check, X, Clock, Filter, RefreshCw, 
  AlertCircle, Instagram, Edit, RotateCcw, History, ArrowUpDown 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import AdminProfileChecker from '@/components/AdminProfileChecker';
import { WOULI_CATEGORIES, getCategoryById } from '@/data/wouliCategories';
import EventEditModal from '@/components/admin/EventEditModal';
import EventModerationHistory from '@/components/admin/EventModerationHistory';
import StatusChangeModal from '@/components/admin/StatusChangeModal';

interface PendingEvent {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string;
  address: string | null;
  category: string;
  price: number | null;
  external_url: string | null;
  submitter_email: string | null;
  status: string;
  created_at: string;
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
  const [stats, setStats] = useState<EventStats>({
    pending: 0,
    active: 0,
    rejected: 0,
    todayValidated: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
    fetchStats();
    
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
          fetchStats();
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
        .order('created_at', { ascending: false });

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

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [pending, active, rejected, todayValidated] = await Promise.all([
        supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
        supabase.from('events').select('*', { count: 'exact', head: true })
          .eq('status', 'active')
          .gte('validated_at', `${today}T00:00:00.000Z`)
      ]);

      setStats({
        pending: pending.count || 0,
        active: active.count || 0,
        rejected: rejected.count || 0,
        todayValidated: todayValidated.count || 0
      });
    } catch (error) {
      console.error('Erreur fetch stats:', error);
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
    fetchStats();
    setSelectedIds(new Set());
  };

  // Utility functions
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: 'secondary', label: '⏳ En attente' },
      active: { variant: 'default', label: '✅ Validé' },
      rejected: { variant: 'destructive', label: '❌ Rejeté' }
    };
    const config = variants[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

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
        <div className="max-w-7xl mx-auto px-4 py-6">
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
              onClick={() => {
                fetchEvents();
                fetchStats();
              }}
              variant="outline"
              size="icon"
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Stats rapides */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
              <div className="text-sm text-orange-700">En attente</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-green-700">Validés</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-red-700">Rejetés</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">+{stats.todayValidated}</div>
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
            <TabsTrigger value="pending">En attente ({stats.pending})</TabsTrigger>
            <TabsTrigger value="active">Validés ({stats.active})</TabsTrigger>
            <TabsTrigger value="rejected">Rejetés ({stats.rejected})</TabsTrigger>
            <TabsTrigger value="all">Tous ({events.length})</TabsTrigger>
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

            {/* Tableau des événements */}
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
                      <TableHead className="w-12"></TableHead>
                      <TableHead className="w-32">Image</TableHead>
                      <TableHead>Événement</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.map(event => (
                      <TableRow key={event.id} className="hover:bg-muted/50">
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(event.id)}
                            onChange={() => handleSelect(event.id)}
                            className="w-5 h-5 text-purple-600 rounded"
                          />
                        </TableCell>
                        <TableCell>
                          <img
                            src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'}
                            alt={event.title}
                            className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-90"
                            onClick={() => setShowDetails(event)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <h3 className="font-semibold text-foreground mb-1">
                              {event.title}
                            </h3>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                {formatEventDate(event.date)} à {formatEventTime(event.date)}
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                {event.location}
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Euro className="w-4 h-4" />
                                {formatPrice(event.price)}
                              </div>
                            </div>
                            <div className="mt-2 flex gap-2">
                              {getStatusBadge(event.status)}
                              <Badge variant="secondary">
                                {getCategoryById(event.category)?.icon} {getCategoryById(event.category)?.name || event.category}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {event.description}
                          </p>
                          <div className="mt-2 flex gap-2">
                            {event.external_url && (
                              <a
                                href={event.external_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                              >
                                {event.external_url.includes('instagram.com') ? (
                                  <Instagram className="w-3 h-3" />
                                ) : (
                                  <ExternalLink className="w-3 h-3" />
                                )}
                                {getLinkLabel(event.external_url)}
                              </a>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className={`text-2xl font-bold ${getScoreColor(calculateScore(event))}`}>
                            {calculateScore(event)}
                          </div>
                          <div className="text-xs text-muted-foreground">/ 10</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {/* Actions de statut */}
                            <div className="flex gap-1">
                              {event.status === 'pending' && (
                                <>
                                  <Button
                                    onClick={() => handleStatusChange([event.id], 'pending', 'active')}
                                    size="icon"
                                    variant="ghost"
                                    className="text-green-600 hover:bg-green-50"
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    onClick={() => handleStatusChange([event.id], 'pending', 'rejected')}
                                    size="icon"
                                    variant="ghost"
                                    className="text-red-600 hover:bg-red-50"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              
                              {event.status === 'active' && (
                                <Button
                                  onClick={() => handleStatusChange([event.id], 'active', 'pending')}
                                  size="icon"
                                  variant="ghost"
                                  className="text-orange-600 hover:bg-orange-50"
                                  title="Remettre en attente"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </Button>
                              )}
                              
                              {event.status === 'rejected' && (
                                <Button
                                  onClick={() => handleStatusChange([event.id], 'rejected', 'pending')}
                                  size="icon"
                                  variant="ghost"
                                  className="text-orange-600 hover:bg-orange-50"
                                  title="Remettre en attente"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                            
                            {/* Actions générales */}
                            <div className="flex gap-1">
                              <Button
                                onClick={() => setEditingEvent(event)}
                                size="icon"
                                variant="ghost"
                                className="text-blue-600 hover:bg-blue-50"
                                title="Modifier"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => {
                                  setHistoryEventId(event.id);
                                  setHistoryEventTitle(event.title);
                                }}
                                size="icon"
                                variant="ghost"
                                className="text-purple-600 hover:bg-purple-50"
                                title="Historique"
                              >
                                <History className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => setShowDetails(event)}
                                size="icon"
                                variant="ghost"
                                className="text-gray-600 hover:bg-gray-50"
                                title="Détails"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <EventEditModal
        event={editingEvent}
        onClose={() => setEditingEvent(null)}
        onSuccess={() => {
          fetchEvents();
          fetchStats();
        }}
      />

      <EventModerationHistory
        eventId={historyEventId}
        eventTitle={historyEventTitle}
        onClose={() => {
          setHistoryEventId(null);
          setHistoryEventTitle('');
        }}
      />

      <StatusChangeModal
        eventIds={statusChange.eventIds}
        currentStatus={statusChange.currentStatus}
        targetStatus={statusChange.targetStatus}
        onClose={() => setStatusChange({ eventIds: [], currentStatus: '', targetStatus: '' })}
        onSuccess={onStatusChangeSuccess}
      />

      {/* Modal détails (inchangé) */}
      {showDetails && (
        <Dialog open={!!showDetails} onOpenChange={() => setShowDetails(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img 
                src={showDetails.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'} 
                alt={showDetails.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
            
            <DialogHeader>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <DialogTitle className="text-2xl font-bold">{showDetails.title}</DialogTitle>
                  <p className="text-muted-foreground mt-1">
                    {showDetails.submitter_email && `Proposé par : ${showDetails.submitter_email}`}
                  </p>
                  <div className="mt-2">
                    {getStatusBadge(showDetails.status)}
                  </div>
                </div>
                <span className={`text-2xl font-bold ${getScoreColor(calculateScore(showDetails))}`}>
                  {calculateScore(showDetails)}/10
                </span>
              </div>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-5 h-5" />
                <span>{formatEventDate(showDetails.date)} à {formatEventTime(showDetails.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-5 h-5" />
                <span>{showDetails.location}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Euro className="w-5 h-5" />
                <span>{formatPrice(showDetails.price)}</span>
              </div>
            </div>
            
            {showDetails.description && (
              <div className="bg-muted p-4 rounded-lg mb-6">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{showDetails.description}</p>
              </div>
            )}
            
            {showDetails.external_url && (
              <div className="flex gap-2 mb-6">
                <a
                  href={showDetails.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80"
                >
                  {showDetails.external_url.includes('instagram.com') ? (
                    <Instagram className="w-5 h-5" />
                  ) : (
                    <ExternalLink className="w-5 h-5" />
                  )}
                  {getLinkLabel(showDetails.external_url)}
                </a>
              </div>
            )}
            
            <div className="flex gap-2 pt-6 border-t">
              <Button
                onClick={() => setEditingEvent(showDetails)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Edit className="w-5 h-5 mr-2" />
                Modifier
              </Button>
              <Button
                onClick={() => {
                  setHistoryEventId(showDetails.id);
                  setHistoryEventTitle(showDetails.title);
                }}
                variant="outline"
                className="flex-1"
              >
                <History className="w-5 h-5 mr-2" />
                Historique
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ValidationInterface;
