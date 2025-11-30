import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Users, Building, MapPin, Sparkles, MousePointer2 } from "lucide-react";
import SwipePreview from "@/components/SwipePreview";
import { InstallPrompt } from "@/components/InstallPrompt";
const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      {/* Header */}
      <div className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-gradient">Wouli</h1>
              <Sparkles className="h-6 w-6 text-accent" />
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
      <div className="min-h-screen flex flex-col justify-center">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <h1 className="text-6xl md:text-7xl font-bold text-foreground mb-6">
              WOULI
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-6">
              Swipe. Sors. Profite.
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">Découvre les meilleures sorties à Lyon en swipant</p>
          </div>

          {/* Swipe Preview Interactive */}
          <SwipePreview />

          {/* CTA Principal */}
          <div className="text-center mt-12">
            <Link to="/app">
              <Button size="lg" className="text-xl px-12 py-6 rounded-full hover:scale-105 transition-transform duration-300 animate-pulse-soft touch-target">
                Voir les sorties de ce soir →
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Comment ça marche */}
      <div className="bg-neutral-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              3 étapes simples pour découvrir ta prochaine sortie
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 wouli-gradient rounded-full flex items-center justify-center mb-6 mx-auto">
                <MousePointer2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">1. Swipe</h3>
              <p className="text-muted-foreground">
                Parcours les événements de ce soir en swipant comme sur Tinder
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 wouli-gradient rounded-full flex items-center justify-center mb-6 mx-auto">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">2. Choisis</h3>
              <p className="text-muted-foreground">
                Sélectionne les sorties qui te tentent près de chez toi
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 wouli-gradient rounded-full flex items-center justify-center mb-6 mx-auto">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">3. Profite</h3>
              <p className="text-muted-foreground">
                Rejoins tes amis et découvre de nouvelles personnes sur place
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section Business */}
      <div className="bg-background py-20 border-t">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Vous êtes un établissement ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Rejoignez Wouli et boostez la visibilité de vos événements
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="space-y-8">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 wouli-gradient rounded-lg flex items-center justify-center mb-4">
                    <Building className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>Dashboard complet</CardTitle>
                  <CardDescription>
                    Gérez vos événements et analysez leurs performances avec des analytics détaillés
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 wouli-gradient rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>Audience ciblée</CardTitle>
                  <CardDescription>
                    Touchez directement les jeunes de 18-28 ans qui cherchent des sorties à Lyon
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="text-center md:text-left">
              <h3 className="text-3xl font-bold text-foreground mb-6">
                Prêt à booster vos événements ?
              </h3>
              <p className="text-lg text-muted-foreground mb-8">
                30€/mois pour une visibilité maximale auprès de votre audience cible
              </p>
              <Link to="/business/signup">
                <Button size="lg" className="text-lg px-8 py-3 touch-target">
                  <Building className="mr-2 h-5 w-5" />
                  Créer mon compte établissement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-neutral-900 text-neutral-300 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <h3 className="text-xl font-bold text-gradient">Wouli</h3>
            <Sparkles className="h-5 w-5 text-accent" />
          </div>
          <p className="text-sm">
            Simplifie ta vie sociale à Lyon • © 2024 Wouli
          </p>
          <div className="mt-4">
            <Link to="/admin" className="text-xs text-neutral-500 hover:text-neutral-400">
              Administration
            </Link>
          </div>
        </div>
      </div>

      {/* Install Prompt PWA */}
      <InstallPrompt pageId="home" delay={1500} />
    </div>
  );
};
export default Home;