
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Users, Building, MapPin, Sparkles } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-gradient">Wouli</h1>
              <Sparkles className="h-6 w-6 text-orange-500" />
            </div>
            <div className="flex space-x-3">
              <Link to="/auth">
                <Button variant="outline">Se connecter</Button>
              </Link>
              <Link to="/app">
                <Button>Commencer</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Découvre les événements
            <span className="text-gradient block">près de toi</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Wouli centralise tous les événements locaux pour t'aider à organiser facilement tes sorties. 
            Swipe, découvre, participe !
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/app">
              <Button size="lg" className="text-lg px-8 py-3">
                <Users className="mr-2 h-5 w-5" />
                Découvrir les événements
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/business">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                <Building className="mr-2 h-5 w-5" />
                Espace établissement
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Découverte locale</CardTitle>
              <CardDescription>
                Trouve facilement les événements près de chez toi avec notre interface intuitive
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Social et collaboratif</CardTitle>
              <CardDescription>
                Organise tes sorties avec tes amis et découvre de nouvelles personnes
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Building className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Pour les établissements</CardTitle>
              <CardDescription>
                Gérez vos événements et analysez votre audience avec des outils dédiés
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Prêt à découvrir Lyon ?
          </h3>
          <p className="text-lg text-gray-600 mb-6">
            Rejoins la communauté Wouli et ne rate plus jamais un événement
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-8 py-3">
              Créer mon compte gratuitement
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Admin Link (discrete) */}
        <div className="mt-8 text-center">
          <Link to="/admin" className="text-xs text-gray-400 hover:text-gray-600">
            Administration
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
