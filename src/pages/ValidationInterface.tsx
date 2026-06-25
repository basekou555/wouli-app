import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Calendar, MapPin, Euro, ExternalLink, Check, X, Clock, Filter, RefreshCw, 
  AlertCircle, Instagram, Edit, RotateCcw, History, ArrowUpDown, Sparkles, Search,
  CheckCircle, Image as ImageIcon, Loader2, Flame
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getProxiedImageUrl, handleImageError } from '@/utils/corsProxyHelpers';
import { WOULI_CATEGORIES, getCategoryById, getNextCategoryId } from '@/data/wouliCategories';
import { nextEnergy } from '@/hooks/utils/adminEventMappers';
import EventEditModal from '@/components/admin/EventEditModal';
import EventModerationHistory from '@/components/admin/EventModerationHistory';
import StatusChangeModal from '@/components/admin/StatusChangeModal';
import EnhanceWithAIModal from '@/components/admin/EnhanceWithAIModal';
import { getEventStatus } from '@/utils/eventStatus';
import { AdminEventPreview } from '@/components/admin/AdminEventPreview';
import { AdminEventTableRow } from '@/components/admin/AdminEventTableRow';
import { ValidationWorkload } from '@/components/admin/ValidationWorkload';
import { DuplicatesPanel, DuplicatePair, DuplicateEvent } from '@/components/admin/DuplicatesPanel';
import { VenuesPanel, UnknownVenue, VenueProfile } from '@/components/admin/VenuesPanel';
import { useAdminStats } from '@/hooks/useAdminStats';

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
  rejection_reason?: string | null;
  account_username?: string;
  event_type?: string;
  manual_review_reason?: string;
  parsing_method?: string | null;
  parsing_confidence?: number | null;
  needs_manual_image?: boolean | null;
  // Contenu structuré IA (extract-event) — renvoyé par select('*'), absent des types générés.
  energy?: string | null;
  subtitle?: string | null;
  music_style?: string | null;
  tags?: string[] | null;
  lineup?: string[] | null;
  venue_category?: string | null;
  color_card?: string | null;
}

// Un event mérite un coup d'œil si l'IA a posé un drapeau ou n'a pas d'image exploitable.
const hasReviewFlags = (e: PendingEvent) =>
  !!e.manual_review_reason?.trim() || !!e.needs_manual_image;

const ValidationInterface = () => {
  const [events, setEvents] = useState<PendingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [activeTab, setActiveTab] = useState<string>('urgent');
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
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [bulkApproving, setBulkApproving] = useState(false);
  const [bulkRejecting, setBulkRejecting] = useState(false);
  // Total réel des événements en attente déjà passés (toute la base, pas la page chargée).
  const [pastPendingCount, setPastPendingCount] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const EVENTS_PER_PAGE = 20;
  const { toast } = useToast();

  // Utiliser useAdminStats pour les compteurs
  const { data: stats, isLoading: statsLoading } = useAdminStats();

  // State pour modale Manual Review
  const [processManualReview, setProcessManualReview] = useState<PendingEvent | null>(null);
  const [manualEventCount, setManualEventCount] = useState(1);
  const [manualEvents, setManualEvents] = useState<Array<{
    title: string;
    date: string;
    time: string;
    description: string;
    price: number;
  }>>([]);

  // State pour erreurs scraper
  const [scraperErrors, setScraperErrors] = useState<any[]>([]);
  const [loadingErrors, setLoadingErrors] = useState(false);
  const [retryingError, setRetryingError] = useState<string | null>(null);

  // State pour doublons potentiels
  const [duplicatePairs, setDuplicatePairs] = useState<DuplicatePair[]>([]);
  const [loadingDuplicates, setLoadingDuplicates] = useState(false);

  const loadDuplicates = async () => {
    setLoadingDuplicates(true);
    try {
      const { data, error } = await supabase.rpc('find_duplicate_pairs', { p_days: 400 });
      if (error) throw error;
      setDuplicatePairs((data as DuplicatePair[]) || []);
    } catch (error) {
      console.error('Erreur détection doublons:', error);
    } finally {
      setLoadingDuplicates(false);
    }
  };

  // Compte (côté serveur) tous les événements pending à date passée, indépendamment de la pagination.
  const loadPastPendingCount = async () => {
    try {
      const { count, error } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .lt('date', new Date().toISOString());
      if (error) throw error;
      setPastPendingCount(count ?? 0);
    } catch (error) {
      console.error('Erreur comptage événements passés:', error);
    }
  };

  // State pour lieux hors registre
  const [unknownVenues, setUnknownVenues] = useState<UnknownVenue[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [classifyingVenue, setClassifyingVenue] = useState<string | null>(null);

  const loadUnknownVenues = async () => {
    setLoadingVenues(true);
    try {
      const { data, error } = await supabase.rpc('unknown_venues', { p_days: 400 });
      if (error) throw error;
      setUnknownVenues((data as UnknownVenue[]) || []);
    } catch (error) {
      console.error('Erreur chargement lieux:', error);
    } finally {
      setLoadingVenues(false);
    }
  };

  const handleClassifyVenue = async (location: string, profile: VenueProfile) => {
    setClassifyingVenue(location);
    try {
      const { error } = await supabase.rpc('classify_venue', { p_name: location, p_profile: profile });
      if (error) throw error;
      // Le lieu sort de la liste des inconnus.
      setUnknownVenues((prev) => prev.filter((v) => v.location !== location));
      toast({ title: 'Lieu classé', description: `"${location}" → ${profile}` });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Classement impossible';
      toast({ title: 'Erreur', description: message, variant: 'destructive' });
    } finally {
      setClassifyingVenue(null);
    }
  };

  // Initialiser les formulaires quand la modale s'ouvre
  useEffect(() => {
    if (processManualReview) {
      const initialForms = Array.from({ length: manualEventCount }, () => ({
        title: '',
        date: new Date().toISOString().split('T')[0],
        time: '22:00',
        description: '',
        price: 0
      }));
      setManualEvents(initialForms);
    }
  }, [processManualReview, manualEventCount]);

  // Filtres avancés
  const [searchQuery, setSearchQuery] = useState('');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [enrichmentFilter, setEnrichmentFilter] = useState<'all' | 'enriched' | 'raw' | 'low'>('all');
  const [accounts, setAccounts] = useState<string[]>([]);

  // Seuil en dessous duquel un event enrichi mérite une vraie revue humaine.
  const LOW_CONFIDENCE_THRESHOLD = 0.65;
  // Seuil au-dessus duquel un event enrichi est candidat à la validation en lot.
  const HIGH_CONFIDENCE_THRESHOLD = 0.85;

  // Charger la liste des comptes Instagram uniques
  useEffect(() => {
    const loadAccounts = async () => {
      const { data } = await supabase
        .from('events')
        .select('account_username')
        .not('account_username', 'is', null);
      
      if (data) {
        const uniqueAccounts = [...new Set(data.map(e => e.account_username))].filter(Boolean) as string[];
        setAccounts(uniqueAccounts.sort());
      }
    };
    loadAccounts();
  }, []);

  // Charger les erreurs scraper
  const loadScraperErrors = async () => {
    setLoadingErrors(true);
    try {
      const { data, error } = await supabase
        .from('scraper_errors')
        .select('*')
        .eq('retry_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScraperErrors(data || []);
    } catch (error) {
      console.error('Erreur chargement scraper errors:', error);
    } finally {
      setLoadingErrors(false);
    }
  };

  // Mapper le tab vers le status pour la requête
  const getStatusForTab = (tab: string): string | string[] | null => {
    switch (tab) {
      case 'urgent':
        return 'manual_review';
      case 'pending':
        return 'pending';
      case 'active':
        return 'active';
      case 'rejected':
        return 'rejected';
      case 'all':
        return null; // Pas de filtre de statut, on récupère tout
      default:
        return 'pending';
    }
  };

  // Refs : le handler realtime est lié une seule fois ; sans refs sa closure figerait
  // les filtres. fetchEvents lit donc toujours les valeurs courantes via ces refs.
  const searchQueryRef = useRef(searchQuery);
  searchQueryRef.current = searchQuery;
  const accountFilterRef = useRef(accountFilter);
  accountFilterRef.current = accountFilter;
  const dateFilterRef = useRef(dateFilter);
  dateFilterRef.current = dateFilter;
  const enrichmentFilterRef = useRef(enrichmentFilter);
  enrichmentFilterRef.current = enrichmentFilter;
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;
  // Vrai pendant une validation/rejet : on suspend les refetch realtime pour éviter
  // la tempête de re-fetch (chaque mutation émet un évènement postgres_changes).
  const isMutatingRef = useRef(false);
  const realtimeDebounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    fetchEvents();
    loadScraperErrors();
    loadDuplicates();
    loadUnknownVenues();
    loadPastPendingCount();

    // Refetch realtime débouncé et suspendu pendant nos propres mutations.
    const scheduleEventsRefetch = () => {
      if (isMutatingRef.current) return;
      clearTimeout(realtimeDebounceRef.current);
      realtimeDebounceRef.current = setTimeout(() => fetchEvents(0, false), 400);
    };

    const eventsChannel = supabase
      .channel('events_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, scheduleEventsRefetch)
      .subscribe();

    const errorsChannel = supabase
      .channel('scraper_errors_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scraper_errors' }, () => loadScraperErrors())
      .subscribe();

    return () => {
      clearTimeout(realtimeDebounceRef.current);
      supabase.removeChannel(eventsChannel);
      supabase.removeChannel(errorsChannel);
    };
  }, [activeTab]);

  const fetchEvents = async (pageNum = 0, append = false) => {
    try {
      const start = pageNum * EVENTS_PER_PAGE;
      const end = start + EVENTS_PER_PAGE - 1;

      // Tous les filtres sont lus depuis les refs -> toute invocation (realtime inclus)
      // utilise les valeurs courantes, et les filtres portent sur TOUT le jeu (pas la page).
      const search = searchQueryRef.current;
      const account = accountFilterRef.current;
      const dateF = dateFilterRef.current;
      const enrichment = enrichmentFilterRef.current;
      const tab = activeTabRef.current;

      // Le total ne change pas entre les pages d'un même filtre : on ne le demande
      // qu'à la première page (économise une requête count par "charger plus").
      const wantCount = !append;
      let query = supabase
        .from('events')
        .select('*', wantCount ? { count: 'exact' } : undefined);

      // Recherche plein texte : cherche dans tous les statuts (sauf archivés).
      if (search.trim()) {
        const searchTerm = `%${search.trim()}%`;
        query = query.or(`title.ilike.${searchTerm},description.ilike.${searchTerm},location.ilike.${searchTerm},account_username.ilike.${searchTerm}`);
        query = query.neq('status', 'archived');
      } else {
        const statuses = getStatusForTab(tab);
        if (statuses === null) {
          query = query.neq('status', 'archived');
        } else if (Array.isArray(statuses)) {
          query = query.in('status', statuses);
        } else {
          query = query.eq('status', statuses);
        }
        // Actifs / rejetés : ne montrer que les événements à venir.
        if (tab === 'active' || tab === 'rejected') {
          query = query.gte('date', new Date().toISOString());
        }
      }

      // ---- Filtres avancés, désormais côté serveur ----
      if (account !== 'all') {
        query = query.eq('account_username', account);
      }
      if (enrichment === 'enriched') {
        query = query.eq('parsing_method', 'claude-vision-v1');
      } else if (enrichment === 'raw') {
        query = query.or('parsing_method.is.null,parsing_method.neq.claude-vision-v1');
      } else if (enrichment === 'low') {
        query = query
          .eq('parsing_method', 'claude-vision-v1')
          .or(`parsing_confidence.is.null,parsing_confidence.lt.${LOW_CONFIDENCE_THRESHOLD}`);
      }
      if (dateF !== 'all') {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (dateF === 'today') {
          const endOfToday = new Date(startOfToday);
          endOfToday.setDate(endOfToday.getDate() + 1);
          query = query.gte('date', startOfToday.toISOString()).lt('date', endOfToday.toISOString());
        } else if (dateF === 'week') {
          const weekLater = new Date(startOfToday);
          weekLater.setDate(weekLater.getDate() + 7);
          query = query.gte('date', startOfToday.toISOString()).lte('date', weekLater.toISOString());
        } else if (dateF === 'month') {
          const monthLater = new Date(startOfToday);
          monthLater.setMonth(monthLater.getMonth() + 1);
          query = query.gte('date', startOfToday.toISOString()).lte('date', monthLater.toISOString());
        }
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(start, end);

      if (error) throw error;

      const newEvents = (data || []) as PendingEvent[];

      if (append) {
        setEvents((prev) => {
          const existingIds = new Set(prev.map((e) => e.id));
          return [...prev, ...newEvents.filter((e) => !existingIds.has(e.id))];
        });
      } else {
        setEvents(newEvents);
      }

      setHasMore(newEvents.length === EVENTS_PER_PAGE);
      if (count !== null && count !== undefined) setTotalCount(count);
      if (!append) setPage(pageNum);
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

  // Recherche côté serveur avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(0);
      setLoading(true);
      fetchEvents(0, false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Refetch serveur quand un filtre avancé change (la recherche a son propre debounce
  // ci-dessus, le statut/onglet a le sien). On saute le premier rendu pour ne pas
  // doubler le fetch initial déclenché par l'effet [activeTab].
  const filtersMountedRef = useRef(false);
  useEffect(() => {
    if (!filtersMountedRef.current) {
      filtersMountedRef.current = true;
      return;
    }
    setPage(0);
    setLoading(true);
    fetchEvents(0, false);
  }, [accountFilter, dateFilter, enrichmentFilter]);

  const loadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchEvents(nextPage, true);
    setLoadingMore(false);
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

  const onStatusChangeSuccess = async () => {
    await fetchEvents(0, false);
    loadDuplicates();
    loadPastPendingCount();
    setSelectedIds(new Set());
  };

  // Validation directe d'un event, sans passer par la modale de confirmation.
  // La validation est non destructive et réversible (« Remettre en attente »).
  const quickApprove = async (eventId: string) => {
    setProcessingId(eventId);
    isMutatingRef.current = true;
    try {
      const { error } = await supabase.rpc('approve_pending_event', { p_event_id: eventId });
      if (error) throw error;
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(eventId);
        return next;
      });
      toast({ title: '✅ Validé', description: 'Événement publié' });
      await fetchEvents(0, false);
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message || 'Validation impossible', variant: 'destructive' });
    } finally {
      isMutatingRef.current = false;
      setProcessingId(null);
    }
  };

  // Validation en lot (un seul refresh au lieu d'un par event), pour le bouton « haute confiance »
  // et la barre d'actions groupées.
  const bulkApprove = async (ids: string[]) => {
    if (!ids.length) return;
    setBulkApproving(true);
    isMutatingRef.current = true;
    try {
      const results = await Promise.allSettled(
        ids.map((id) => supabase.rpc('approve_pending_event', { p_event_id: id }))
      );
      const ok = results.filter(
        (r) => r.status === 'fulfilled' && !((r.value as { error: unknown }).error)
      ).length;
      toast({
        title: '✅ Validation en lot',
        description: `${ok}/${ids.length} événement(s) publié(s)`,
        variant: ok === ids.length ? undefined : 'destructive',
      });
      setSelectedIds(new Set());
      await fetchEvents(0, false);
      loadDuplicates();
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message || 'Validation en lot impossible', variant: 'destructive' });
    } finally {
      isMutatingRef.current = false;
      setBulkApproving(false);
    }
  };

  // Nettoyage des événements à date passée : un seul appel serveur rejette TOUS les
  // pending passés (pas seulement la page chargée), et renvoie le nombre traité.
  const cleanPastPending = async () => {
    setBulkRejecting(true);
    isMutatingRef.current = true;
    try {
      const { data, error } = await supabase.rpc('reject_past_pending_events', { p_reason: 'Date passée' });
      if (error) throw error;
      const n = typeof data === 'number' ? data : 0;
      toast({ title: '🧹 Nettoyage', description: `${n} événement(s) à date passée rejeté(s)` });
      setSelectedIds(new Set());
      await fetchEvents(0, false);
      await loadPastPendingCount();
      loadDuplicates();
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message || 'Nettoyage impossible', variant: 'destructive' });
    } finally {
      isMutatingRef.current = false;
      setBulkRejecting(false);
    }
  };

  // Garde un event : s'il est encore en attente on le publie ; s'il est déjà actif/validé
  // (cas fréquent des doublons anciens), il n'y a rien à faire.
  const keepDuplicateEvent = (event: DuplicateEvent) => {
    if (event.status === 'pending') {
      return supabase.rpc('approve_pending_event', { p_event_id: event.id });
    }
    return Promise.resolve({ error: null });
  };

  // Rejette un event quel que soit son statut : la RPC ne traite que les "pending",
  // donc pour un event déjà actif/validé on bascule directement le statut (RLS admin).
  const rejectDuplicateEvent = (event: DuplicateEvent, reason: string) => {
    if (event.status === 'pending') {
      return supabase.rpc('reject_pending_event', { p_event_id: event.id, p_reason: reason });
    }
    return supabase
      .from('events')
      .update({ status: 'rejected', rejection_reason: reason, validated_at: new Date().toISOString() } as never)
      .eq('id', event.id);
  };

  // Doublons : un seul geste. On valide la carte gardée et on rejette l'autre directement
  // (sans fenêtre de confirmation). La paire disparaît tout de suite de la liste — l'admin
  // voit le tableau diminuer à chaque résolution. Tout reste réversible côté onglets.
  const handleResolveDuplicate = async (pair: DuplicatePair, keep: 'a' | 'b') => {
    const kept = keep === 'a' ? pair.a : pair.b;
    const rejected = keep === 'a' ? pair.b : pair.a;

    // Retrait optimiste : on enlève toutes les paires qui référencent l'un des deux events
    // (un même event peut apparaître dans plusieurs paires — éviter d'agir sur un statut périmé).
    setDuplicatePairs((prev) =>
      prev.filter((p) => ![p.a.id, p.b.id].some((id) => id === kept.id || id === rejected.id))
    );
    isMutatingRef.current = true;
    try {
      const [keepRes, rejectRes] = await Promise.all([
        keepDuplicateEvent(kept),
        rejectDuplicateEvent(rejected, 'Doublon'),
      ]);
      if (keepRes.error) throw keepRes.error;
      if (rejectRes.error) throw rejectRes.error;
      toast({ title: '✅ Doublon résolu', description: `« ${kept.title} » gardé, l'autre rejeté` });
      await fetchEvents(0, false);
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message || 'Résolution impossible', variant: 'destructive' });
      loadDuplicates(); // resync si l'opération a échoué
    } finally {
      isMutatingRef.current = false;
    }
  };

  // Doublons : rejeter les DEUX cartes d'un coup (aucune ne vaut la peine d'être gardée).
  const handleRejectBothDuplicates = async (pair: DuplicatePair) => {
    // Retire toutes les paires référençant l'un des deux events (cf. handleResolveDuplicate).
    setDuplicatePairs((prev) =>
      prev.filter((p) => ![p.a.id, p.b.id].some((id) => id === pair.a.id || id === pair.b.id))
    );
    isMutatingRef.current = true;
    try {
      const results = await Promise.all([
        rejectDuplicateEvent(pair.a, 'Doublon'),
        rejectDuplicateEvent(pair.b, 'Doublon'),
      ]);
      const firstError = results.find((r) => r.error)?.error;
      if (firstError) throw firstError;
      toast({ title: '✅ Doublon rejeté', description: 'Les deux événements ont été rejetés' });
      await fetchEvents(0, false);
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message || 'Rejet impossible', variant: 'destructive' });
      loadDuplicates();
    } finally {
      isMutatingRef.current = false;
    }
  };

  // Édition rapide d'un champ depuis la ligne du tableau (énergie / catégorie), sans ouvrir la modale.
  // Optimiste : on met à jour l'état local immédiatement puis on persiste ; on resynchronise en cas d'échec.
  const quickUpdateField = async (eventId: string, patch: Partial<PendingEvent>) => {
    isMutatingRef.current = true;
    setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, ...patch } : e)));
    try {
      const { error } = await supabase.from('events').update(patch as never).eq('id', eventId);
      if (error) throw error;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Mise à jour impossible';
      toast({ title: 'Erreur', description: message, variant: 'destructive' });
      await fetchEvents(0, false);
    } finally {
      isMutatingRef.current = false;
    }
  };

  const quickSetEnergy = (eventId: string, energy: string) => quickUpdateField(eventId, { energy });
  const quickSetCategory = (eventId: string, category: string) => quickUpdateField(eventId, { category });

  // Ouvrir l'aperçu d'un event par son id (les doublons ne sont pas forcément dans la liste chargée).
  const openPreviewById = async (eventId: string) => {
    const inList = events.find(e => e.id === eventId);
    if (inList) {
      setShowDetails(inList);
      return;
    }
    const { data } = await supabase.from('events').select('*').eq('id', eventId).single();
    if (data) setShowDetails(data as PendingEvent);
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
    // Recherche, compte, date et enrichissement sont filtrés côté serveur (fetchEvents).
    // Ici on ne fait que le filtre de catégorie local et le tri d'affichage.
    const filtered = events.filter(event => {
      if (filter !== 'all' && event.category !== filter) return false;
      return true;
    });

    return [...filtered].sort((a, b) => {
      switch(sortBy) {
        case 'date': return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'score': return calculateScore(b) - calculateScore(a);
        case 'created': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'confidence': {
          // Enrichis d'abord, du plus confiant au moins confiant ; les bruts en fin.
          const ca = a.parsing_method === 'claude-vision-v1' ? (a.parsing_confidence ?? 0) : -1;
          const cb = b.parsing_method === 'claude-vision-v1' ? (b.parsing_confidence ?? 0) : -1;
          return cb - ca;
        }
        case 'review': {
          // Events flaggés par l'IA en premier, puis par date d'événement.
          const diff = (hasReviewFlags(b) ? 1 : 0) - (hasReviewFlags(a) ? 1 : 0);
          return diff !== 0 ? diff : new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        default: return 0;
      }
    });
  };

  const filteredEvents = getFilteredEvents();

  // Refs pour que le handler clavier (lié une seule fois) lise toujours l'état frais.
  const filteredEventsRef = useRef<PendingEvent[]>([]);
  filteredEventsRef.current = filteredEvents;
  const focusedIndexRef = useRef(-1);
  focusedIndexRef.current = focusedIndex;
  // activeTabRef est déjà déclaré plus haut (utilisé par fetchEvents et le realtime).
  const keyActionsRef = useRef({ quickApprove, handleReject, setShowDetails, setEditingEvent, quickSetEnergy, quickSetCategory });
  keyActionsRef.current = { quickApprove, handleReject, setShowDetails, setEditingEvent, quickSetEnergy, quickSetCategory };

  // Garde l'index focalisé dans les bornes quand la liste filtrée change.
  useEffect(() => {
    if (focusedIndex >= filteredEvents.length) {
      setFocusedIndex(filteredEvents.length - 1);
    }
  }, [filteredEvents.length, focusedIndex]);

  // Raccourcis clavier : ↑/↓ ou j/k pour naviguer, A valider, R rejeter, Entrée aperçu.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      // Ne pas capturer quand une modale est ouverte.
      if (document.querySelector('[role="dialog"]')) return;

      const list = filteredEventsRef.current;
      if (!list.length) return;
      const idx = focusedIndexRef.current;
      const tab = activeTabRef.current;

      const moveTo = (next: number) => {
        const clamped = Math.max(0, Math.min(list.length - 1, next));
        setFocusedIndex(clamped);
        const el = document.querySelector(`[data-event-id="${list[clamped].id}"]`);
        el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      };

      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        moveTo(idx < 0 ? 0 : idx + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        moveTo(idx < 0 ? 0 : idx - 1);
      } else if (e.key === 'Escape') {
        setFocusedIndex(-1);
      } else if (idx >= 0 && idx < list.length) {
        const ev = list[idx];
        if ((e.key === 'a' || e.key === 'A') && ev.status === 'pending') {
          e.preventDefault();
          keyActionsRef.current.quickApprove(ev.id);
        } else if ((e.key === 'r' || e.key === 'R') && ev.status === 'pending') {
          e.preventDefault();
          keyActionsRef.current.handleReject([ev.id]);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          // Entrée ouvre la modale d'édition (aperçu de la vraie carte + formulaire),
          // pas l'ancien aperçu en lecture seule.
          keyActionsRef.current.setEditingEvent(ev);
        } else if (e.key === 'm' || e.key === 'M') {
          e.preventDefault();
          keyActionsRef.current.setEditingEvent(ev);
        } else if (e.key === 'e' || e.key === 'E') {
          e.preventDefault();
          keyActionsRef.current.quickSetEnergy(ev.id, nextEnergy(ev.energy));
        } else if (e.key === 'c' || e.key === 'C') {
          e.preventDefault();
          keyActionsRef.current.quickSetCategory(ev.id, getNextCategoryId(ev.category));
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const resetFilters = () => {
    setSearchQuery('');
    setAccountFilter('all');
    setDateFilter('all');
    setEnrichmentFilter('all');
  };

  const hasActiveFilters = searchQuery || accountFilter !== 'all' || dateFilter !== 'all' || enrichmentFilter !== 'all';

  // Compteur validés aujourd'hui
  const todayValidated = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return events.filter(e => 
      e.status === 'active' && 
      e.validated_at && 
      e.validated_at.startsWith(today)
    ).length;
  }, [events]);

  // Fonction de retry erreur scraper
  const handleRetryError = async (errorId: string, eventData: any) => {
    setRetryingError(errorId);
    try {
      const { error: insertError } = await supabase
        .from('events')
        .insert([eventData]);

      if (insertError) {
        await supabase
          .from('scraper_errors')
          .update({
            retry_status: 'failed',
            retry_count: (scraperErrors.find(e => e.id === errorId)?.retry_count || 0) + 1,
            retry_at: new Date().toISOString(),
            retry_error: insertError.message
          })
          .eq('id', errorId);

        toast({
          title: "Échec du retry",
          description: insertError.message,
          variant: "destructive"
        });
      } else {
        await supabase
          .from('scraper_errors')
          .update({
            retry_status: 'success',
            retry_count: (scraperErrors.find(e => e.id === errorId)?.retry_count || 0) + 1,
            retry_at: new Date().toISOString(),
            resolved_at: new Date().toISOString()
          })
          .eq('id', errorId);

        toast({
          title: "Succès",
          description: "Événement récupéré avec succès !"
        });
        loadScraperErrors();
        fetchEvents();
      }
    } catch (error: any) {
      console.error('Erreur retry:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du retry",
        variant: "destructive"
      });
    } finally {
      setRetryingError(null);
    }
  };

  const handleRetryAllErrors = async () => {
    const pendingErrors = scraperErrors.filter(e => e.retry_status === 'pending');
    
    if (pendingErrors.length === 0) {
      toast({
        title: "Info",
        description: "Aucune erreur à traiter"
      });
      return;
    }

    toast({
      title: "Traitement en cours",
      description: `Traitement de ${pendingErrors.length} erreur(s)...`
    });

    for (const error of pendingErrors) {
      await handleRetryError(error.id, error.event_data);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    toast({
      title: "Terminé",
      description: "Traitement terminé"
    });
  };

  const handleIgnoreError = async (errorId: string) => {
    try {
      await supabase
        .from('scraper_errors')
        .update({
          retry_status: 'failed',
          resolved_at: new Date().toISOString()
        })
        .eq('id', errorId);

      toast({
        title: "Ignoré",
        description: "Erreur ignorée"
      });
      loadScraperErrors();
    } catch (error) {
      console.error('Erreur ignore:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ignorer l'erreur",
        variant: "destructive"
      });
    }
  };

  // Compteur urgent
  const urgentCount = (stats?.manualReviewEvents || 0) + (stats?.scraperErrorsCount || 0);

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement des événements..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Validation des Événements
              </h1>
              <p className="text-muted-foreground">
                Modération complète • {new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>
            
            <Button
              onClick={() => fetchEvents(0, false)}
              variant="outline"
              size="icon"
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Workload KPIs */}
          <ValidationWorkload
            stats={stats}
            isLoading={statsLoading}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            duplicatesCount={duplicatePairs.length}
            venuesCount={unknownVenues.length}
          />

          {/* Alerte urgente */}
          {urgentCount > 0 && activeTab !== 'urgent' && (
            <Alert variant="destructive" className="mb-4">
              <Flame className="h-4 w-4" />
              <AlertTitle>Attention requise</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>
                  {stats?.scraperErrorsCount ? `${stats.scraperErrorsCount} erreur(s) scraper` : ''}
                  {stats?.scraperErrorsCount && stats?.manualReviewEvents ? ' • ' : ''}
                  {stats?.manualReviewEvents ? `${stats.manualReviewEvents} événement(s) à réviser` : ''}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setActiveTab('urgent')}
                  className="ml-4"
                >
                  Traiter maintenant
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Contenu basé sur l'onglet actif (via WorkloadCards) */}
        
        {/* URGENT - Erreurs + Manual Review */}
        {activeTab === 'urgent' && (
          <div className="space-y-6">
            {/* Section Erreurs Scraper */}
            {scraperErrors.length > 0 && (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-semibold text-red-900">
                        {scraperErrors.length} événement{scraperErrors.length > 1 ? 's' : ''} perdu{scraperErrors.length > 1 ? 's' : ''}
                      </p>
                      <p className="text-sm text-red-700">
                        Ces événements n'ont pas pu être sauvegardés lors du scraping
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleRetryAllErrors}
                    disabled={retryingError !== null}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${retryingError ? 'animate-spin' : ''}`} />
                    Réessayer tout
                  </Button>
                </div>

                <div className="space-y-3">
                  {scraperErrors.map((error) => {
                    const eventData = error.event_data;
                    
                    return (
                      <div key={error.id} className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0">
                            {eventData?.image_url ? (
                              <img 
                                src={eventData.image_url} 
                                alt={eventData.title}
                                className="w-20 h-25 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-20 h-25 bg-muted rounded-lg flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{eventData?.title || 'Sans titre'}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {eventData?.description || 'Pas de description'}
                            </p>
                            
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              {eventData?.date && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(eventData.date).toLocaleDateString('fr-FR')}
                                </span>
                              )}
                              {eventData?.account_username && (
                                <span className="flex items-center gap-1">
                                  <Instagram className="w-3 h-3" />
                                  @{eventData.account_username}
                                </span>
                              )}
                            </div>

                            <div className="bg-red-50 border border-red-200 rounded p-2 mt-3">
                              <p className="text-xs text-red-800">
                                <strong>Erreur :</strong> {error.error_type} 
                                {error.error_message && ` - ${error.error_message}`}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleRetryError(error.id, eventData)}
                              disabled={retryingError === error.id}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {retryingError === error.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <RefreshCw className="w-4 h-4 mr-1" />
                                  Retry
                                </>
                              )}
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleIgnoreError(error.id)}
                              disabled={retryingError !== null}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Ignorer
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section Manual Review */}
            {stats?.manualReviewEvents && stats.manualReviewEvents > 0 && (
              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-semibold text-orange-900">
                        {stats.manualReviewEvents} événement{stats.manualReviewEvents > 1 ? 's' : ''} à réviser manuellement
                      </p>
                      <p className="text-sm text-orange-700">
                        Ces événements nécessitent une intervention humaine
                      </p>
                    </div>
                  </div>
                </div>

                {/* Liste events manual_review */}
                {renderEventsTable()}
              </div>
            )}

            {/* État vide */}
            {urgentCount === 0 && (
              <div className="bg-card rounded-lg border p-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Aucun élément urgent à traiter 🎉
                </p>
              </div>
            )}
          </div>
        )}

        {/* DOUBLONS - Paires potentielles */}
        {activeTab === 'doublons' && (
          <DuplicatesPanel
            pairs={duplicatePairs}
            loading={loadingDuplicates}
            onResolve={handleResolveDuplicate}
            onRejectBoth={handleRejectBothDuplicates}
            onPreview={openPreviewById}
          />
        )}

        {/* LIEUX - Registre des lieux */}
        {activeTab === 'lieux' && (
          <VenuesPanel
            venues={unknownVenues}
            loading={loadingVenues}
            pendingLocation={classifyingVenue}
            onClassify={handleClassifyVenue}
          />
        )}

        {/* PENDING - À valider */}
        {activeTab === 'pending' && renderFiltersAndTable()}

        {/* ACTIVE - Événements actifs */}
        {activeTab === 'active' && renderFiltersAndTable()}

        {/* REJECTED - Événements rejetés */}
        {activeTab === 'rejected' && renderFiltersAndTable()}

        {/* ALL - Tous les événements */}
        {activeTab === 'all' && renderFiltersAndTable()}
      </div>

      {/* Modales */}
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

      {statusChange.eventIds.length > 0 && (
        <StatusChangeModal
          eventIds={statusChange.eventIds}
          currentStatus={statusChange.currentStatus}
          targetStatus={statusChange.targetStatus}
          onClose={() => setStatusChange({ eventIds: [], currentStatus: '', targetStatus: '' })}
          onSuccess={onStatusChangeSuccess}
        />
      )}

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

      {/* Modale Manual Review */}
      {processManualReview && (
        <Dialog open={!!processManualReview} onOpenChange={() => setProcessManualReview(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                Traitement Programme Manuel
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4 border-r pr-6">
                <div>
                  <h3 className="font-semibold text-sm mb-2">📸 Screenshot Instagram</h3>
                  {processManualReview.image_url ? (
                    <img 
                      src={processManualReview.image_url} 
                      alt="Programme" 
                      className="w-full rounded-lg border"
                    />
                  ) : (
                    <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground text-sm">Pas d'image disponible</p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-sm mb-2">📝 Texte détecté (OCR)</h3>
                  <div className="bg-muted p-3 rounded-lg text-sm max-h-40 overflow-y-auto">
                    {processManualReview.description || 'Aucun texte extrait'}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-sm mb-2">⚠️ Raison révision manuelle</h3>
                  <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg text-sm text-orange-800">
                    {processManualReview.manual_review_reason || 'Non spécifiée'}
                  </div>
                </div>

                {processManualReview.external_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => window.open(processManualReview.external_url!, '_blank')}
                  >
                    <Instagram className="w-4 h-4 mr-2" />
                    Voir le post original
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Créer les événements</h3>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-muted-foreground">Nombre :</label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={manualEventCount}
                      onChange={(e) => setManualEventCount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                      className="w-16 h-8"
                    />
                  </div>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {manualEvents.map((evt, idx) => (
                    <div key={idx} className="border rounded-lg p-4 space-y-3 bg-card">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">Événement {idx + 1}</h4>
                        {manualEventCount > 1 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setManualEventCount(c => c - 1);
                              setManualEvents(prev => prev.filter((_, i) => i !== idx));
                            }}
                            className="h-6 w-6 p-0 text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div>
                        <label className="text-xs font-medium">Titre *</label>
                        <Input
                          value={evt.title}
                          onChange={(e) => {
                            const newEvents = [...manualEvents];
                            newEvents[idx].title = e.target.value;
                            setManualEvents(newEvents);
                          }}
                          placeholder="Ex: Soirée Electro"
                          className="mt-1"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-medium">Date *</label>
                          <Input
                            type="date"
                            value={evt.date}
                            onChange={(e) => {
                              const newEvents = [...manualEvents];
                              newEvents[idx].date = e.target.value;
                              setManualEvents(newEvents);
                            }}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium">Heure *</label>
                          <Input
                            type="time"
                            value={evt.time}
                            onChange={(e) => {
                              const newEvents = [...manualEvents];
                              newEvents[idx].time = e.target.value;
                              setManualEvents(newEvents);
                            }}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium">Description</label>
                        <textarea
                          value={evt.description}
                          onChange={(e) => {
                            const newEvents = [...manualEvents];
                            newEvents[idx].description = e.target.value;
                            setManualEvents(newEvents);
                          }}
                          placeholder="Décrivez l'événement..."
                          className="mt-1 w-full min-h-16 p-2 border rounded-md text-sm bg-background"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium">Prix (€)</label>
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          value={evt.price}
                          onChange={(e) => {
                            const newEvents = [...manualEvents];
                            newEvents[idx].price = parseFloat(e.target.value) || 0;
                            setManualEvents(newEvents);
                          }}
                          placeholder="0"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setProcessManualReview(null)}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={async () => {
                      const hasEmptyTitles = manualEvents.some(e => !e.title.trim());
                      if (hasEmptyTitles) {
                        toast({
                          title: "Erreur",
                          description: "Tous les événements doivent avoir un titre",
                          variant: "destructive"
                        });
                        return;
                      }

                      try {
                        const userId = (await supabase.auth.getUser()).data.user?.id;
                        for (const evt of manualEvents) {
                          const { error } = await supabase
                            .from('events')
                            .insert([{
                              title: evt.title,
                              date: new Date(`${evt.date}T${evt.time}`).toISOString(),
                              description: evt.description || processManualReview.description,
                              location: processManualReview.location,
                              address: processManualReview.address,
                              category: processManualReview.category as 'a-boire' | 'a-manger' | 'soirees' | 'activites',
                              price: evt.price,
                              image_url: processManualReview.image_url,
                              external_url: processManualReview.external_url,
                              account_username: processManualReview.account_username,
                              status: 'pending',
                              created_by: userId!,
                              created_by_type: 'admin' as const
                            }]);

                          if (error) throw error;
                        }

                        await supabase
                          .from('events')
                          .update({ status: 'rejected' })
                          .eq('id', processManualReview.id);

                        toast({
                          title: "Succès",
                          description: `${manualEvents.length} événement(s) créé(s)`
                        });

                        setProcessManualReview(null);
                        fetchEvents();
                      } catch (error: any) {
                        toast({
                          title: "Erreur",
                          description: error.message,
                          variant: "destructive"
                        });
                      }
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Créer {manualEvents.length} événement{manualEvents.length > 1 ? 's' : ''}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );

  // Fonction pour afficher les filtres et le tableau
  function renderFiltersAndTable() {
    return (
      <>
        {/* Section Filtres */}
        <div className="bg-card rounded-lg border p-4 space-y-3 mb-6">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold">Recherche & Filtres</h3>
              {hasActiveFilters && (
                <Badge variant="secondary">Filtres actifs</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="h-8 px-3">
                {filteredEvents.length} résultat{filteredEvents.length > 1 ? 's' : ''}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={resetFilters}
                className="h-8"
                disabled={!hasActiveFilters}
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Réinitialiser
              </Button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par titre, description, lieu, compte Instagram..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setSearchQuery('')}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Source Instagram</label>
              <Select value={accountFilter} onValueChange={setAccountFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les comptes</SelectItem>
                  {accounts.map(account => (
                    <SelectItem key={account} value={account}>
                      @{account}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Enrichissement IA</label>
              <Select value={enrichmentFilter} onValueChange={(v: 'all' | 'enriched' | 'raw' | 'low') => setEnrichmentFilter(v)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="enriched">✨ Enrichis IA</SelectItem>
                  <SelectItem value="raw">Bruts (non traités)</SelectItem>
                  <SelectItem value="low">⚠️ Confiance basse</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Date événement</label>
              <Select value={dateFilter} onValueChange={(v: 'all' | 'today' | 'week' | 'month') => setDateFilter(v)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="today">Aujourd'hui</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Tri</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date événement</SelectItem>
                  <SelectItem value="created">Date création</SelectItem>
                  <SelectItem value="confidence">Confiance IA</SelectItem>
                  <SelectItem value="score">Score qualité</SelectItem>
                  <SelectItem value="review">À réviser en priorité</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {renderEventsTable()}
      </>
    );
  }

  // Fonction pour afficher le tableau d'événements
  function renderEventsTable() {
    const highConfidencePending = activeTab === 'pending'
      ? filteredEvents.filter(
          (e) => e.status === 'pending'
            && e.parsing_method === 'claude-vision-v1'
            && (e.parsing_confidence ?? 0) >= HIGH_CONFIDENCE_THRESHOLD
        )
      : [];

    // Événements en attente déjà passés : le compte vient du serveur (toute la base),
    // le nettoyage rejette tout en un appel — indépendant de la pagination.
    const showPastBanner = activeTab === 'pending' && pastPendingCount > 0;

    return (
      <>
        {/* Nettoyage des événements à date passée */}
        {showPastBanner && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-900">
                  {pastPendingCount} événement{pastPendingCount > 1 ? 's' : ''} à date passée dans la file
                </p>
                <p className="text-sm text-amber-700">
                  Leur date est déjà passée : ils n'ont plus à être validés. Rejette-les d'un coup.
                </p>
              </div>
            </div>
            <Button
              onClick={cleanPastPending}
              disabled={bulkRejecting}
              variant="outline"
              className="flex-shrink-0 border-amber-300 text-amber-800 hover:bg-amber-100"
            >
              {bulkRejecting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <X className="w-4 h-4 mr-2" />
              )}
              Rejeter les {pastPendingCount} (Date passée)
            </Button>
          </div>
        )}

        {/* Validation en lot des events enrichis à haute confiance */}
        {highConfidencePending.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-900">
                  {highConfidencePending.length} événement{highConfidencePending.length > 1 ? 's' : ''} enrichi{highConfidencePending.length > 1 ? 's' : ''} à haute confiance (≥{Math.round(HIGH_CONFIDENCE_THRESHOLD * 100)}%)
                </p>
                <p className="text-sm text-green-700">
                  Validables en un lot. Contrôlez par échantillon si besoin avant de tout publier.
                </p>
              </div>
            </div>
            <Button
              onClick={() => bulkApprove(highConfidencePending.map((e) => e.id))}
              disabled={bulkApproving}
              className="bg-green-600 hover:bg-green-700 flex-shrink-0"
            >
              {bulkApproving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Valider les {highConfidencePending.length}
            </Button>
          </div>
        )}

        {/* Toolbar unique (sticky) : sélection globale + actions groupées + raccourcis */}
        {filteredEvents.length > 0 && (
          <div className="sticky top-2 z-10 bg-card/95 backdrop-blur rounded-lg border shadow-sm p-3 mb-4 flex items-center justify-between gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedIds.size === filteredEvents.length}
                onChange={handleSelectAll}
                className="w-5 h-5 text-purple-600 rounded"
              />
              <span className="font-medium text-sm">
                {selectedIds.size > 0
                  ? `${selectedIds.size} sélectionné${selectedIds.size > 1 ? 's' : ''}`
                  : `Tout sélectionner (${filteredEvents.length})`}
              </span>
            </label>

            {selectedIds.size > 0 ? (
              <div className="flex gap-2">
                {(activeTab === 'pending' || activeTab === 'urgent') && (
                  <>
                    <Button
                      onClick={() => bulkApprove(Array.from(selectedIds))}
                      disabled={bulkApproving}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {bulkApproving ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 mr-1" />
                      )}
                      Valider
                    </Button>
                    <Button
                      onClick={() => handleReject(Array.from(selectedIds))}
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
              </div>
            ) : (
              <span className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
                <kbd className="px-1.5 py-0.5 rounded border bg-muted">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded border bg-muted">↓</kbd>
                naviguer ·
                <kbd className="px-1.5 py-0.5 rounded border bg-muted">A</kbd>
                valider ·
                <kbd className="px-1.5 py-0.5 rounded border bg-muted">R</kbd>
                rejeter ·
                <kbd className="px-1.5 py-0.5 rounded border bg-muted">M</kbd>
                modifier ·
                <kbd className="px-1.5 py-0.5 rounded border bg-muted">E</kbd>
                énergie ·
                <kbd className="px-1.5 py-0.5 rounded border bg-muted">C</kbd>
                catégorie ·
                <kbd className="px-1.5 py-0.5 rounded border bg-muted">↵</kbd>
                ouvrir
              </span>
            )}
          </div>
        )}

        {/* Tableau */}
        {loading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" text="Chargement..." />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-card rounded-lg border p-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {hasActiveFilters 
                ? "Aucun événement ne correspond aux filtres actifs"
                : "Aucun événement à afficher"
              }
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={resetFilters} className="mt-4">
                <RotateCcw className="w-4 h-4 mr-2" />
                Réinitialiser les filtres
              </Button>
            )}
          </div>
        ) : (
          <>
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
                    <TableHead className="text-center w-24">Confiance</TableHead>
                    <TableHead className="min-w-[280px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event, index) => (
                    <AdminEventTableRow
                      key={event.id}
                      event={event}
                      isSelected={selectedIds.has(event.id)}
                      isFocused={index === focusedIndex}
                      isProcessing={processingId === event.id}
                      onSelect={handleSelect}
                      onPreview={setEditingEvent}
                      onEdit={setEditingEvent}
                      onProcessManualReview={setProcessManualReview}
                      onHistory={(eventId, eventTitle) => {
                        setHistoryEventId(eventId);
                        setHistoryEventTitle(eventTitle);
                      }}
                      onStatusChange={handleStatusChange}
                      onQuickApprove={quickApprove}
                      onQuickSetEnergy={quickSetEnergy}
                      onQuickSetCategory={quickSetCategory}
                      calculateScore={calculateScore}
                      getScoreColor={getScoreColor}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {hasMore && (
              <div className="flex flex-col items-center gap-2 mt-6">
                <Button
                  onClick={loadMore}
                  variant="outline"
                  className="w-full max-w-md h-12"
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    `Charger ${EVENTS_PER_PAGE} événements supplémentaires`
                  )}
                </Button>
                {totalCount !== null && (
                  <p className="text-xs text-muted-foreground">
                    {events.length} / {totalCount} événements chargés
                  </p>
                )}
              </div>
            )}

            {!hasMore && filteredEvents.length > 0 && totalCount !== null && (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  ✅ Tous les événements ont été chargés ({totalCount})
                </p>
              </div>
            )}
          </>
        )}
      </>
    );
  }
};

export default ValidationInterface;
