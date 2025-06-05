import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Users, Building2, Heart, Search, Calendar, Building, Plus, BarChart3, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Wouli
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvre les meilleures sorties de Lyon et rencontre de nouvelles personnes qui partagent tes passions
          </p>
        </div>

        {/* Choice Cards */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* User Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6">
                <div className="text-white text-center">
                  <Users className="h-16 w-16 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Je cherche des sorties</h2>
                  <p className="text-purple-100">Découvre des événements près de toi</p>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-gray-700">
                    <Heart className="h-5 w-5 text-pink-500 mr-3" />
                    Swipe tes événements préférés
                  </li>
                  <li className="flex items-center text-gray-700">
                    <Search className="h-5 w-5 text-pink-500 mr-3" />
                    Recherche par catégorie ou lieu
                  </li>
                  <li className="flex items-center text-gray-700">
                    <Calendar className="h-5 w-5 text-pink-500 mr-3" />
                    Participe en un clic
                  </li>
                </ul>
                <Button 
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  size="lg"
                  onClick={() => navigate('/app')}
                >
                  Découvrir les événements
                </Button>
              </div>
            </div>

            {/* Business Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-6">
                <div className="text-white text-center">
                  <Building className="h-16 w-16 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Je gère un établissement</h2>
                  <p className="text-blue-100">Publie tes événements et attire de nouveaux clients</p>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-gray-700">
                    <Plus className="h-5 w-5 text-blue-500 mr-3" />
                    Crée tes événements facilement
                  </li>
                  <li className="flex items-center text-gray-700">
                    <BarChart3 className="h-5 w-5 text-blue-500 mr-3" />
                    Suis tes statistiques en temps réel
                  </li>
                  <li className="flex items-center text-gray-700">
                    <Target className="h-5 w-5 text-blue-500 mr-3" />
                    Touche une audience jeune et locale
                  </li>
                </ul>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                  size="lg"
                  onClick={() => navigate('/business')}
                >
                  Accéder au dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer avec lien admin */}
        <div className="text-center mt-16 text-gray-500">
          <p className="mb-4">Wouli - Connecte Lyon depuis 2024</p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/admin')}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Mode Admin
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
