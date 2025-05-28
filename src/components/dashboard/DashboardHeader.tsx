
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus } from 'lucide-react';

interface DashboardHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  onRefresh, 
  isRefreshing 
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Accueil</h1>
        <p className="text-sm text-gray-500 mt-1">Découvrez ce qui se passe dans votre réseau</p>
      </div>
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="hidden md:flex items-center"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
        
        <Link 
          to="/events/create" 
          className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Créer un événement
        </Link>
      </div>
    </div>
  );
};

export default DashboardHeader;
