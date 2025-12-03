import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Users, Building, Instagram, Twitter } from "lucide-react";
import ScrollPreview from "@/components/ScrollPreview";
import { InstallPrompt } from "@/components/InstallPrompt";
const scrollToInstall = () => {
  document.getElementById('install')?.scrollIntoView({ behavior: 'smooth' });
};

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            WOULI
          </span>
          <div className="flex gap-3">
            <Link to="/auth">
              <Button variant="outline" className="rounded-full">Se connecter</Button>
            </Link>
            <Link to="/app">
              <Button className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90">
                Commencer
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Gradient Full Screen */}
      <section className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex flex-col items-center justify-center px-4 pt-20">
        <div className="text-center text-white space-y-6 mb-8">
          {/* Logo icône */}
          <div className="w-24 h-24 mx-auto bg-white rounded-3xl flex items-center justify-center shadow-2xl">
            <span className="text-5xl">🎉</span>
          </div>

          {/* Titre principal */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Qu'est-ce qu'on fait<br />
            <span className="text-white/90">ce soir ?</span>
          </h1>

          {/* Sous-titre */}
          <p className="text-xl md:text-2xl text-white/90 max-w-xl mx-auto">
            Découvre les meilleurs événements à Lyon.<br />
            Swipe, like, participe.
          </p>
        </div>

        {/* Scroll Preview TikTok-style */}
        <ScrollPreview />

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
          <Link to="/app">
            <Button
              size="lg"
              className="bg-white text-purple-600 hover:bg-white/90 text-lg px-8 py-6 rounded-full shadow-xl"
            >
              Découvrir les événements →
            </Button>
          </Link>

          <Button
            size="lg"
            variant="outline"
            onClick={scrollToInstall}
            className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 rounded-full"
          >
            📱 Installer l'app
          </Button>
        </div>

        {/* Social Proof */}
        <p className="text-sm text-white/70 mt-8">
          Rejoint par 500+ Lyonnais · 100+ événements/mois
        </p>
      </section>

      {/* Comment ça marche */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            3 étapes simples pour découvrir ta prochaine sortie
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 - Swipe */}
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-4xl">👆</span>
              </div>
              <h3 className="text-2xl font-bold">Swipe</h3>
              <p className="text-muted-foreground">
                Parcours les événements de ce soir en scrollant comme sur TikTok
              </p>
            </div>

            {/* Step 2 - Like */}
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-4xl">❤️</span>
              </div>
              <h3 className="text-2xl font-bold">Like</h3>
              <p className="text-muted-foreground">
                Sauvegarde tes favoris et partage-les avec tes amis
              </p>
            </div>

            {/* Step 3 - Participe */}
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-4xl">🎉</span>
              </div>
              <h3 className="text-2xl font-bold">Participe</h3>
              <p className="text-muted-foreground">
                Confirme ta participation et ne rate plus jamais une soirée
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section PWA / Screenshot */}
      <section id="install" className="py-20 px-4 bg-gradient-to-b from-background to-accent/20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold">
            Une expérience immersive
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Installe Wouli sur ton téléphone pour profiter d'une expérience sans barres de navigation
          </p>

          {/* Mockup téléphone */}
          <div className="max-w-[200px] mx-auto">
            <div className="relative aspect-[9/19] bg-black rounded-[2.5rem] border-[6px] border-gray-800 shadow-2xl overflow-hidden">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-5 bg-black rounded-b-xl z-10"></div>

              {/* Contenu mockup */}
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex flex-col items-center justify-center">
                <span className="text-4xl mb-2">🎉</span>
                <p className="text-white font-bold">Wouli</p>
                <p className="text-white/70 text-xs mt-1">Installée</p>
              </div>
            </div>
          </div>

          {/* Instructions installation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="bg-accent rounded-full px-3 py-1 font-medium">iOS</span>
              <span>Safari → Partager → "Sur l'écran d'accueil"</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-accent rounded-full px-3 py-1 font-medium">Android</span>
              <span>Menu → "Installer l'application"</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section Business */}
      <section className="py-20 px-4 bg-background border-t">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Vous êtes un établissement ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Rejoignez Wouli et boostez la visibilité de vos événements
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Cards avantages */}
            <div className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
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
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>Audience ciblée</CardTitle>
                  <CardDescription>
                    Touchez directement les jeunes de 18-28 ans qui cherchent des sorties à Lyon
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* CTA Business */}
            <div className="text-center md:text-left">
              <h3 className="text-3xl font-bold mb-4">
                Prêt à booster vos événements ?
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                30€/mois pour une visibilité maximale auprès de votre audience cible
              </p>
              <Link to="/business/signup">
                <Button size="lg" className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-lg px-8">
                  <Building className="mr-2 h-5 w-5" />
                  Créer mon compte établissement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-500 to-pink-500">
        <div className="max-w-3xl mx-auto text-center text-white space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold">
            Prêt à découvrir Lyon ?
          </h2>
          <p className="text-xl text-white/90">
            Rejoins la communauté Wouli et ne rate plus jamais un événement.
          </p>

          <div className="pt-4">
            <Link to="/app">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-white/90 text-xl px-12 py-8 rounded-full shadow-2xl"
              >
                Commencer maintenant →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-background border-t">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Col 1 : Wouli */}
            <div className="md:col-span-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                WOULI
              </span>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                Simplifie ta vie sociale à Lyon · Découvre les meilleurs événements
              </p>
            </div>

            {/* Col 2 : Liens */}
            <div>
              <h3 className="font-semibold mb-3">Liens</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/app" className="hover:text-foreground transition-colors">Explorer</Link></li>
                <li><Link to="/auth" className="hover:text-foreground transition-colors">Se connecter</Link></li>
                <li><Link to="/business/signup" className="hover:text-foreground transition-colors">Espace business</Link></li>
              </ul>
            </div>

            {/* Col 3 : Social */}
            <div>
              <h3 className="font-semibold mb-3">Suivez-nous</h3>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-accent rounded-full flex items-center justify-center hover:bg-accent/80 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-accent rounded-full flex items-center justify-center hover:bg-accent/80 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2025 Wouli. Tous droits réservés.</p>
            <Link to="/admin" className="text-xs hover:text-foreground mt-2 inline-block transition-colors">
              Administration
            </Link>
          </div>
        </div>
      </footer>

      {/* Install Prompt PWA */}
      <InstallPrompt pageId="home" delay={1500} />
    </div>
  );
};
export default Home;