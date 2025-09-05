import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { H1, H2, H3, Text, SectionHeader, PageHeader } from '@/components/ui/typography';
import { Heart, Calendar, MapPin, Users } from 'lucide-react';
import { tokens } from '@/design/tokens';

/**
 * Demo component showcasing the new Wouli Design System
 * This demonstrates all the key improvements:
 * - Signature Wouli gradient
 * - Sora typography for display text
 * - Heartbeat animation for urgent badges  
 * - Like-pop animation for buttons
 * - Centralized design tokens
 */
export function WouliDesignDemo() {
  const [liked, setLiked] = React.useState(false);
  
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      {/* Page Header with Wouli branding */}
      <PageHeader
        title="Wouli Design System"
        subtitle="L'expérience Wouli avec son ADN visuel signature"
        gradient
      />
      
      {/* Typography Showcase */}
      <SectionHeader
        title="Typographie Wouli"
        description="Sora pour les titres, Inter pour la lisibilité"
      />
      
      <div className="space-y-6">
        <H1 variant="gradient">Grand Titre avec Gradient</H1>
        <H2>Sous-titre Sora</H2>
        <H3 variant="muted">Titre de section</H3>
        <Text size="lg">
          Texte principal avec Inter pour une lisibilité optimale dans les descriptions d'événements.
        </Text>
        <Text variant="muted">
          Texte secondaire avec une couleur plus douce.
        </Text>
      </div>
      
      {/* Gradient & Colors */}
      <SectionHeader
        title="Gradient Signature Wouli"
        description="Un seul gradient cohérent dans toute l'application"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-wouli p-6 rounded-xl text-white">
          <H3>Arrière-plan Gradient</H3>
          <Text className="text-white/90">
            Le gradient Wouli appliqué sur les surfaces importantes.
          </Text>
        </div>
        
        <div className="border rounded-xl p-6">
          <H3 variant="gradient">Texte Gradient</H3>
          <Text>
            Le même gradient appliqué sur le texte pour l'identité de marque.
          </Text>
        </div>
      </div>
      
      {/* Micro-interactions */}
      <SectionHeader
        title="Micro-interactions Signature"
        description="Animations qui donnent vie à l'expérience Wouli"
      />
      
      <div className="flex flex-wrap gap-4">
        <Button
          variant="like"
          onClick={() => setLiked(!liked)}
          className="gap-2"
        >
          <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
          {liked ? 'Aimé !' : 'J\'aime'}
        </Button>
        
        <Button variant="default" className="gap-2">
          <Users className="h-4 w-4" />
          Je participe
        </Button>
        
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          Programmer
        </Button>
      </div>
      
      {/* Urgent Badge with Heartbeat */}
      <div className="relative">
        <SectionHeader
          title="Badge Urgent avec Animation"
          description="Animation heartbeat douce pour attirer l'attention"
        />
        
        <div className="relative inline-block">
          <div className="bg-gray-100 rounded-xl p-8">
            <Text>Exemple d'événement avec badge urgent</Text>
          </div>
          <Badge className="absolute top-2 right-2 bg-urgent text-urgent-foreground animate-heartbeat">
            Dans 2h
          </Badge>
        </div>
      </div>
      
      {/* Event Card Example */}
      <SectionHeader
        title="Carte Événement Wouli"
        description="Exemple d'utilisation complète du design system"
      />
      
      <div className="bg-card border rounded-2xl overflow-hidden shadow-lg max-w-sm">
        <div className="relative h-48 bg-gradient-wouli">
          <div className="absolute inset-0 bg-black/20"></div>
          <Badge className="absolute top-3 right-3 bg-urgent text-urgent-foreground animate-heartbeat">
            Ce soir
          </Badge>
          <div className="absolute bottom-4 left-4 text-white">
            <H3 className="text-white">Soirée Jazz au Sucre</H3>
            <Text className="text-white/80" size="sm">Lyon • Gratuit</Text>
          </div>
        </div>
        
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Aujourd'hui 21h</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Quai du Commerce</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Paul + 12 autres y vont</span>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button variant="like" size="sm" className="flex-1">
              <Heart className="h-4 w-4" />
            </Button>
            <Button variant="default" size="sm" className="flex-1">
              Participer
            </Button>
          </div>
        </div>
      </div>
      
      {/* Design Tokens Reference */}
      <SectionHeader
        title="Tokens de Design"
        description="Système cohérent accessible via tokens.ts"
      />
      
      <div className="bg-gray-50 rounded-xl p-6">
        <Text variant="muted" size="sm" className="font-mono">
          import &#123; tokens &#125; from '@/design/tokens'<br/>
          colors.gradientWouli: {tokens.colors.gradientWouli}<br/>
          typography.fontFamily.display: [{tokens.typography.fontFamily.display.join(', ')}]
        </Text>
      </div>
    </div>
  );
}