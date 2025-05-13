
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus, Sparkles } from 'lucide-react';

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
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Accueil</h1>
        <p className="text-sm text-gray-500 mt-1">Découvrez ce qui se passe dans votre réseau</p>
      </div>
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="hidden md:flex items-center border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin text-purple-500' : 'text-gray-500'}`} />
          Actualiser
        </Button>
        
        <Link 
          to="/quick-event" 
          className="md:hidden inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-2 shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="h-5 w-5 text-white" />
        </Link>
        
        <Link 
          to="/events/create" 
          className="hidden md:inline-flex items-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-medium text-white hover:shadow-lg transition-all shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Créer un événement
        </Link>
        
        <Link 
          to="/quick-event" 
          className="hidden md:inline-flex items-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2 text-sm font-medium text-white hover:shadow-lg transition-all shadow-sm"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Création rapide
        </Link>
      </div>
    </div>
  );
};

export default DashboardHeader;
