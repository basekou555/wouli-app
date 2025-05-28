
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Users, Building2 } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            <span className="text-gradient">Wouli</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            La plateforme qui connecte les amis aux meilleurs événements de leur ville
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Utilisateurs */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Je cherche des événements
              </h2>
              <p className="text-gray-600 mb-6">
                Découvre les meilleures sorties près de chez toi et connecte-toi avec tes amis
              </p>
              <Link to="/app">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
                  Découvrir les événements
                </Button>
              </Link>
            </div>
          </div>

          {/* Entreprises */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Je suis un établissement
              </h2>
              <p className="text-gray-600 mb-6">
                Publie tes événements et attire plus de clients dans ton établissement
              </p>
              <Link to="/business">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500">
                  Gérer mes événements
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
