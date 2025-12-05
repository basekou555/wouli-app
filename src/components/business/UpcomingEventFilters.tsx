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

export type UpcomingDateFilter = 'all' | 'today' | 'week' | 'month';
export type UpcomingSortOption = 'date-asc' | 'date-desc' | 'name' | 'views' | 'likes';

interface UpcomingEventFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  dateFilter: UpcomingDateFilter;
  onDateFilterChange: (value: UpcomingDateFilter) => void;
  venueFilter: string;
  onVenueFilterChange: (value: string) => void;
  activityFilter: string;
  onActivityFilterChange: (value: string) => void;
  sortBy: UpcomingSortOption;
  onSortChange: (value: UpcomingSortOption) => void;
  totalResults: number;
  onReset: () => void;
}

const DATE_OPTIONS = [
  { value: 'all', label: 'Toutes les dates' },
  { value: 'today', label: "Aujourd'hui" },
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
];

const SORT_OPTIONS = [
  { value: 'date-asc', label: 'Prochains' },
  { value: 'date-desc', label: 'Plus lointains' },
  { value: 'name', label: 'Nom A-Z' },
  { value: 'views', label: 'Plus vus' },
  { value: 'likes', label: 'Plus aimés' },
];

export default function UpcomingEventFilters({
  searchQuery,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
  venueFilter,
  onVenueFilterChange,
  activityFilter,
  onActivityFilterChange,
  sortBy,
  onSortChange,
  totalResults,
  onReset,
}: UpcomingEventFiltersProps) {
  const hasActiveFilters = 
    searchQuery || 
    dateFilter !== 'all' || 
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
          <Select value={dateFilter} onValueChange={(v) => onDateFilterChange(v as UpcomingDateFilter)}>
            <SelectTrigger className="w-[130px] bg-background h-9">
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
          
          <Select value={sortBy} onValueChange={(v) => onSortChange(v as UpcomingSortOption)}>
            <SelectTrigger className="w-[120px] bg-background h-9">
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
              venueFilter === 'all' && 'bg-emerald-600 hover:bg-emerald-700'
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
                venueFilter === cat.value && 'bg-emerald-600 hover:bg-emerald-700'
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
