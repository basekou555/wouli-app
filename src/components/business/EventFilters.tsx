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

export type DateFilter = 'all' | 'today' | 'week' | 'month';
export type StatusFilter = 'all' | 'upcoming' | 'past';
export type SortOption = 'date-desc' | 'date-asc' | 'name' | 'views' | 'likes';

interface EventFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  dateFilter: DateFilter;
  onDateFilterChange: (value: DateFilter) => void;
  venueFilter: string;
  onVenueFilterChange: (value: string) => void;
  activityFilter: string;
  onActivityFilterChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  totalResults: number;
  onReset: () => void;
}

const DATE_OPTIONS = [
  { value: 'all', label: 'Toutes les dates' },
  { value: 'today', label: "Aujourd'hui" },
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'upcoming', label: 'À venir' },
  { value: 'past', label: 'Passés' },
];

const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Plus récent' },
  { value: 'date-asc', label: 'Plus ancien' },
  { value: 'name', label: 'Nom A-Z' },
  { value: 'views', label: 'Plus vus' },
  { value: 'likes', label: 'Plus aimés' },
];

export default function EventFilters({
  searchQuery,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
  venueFilter,
  onVenueFilterChange,
  activityFilter,
  onActivityFilterChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
  totalResults,
  onReset,
}: EventFiltersProps) {
  const hasActiveFilters = 
    searchQuery || 
    dateFilter !== 'all' || 
    venueFilter !== 'all' || 
    activityFilter !== 'all' || 
    statusFilter !== 'all';

  return (
    <div className="space-y-4">
      {/* Search Bar & Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un événement..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-background border-border"
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
          <Select value={dateFilter} onValueChange={(v) => onDateFilterChange(v as DateFilter)}>
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              {DATE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortOption)}>
            <SelectTrigger className="w-[130px] bg-background">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
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
      <div className="flex flex-wrap gap-2">
        {/* Venue Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant={venueFilter === 'all' ? 'default' : 'outline'}
            className={cn(
              'cursor-pointer transition-all hover:scale-105',
              venueFilter === 'all' && 'bg-primary'
            )}
            onClick={() => onVenueFilterChange('all')}
          >
            Tous les lieux
          </Badge>
          {VENUE_CATEGORIES.slice(0, 5).map((cat) => (
            <Badge
              key={cat.value}
              variant={venueFilter === cat.value ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer transition-all hover:scale-105',
                venueFilter === cat.value && 'bg-primary'
              )}
              onClick={() => onVenueFilterChange(cat.value)}
            >
              {cat.label}
            </Badge>
          ))}
        </div>

        <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

        {/* Status Pills */}
        <div className="flex gap-1.5">
          {STATUS_OPTIONS.map((opt) => (
            <Badge
              key={opt.value}
              variant={statusFilter === opt.value ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer transition-all hover:scale-105',
                statusFilter === opt.value && (
                  opt.value === 'upcoming' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  opt.value === 'past' ? 'bg-slate-600 hover:bg-slate-700' :
                  'bg-primary'
                )
              )}
              onClick={() => onStatusFilterChange(opt.value as StatusFilter)}
            >
              {opt.value === 'upcoming' && '🟢 '}
              {opt.value === 'past' && '⚪ '}
              {opt.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Activity Type Dropdown (secondary filter) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Select value={activityFilter} onValueChange={onActivityFilterChange}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Type d'activité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les activités</SelectItem>
              {ACTIVITY_TYPES.map((act) => (
                <SelectItem key={act.value} value={act.value}>
                  {act.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <span className="text-sm text-muted-foreground">
            {totalResults} événement{totalResults !== 1 ? 's' : ''} trouvé{totalResults !== 1 ? 's' : ''}
          </span>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Réinitialiser
          </Button>
        )}
      </div>
    </div>
  );
}
