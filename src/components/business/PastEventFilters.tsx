import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VENUE_CATEGORIES, ACTIVITY_TYPES } from '@/data/tags';
import { cn } from '@/lib/utils';

export type PastPeriodFilter = 'all' | '7days' | '30days' | '3months';
export type PastSortOption = 'date-desc' | 'date-asc' | 'views' | 'likes' | 'participants';

interface PastEventFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  periodFilter: PastPeriodFilter;
  onPeriodFilterChange: (value: PastPeriodFilter) => void;
  venueFilter: string;
  onVenueFilterChange: (value: string) => void;
  activityFilter: string;
  onActivityFilterChange: (value: string) => void;
  sortBy: PastSortOption;
  onSortChange: (value: PastSortOption) => void;
  totalResults: number;
  onReset: () => void;
}

const PERIOD_OPTIONS = [
  { value: 'all', label: 'Tout l\'historique' },
  { value: '7days', label: '7 derniers jours' },
  { value: '30days', label: '30 derniers jours' },
  { value: '3months', label: '3 derniers mois' },
];

const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Plus récents' },
  { value: 'date-asc', label: 'Plus anciens' },
  { value: 'views', label: 'Plus vus' },
  { value: 'likes', label: 'Plus aimés' },
  { value: 'participants', label: 'Plus de participants' },
];

export default function PastEventFilters({
  searchQuery,
  onSearchChange,
  periodFilter,
  onPeriodFilterChange,
  venueFilter,
  onVenueFilterChange,
  activityFilter,
  onActivityFilterChange,
  sortBy,
  onSortChange,
  totalResults,
  onReset,
}: PastEventFiltersProps) {
  const hasActiveFilters = 
    searchQuery || 
    periodFilter !== 'all' || 
    venueFilter !== 'all' || 
    activityFilter !== 'all';

  return (
    <div className="space-y-3">
      {/* Search Bar & Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-background border-border h-9"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          <Select value={periodFilter} onValueChange={(v) => onPeriodFilterChange(v as PastPeriodFilter)}>
            <SelectTrigger className="w-[140px] bg-background h-9">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={(v) => onSortChange(v as PastSortOption)}>
            <SelectTrigger className="w-[140px] bg-background h-9">
              <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
              <SelectValue placeholder="Trier" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant={venueFilter === 'all' ? 'default' : 'outline'}
            className={cn(
              'cursor-pointer transition-all hover:scale-105 text-xs',
              venueFilter === 'all' && 'bg-slate-600 hover:bg-slate-700'
            )}
            onClick={() => onVenueFilterChange('all')}
          >
            Tous
          </Badge>
          {VENUE_CATEGORIES.slice(0, 4).map((cat) => (
            <Badge
              key={cat.value}
              variant={venueFilter === cat.value ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer transition-all hover:scale-105 text-xs',
                venueFilter === cat.value && 'bg-slate-600 hover:bg-slate-700'
              )}
              onClick={() => onVenueFilterChange(cat.value)}
            >
              {cat.label}
            </Badge>
          ))}
        </div>

        <div className="w-px h-5 bg-border mx-1 hidden sm:block" />

        <Select value={activityFilter} onValueChange={onActivityFilterChange}>
          <SelectTrigger className="w-[150px] bg-background h-8 text-xs">
            <SelectValue placeholder="Type d'activité" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes activités</SelectItem>
            {ACTIVITY_TYPES.map((act) => (
              <SelectItem key={act.value} value={act.value}>
                {act.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <span className="text-xs text-muted-foreground">
          {totalResults} résultat{totalResults !== 1 ? 's' : ''}
        </span>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
