
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Filter, X } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import SimpleCategorySelector from './SimpleCategorySelector';

interface SearchAndFiltersProps {
  onSearch: (term: string) => void;
  onLocationToggle: (enabled: boolean) => void;
  onCategoryFilter: (categories: string[]) => void;
}

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  onSearch,
  onLocationToggle,
  onCategoryFilter
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    onCategoryFilter(categoryId ? [categoryId] : []);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
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

  const hasActiveFilters = searchTerm || selectedCategory || locationEnabled;

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

      {/* Sélecteur de catégories simplifié */}
      <div>
        <SimpleCategorySelector
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
          showAllOption={true}
        />
      </div>

      {/* Indicateurs actifs */}
      {hasActiveFilters && (
        <div className="text-xs text-gray-500 flex items-center gap-4">
          {searchTerm && <span>🔍 "{searchTerm}"</span>}
          {locationEnabled && <span>📍 Localisation activée</span>}
          {selectedCategory && <span>🏷️ {selectedCategory}</span>}
        </div>
      )}
    </div>
  );
};

export default SearchAndFilters;
