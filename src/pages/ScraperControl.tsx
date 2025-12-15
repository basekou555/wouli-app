import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Play, RefreshCw, Instagram, AlertTriangle, CheckCircle,
  XCircle, Clock, TrendingUp, ArrowLeft, Loader2, Zap, Square
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ScraperRun {
  id: string;
  created_at: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  accounts_count: number;
  posts_analyzed: number;
  events_found: number;
  events_saved: number;
  events_manual_review: number;
  events_failed: number;
  error_count: number;
  error_message: string | null;
}

interface AccountStatus {
  username: string;
  lastScraped: string | null;
  eventsCount: number;
  status: 'active' | 'warning' | 'error';
  statusMessage: string;
}

const INSTAGRAM_ACCOUNTS = [
  'laferialyon', 'nhlyon', 'olma.club', 'transbolyon', 'lepetitsalon',
  'heat_lyon', 'culturel_lyon', 'lesoundclubfdy', 'wallacelyon', 'operadelyon',
  'le_roi_lyon_bar', 'sonic_lyon', 'onlylyon', 'lyon_citycrunch', 'mylittlelyon',
  'lyonfood', 'docks40', 'le_bonbon_lyon', 'tuviensmanger', 'maisonmlyon',
  'loft_club_lyon_', 'lapasserelle_lyon', 'lesgourmandiseslyon'
];

export default function ScraperControl() {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  
  const [runs, setRuns] = useState<ScraperRun[]>([]);
  const [currentRun, setCurrentRun] = useState<ScraperRun | null>(null);
  
  const [accountsStatus, setAccountsStatus] = useState<AccountStatus[]>([]);
  const [accountFilter, setAccountFilter] = useState<'all' | 'active' | 'warning' | 'error'>('all');
  
  const [stats, setStats] = useState({
    totalRuns: 0,
    successRate: 0,
    avgEventsPerRun: 0,
    lastRunDate: null as string | null,
  });

  const loadRuns = async () => {
    try {
      const { data, error } = await supabase
        .from('scraper_runs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRuns((data || []) as ScraperRun[]);

      if (data && data.length > 0) {
        const completed = data.filter(r => r.status === 'completed');
        const totalEvents = completed.reduce((sum, r) => sum + (r.events_found || 0), 0);
        
        setStats({
          totalRuns: data.length,
          successRate: (completed.length / data.length) * 100,
          avgEventsPerRun: completed.length > 0 ? totalEvents / completed.length : 0,
          lastRunDate: data[0].created_at,
        });
      }

      const runningRun = data?.find(r => r.status === 'running');
      if (runningRun) {
        setCurrentRun(runningRun as ScraperRun);
        setIsRunning(true);
      }

    } catch (error) {
      console.error('Erreur chargement runs:', error);
      toast.error('Impossible de charger l\'historique');
    }
  };

  const loadAccountsStatus = async () => {
    try {
      const statusList: AccountStatus[] = [];

      for (const username of INSTAGRAM_ACCOUNTS) {
        const { data: events } = await supabase
          .from('events')
          .select('created_at, id')
          .eq('account_username', username)
          .order('created_at', { ascending: false })
          .limit(1);

        const lastScraped = events?.[0]?.created_at || null;
        const { count } = await supabase
          .from('events')
          .select('id', { count: 'exact', head: true })
          .eq('account_username', username);

        const eventsCount = count || 0;

        let status: 'active' | 'warning' | 'error' = 'active';
        let statusMessage = 'OK';

        if (!lastScraped) {
          status = 'error';
          statusMessage = 'Jamais scrapé';
        } else {
          const daysSince = Math.floor((Date.now() - new Date(lastScraped).getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysSince > 7) {
            status = 'error';
            statusMessage = `Inactif depuis ${daysSince}j`;
          } else if (daysSince > 3) {
            status = 'warning';
            statusMessage = `Dernière activité: ${daysSince}j`;
          } else if (eventsCount < 3) {
            status = 'warning';
            statusMessage = `Peu d'événements (${eventsCount})`;
          } else {
            statusMessage = `${eventsCount} événements`;
          }
        }

        statusList.push({
          username,
          lastScraped,
          eventsCount,
          status,
          statusMessage,
        });
      }

      setAccountsStatus(statusList);
    } catch (error) {
      console.error('Erreur chargement comptes:', error);
    }
  };

  const handleStartScraper = async () => {
    try {
      setIsRunning(true);
      
      const { data: newRun, error: runError } = await supabase
        .from('scraper_runs')
        .insert([{
          status: 'running',
          trigger_type: 'manual',
          accounts_targeted: selectedAccount === 'all' ? INSTAGRAM_ACCOUNTS : [selectedAccount],
          accounts_count: selectedAccount === 'all' ? INSTAGRAM_ACCOUNTS.length : 1,
        }])
        .select()
        .single();

      if (runError) throw runError;
      setCurrentRun(newRun as ScraperRun);

      toast.success('Scraper lancé !');
      
      // Simulation - remplacer par appel API réel
      setTimeout(() => {
        handleScraperCompleted(newRun.id, {
          posts_analyzed: 50,
          events_found: 27,
          events_saved: 17,
          events_manual_review: 3,
          events_failed: 7,
          error_count: 1,
        });
      }, 5000);

    } catch (error: any) {
      console.error('Erreur lancement scraper:', error);
      toast.error('Impossible de lancer le scraper');
      setIsRunning(false);
    }
  };

  const handleScraperCompleted = async (runId: string, results: any) => {
    try {
      const duration = Math.floor((Date.now() - new Date(currentRun?.started_at || Date.now()).getTime()) / 1000);

      await supabase
        .from('scraper_runs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          duration_seconds: duration,
          ...results,
        })
        .eq('id', runId);

      setIsRunning(false);
      setCurrentRun(null);
      toast.success(`Scraper terminé : ${results.events_saved} événements sauvegardés`);
      
      loadRuns();
      loadAccountsStatus();

    } catch (error) {
      console.error('Erreur finalisation run:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        loadRuns(),
        loadAccountsStatus(),
      ]);
      setLoading(false);
    };

    init();

    const channel = supabase
      .channel('scraper_runs_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scraper_runs',
        },
        () => {
          loadRuns();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredAccounts = accountsStatus.filter(acc => {
    if (accountFilter === 'all') return true;
    return acc.status === accountFilter;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: { variant: 'default' as const, icon: CheckCircle, label: 'Actif' },
      warning: { variant: 'secondary' as const, icon: AlertTriangle, label: 'Attention' },
      error: { variant: 'destructive' as const, icon: XCircle, label: 'Erreur' },
    };
    const config = variants[status] || variants.active;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="text-xs">
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getRunStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      running: { variant: 'secondary' as const, icon: Loader2, label: 'En cours', className: 'animate-pulse' },
      completed: { variant: 'default' as const, icon: CheckCircle, label: 'Terminé' },
      failed: { variant: 'destructive' as const, icon: XCircle, label: 'Échoué' },
      cancelled: { variant: 'outline' as const, icon: Square, label: 'Annulé' },
    };
    const config = variants[status] || variants.running;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className={`text-xs ${config.className || ''}`}>
        <Icon className={`w-3 h-3 mr-1 ${status === 'running' ? 'animate-spin' : ''}`} />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">🤖 Contrôle Scraper</h1>
            <p className="text-muted-foreground">
              Gestion et monitoring du scraper Instagram V5
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => { loadRuns(); loadAccountsStatus(); }}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Section Contrôle */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
            <Play className="w-5 h-5" />
            Lancer le Scraper
          </h2>
          
          {currentRun && isRunning && (
            <Badge variant="secondary" className="animate-pulse">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Scraping en cours...
            </Badge>
          )}
        </div>

        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block text-foreground">Comptes à scraper</label>
            <Select value={selectedAccount} onValueChange={setSelectedAccount} disabled={isRunning}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  🌍 Tous les comptes ({INSTAGRAM_ACCOUNTS.length})
                </SelectItem>
                {INSTAGRAM_ACCOUNTS.map(account => (
                  <SelectItem key={account} value={account}>
                    @{account}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleStartScraper}
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                En cours...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Lancer
              </>
            )}
          </Button>
        </div>

        {/* Progress actuel */}
        {currentRun && isRunning && (
          <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Posts analysés</p>
                <p className="text-lg font-bold text-foreground">{currentRun.posts_analyzed || 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Événements trouvés</p>
                <p className="text-lg font-bold text-foreground">{currentRun.events_found || 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Sauvegardés</p>
                <p className="text-lg font-bold text-green-600">{currentRun.events_saved || 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Erreurs</p>
                <p className="text-lg font-bold text-red-600">{currentRun.error_count || 0}</p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Stats globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total runs</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalRuns}</p>
            </div>
            <Zap className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Taux de succès</p>
              <p className="text-2xl font-bold text-green-600">{stats.successRate.toFixed(0)}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Moy. events/run</p>
              <p className="text-2xl font-bold text-foreground">{stats.avgEventsPerRun.toFixed(0)}</p>
            </div>
            <Instagram className="w-8 h-8 text-pink-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Dernier run</p>
              <p className="text-sm font-bold text-foreground">
                {stats.lastRunDate 
                  ? `Il y a ${Math.floor((Date.now() - new Date(stats.lastRunDate).getTime()) / (1000 * 60 * 60))}h`
                  : 'Jamais'}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* Comptes Instagram */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
            <Instagram className="w-5 h-5" />
            Comptes Instagram ({INSTAGRAM_ACCOUNTS.length})
          </h2>

          <Select value={accountFilter} onValueChange={(v: any) => setAccountFilter(v)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="active">✅ Actifs</SelectItem>
              <SelectItem value="warning">⚠️ Attention</SelectItem>
              <SelectItem value="error">❌ Erreurs</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Compte</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Événements</TableHead>
                <TableHead className="text-right">Dernier scraping</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => (
                <TableRow key={account.username}>
                  <TableCell className="font-medium">
                    <a
                      href={`https://instagram.com/${account.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:underline text-foreground"
                    >
                      <Instagram className="w-4 h-4" />
                      @{account.username}
                    </a>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(account.status)}
                    <p className="text-xs text-muted-foreground mt-1">
                      {account.statusMessage}
                    </p>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-foreground">
                    {account.eventsCount}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {account.lastScraped 
                      ? new Date(account.lastScraped).toLocaleDateString('fr-FR')
                      : 'Jamais'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Historique runs */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
          <Clock className="w-5 h-5" />
          Historique des exécutions
        </h2>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Comptes</TableHead>
                <TableHead className="text-right">Posts</TableHead>
                <TableHead className="text-right">Events trouvés</TableHead>
                <TableHead className="text-right">Sauvegardés</TableHead>
                <TableHead className="text-right">Erreurs</TableHead>
                <TableHead className="text-right">Durée</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Aucune exécution enregistrée
                  </TableCell>
                </TableRow>
              ) : (
                runs.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell className="text-foreground">
                      {new Date(run.created_at).toLocaleString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      {getRunStatusBadge(run.status)}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {run.accounts_count} compte{run.accounts_count > 1 ? 's' : ''}
                    </TableCell>
                    <TableCell className="text-right text-foreground">{run.posts_analyzed}</TableCell>
                    <TableCell className="text-right font-semibold text-foreground">{run.events_found}</TableCell>
                    <TableCell className="text-right text-green-600 font-semibold">
                      {run.events_saved}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {run.error_count > 0 && run.error_count}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {run.duration_seconds ? `${run.duration_seconds}s` : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
