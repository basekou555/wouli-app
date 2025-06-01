
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Filter, X } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface SearchAndFiltersProps {
  onSearch: (term: string) => void;
  onLocationToggle: (enabled: boolean) => void;
  onCategoryFilter: (categories: string[]) => void;
  categories: Array<{ id: string; name: string; icon: string }>;
}

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  onSearch,
  onLocationToggle,
  onCategoryFilter,
  categories
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);
  const { toast } = useToast();

  const handleLocationToggle = () => {
    if (!locationEnabled) {
      // Demander la géolocalisation
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lon: position.coords.longitude
            });
            setLocationEnabled(true);
            onLocationToggle(true);
            toast({
              title: "Localisation activée",
              description: "Les événements seront triés par distance"
            });
          },
          (error) => {
            toast({
              title: "Erreur de localisation",
              description: "Impossible d'accéder à votre position",
              variant: "destructive"
            });
          }
        );
      } else {
        toast({
          title: "Géolocalisation non supportée",
          description: "Votre navigateur ne supporte pas la géolocalisation",
          variant: "destructive"
        });
      }
    } else {
      setLocationEnabled(false);
      setUserLocation(null);
      onLocationToggle(false);
      toast({
        title: "Localisation désactivée",
        description: "Les événements ne seront plus triés par distance"
      });
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    const updated = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    
    setSelectedCategories(updated);
    onCategoryFilter(updated);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setLocationEnabled(false);
    setUserLocation(null);
    onSearch('');
    onCategoryFilter([]);
    onLocationToggle(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const hasActiveFilters = searchTerm || selectedCategories.length > 0 || locationEnabled;

  return (
    <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm border">
      {/* Barre de recherche */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher un événement, lieu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4"
        />
      </form>

      {/* Boutons de filtre */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={locationEnabled ? "default" : "outline"}
          size="sm"
          onClick={handleLocationToggle}
          className="flex items-center"
        >
          <MapPin className="h-4 w-4 mr-1" />
          Près de moi
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="flex items-center"
        >
          <Filter className="h-4 w-4 mr-1" />
          Catégories
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4 mr-1" />
            Effacer
          </Button>
        )}
      </div>

      {/* Filtres de catégories */}
      <div className="flex gap-2 flex-wrap">
        {categories.slice(0, 6).map((category) => (
          <Badge
            key={category.id}
            variant={selectedCategories.includes(category.id) ? "default" : "outline"}
            className="cursor-pointer hover:bg-purple-100"
            onClick={() => handleCategorySelect(category.id)}
          >
            {category.icon} {category.name}
          </Badge>
        ))}
      </div>

      {/* Indicateurs actifs */}
      {hasActiveFilters && (
        <div className="text-xs text-gray-500 flex items-center gap-4">
          {searchTerm && <span>🔍 "{searchTerm}"</span>}
          {locationEnabled && <span>📍 Localisation activée</span>}
          {selectedCategories.length > 0 && (
            <span>🏷️ {selectedCategories.length} catégorie(s)</span>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAndFilters;
