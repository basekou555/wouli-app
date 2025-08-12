
import React from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Clock, Euro, ArrowLeft, Edit, Share2, ExternalLink, RefreshCw, Eye, Heart, Users, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import EventMetrics from '@/components/business/analytics/EventMetrics';
import EventInsights from '@/components/business/analytics/EventInsights';
import PerformanceGauge from '@/components/business/analytics/PerformanceGauge';
import MetricCard from '@/components/business/analytics/MetricCard';
import { useEventAnalytics } from '@/hooks/useEventAnalytics';

const BusinessEventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Get event from location state
  const event = location.state?.event;
  
  // Load analytics data
  const { 
    metrics, 
    benchmark, 
    categoryRank, 
    insights, 
    loading: analyticsLoading, 
    refreshAnalytics 
  } = useEventAnalytics(event);

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Événement introuvable</h2>
          <Button onClick={() => navigate('/business')}>
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    navigate(`/business/event/${id}/edit`, { state: { event } });
  };

  const handleShare = () => {
    const url = `${window.location.origin}/event/${id}`;
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: "Lien copié !",
        description: "Le lien de l'événement a été copié dans le presse-papier",
      });
    }
  };

  const getLocationDisplay = () => {
    return event.custom_venue || event.venue || 'Lieu à définir';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate performance score
  const calculatePerformanceScore = () => {
    if (!metrics) return 0;
    const { views, likes, participants, conversion_rate, like_rate, engagement_score } = metrics;
    
    // Weighted scoring algorithm
    const viewsScore = Math.min((views / 200) * 100, 100); // Max at 200 views
    const likeScore = Math.min(like_rate * 2, 100); // Max at 50% like rate
    const conversionScore = Math.min(conversion_rate * 5, 100); // Max at 20% conversion
    const engagementWeight = Math.min(engagement_score * 10, 100); // Max at 10 engagement score
    
    return Math.round((viewsScore * 0.3 + likeScore * 0.25 + conversionScore * 0.3 + engagementWeight * 0.15));
  };

  const performanceScore = calculatePerformanceScore();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={event.image_url || "https://picsum.photos/1200/400?random=event"} 
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
        
        {/* Back button overlay */}
        <div className="absolute top-4 left-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/business')}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Content overlay */}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
                <p className="text-lg opacity-90">
                  {formatDate(event.date)} • {event.time} • {getLocationDisplay()}
                </p>
              </div>
              
              {/* Performance Score */}
              <PerformanceGauge score={performanceScore} />
            </div>
          </div>
        </div>

        {/* Action buttons overlay */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button 
            onClick={refreshAnalytics} 
            variant="ghost" 
            size="sm"
            disabled={analyticsLoading}
            className="text-white hover:bg-white/20"
          >
            <RefreshCw className={`h-4 w-4 ${analyticsLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={handleEdit} variant="secondary" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
          <Button onClick={handleShare} variant="secondary" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Partager
          </Button>
        </div>
      </div>

      <div className="container mx-auto p-6 max-w-6xl">
        <div className="space-y-8">
          {/* Enhanced Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 -mt-8 relative z-10">
            <MetricCard
              icon={<Eye className="w-5 h-5" />}
              value={metrics?.views || 0}
              label="Vues uniques"
              trend={metrics ? "+34" : undefined}
              benchmark="Moy: 67"
              sparkline={[30, 45, 60, 80, 95, 120, metrics?.views || 127]}
              status="good"
              color="hsl(var(--primary))"
            />
            
            <MetricCard
              icon={<Heart className="w-5 h-5" />}
              value={`${metrics?.like_rate?.toFixed(1) || 0}%`}
              label="Taux d'engagement"
              trend={metrics ? "+12" : undefined}
              benchmark="Top 20%"
              status="excellent"
              color="hsl(var(--accent))"
              subtitle="Likes / Vues"
            />
            
            <MetricCard
              icon={<Users className="w-5 h-5" />}
              value={metrics?.participants || 0}
              label="Participants confirmés"
              subtitle={`${metrics?.conversion_rate?.toFixed(1) || 0}% de conversion`}
              fillRate={event.capacity ? (metrics?.participants || 0) / event.capacity * 100 : undefined}
              capacity={event.capacity}
              status="good"
              color="hsl(var(--success))"
            />
            
            <MetricCard
              icon={<Trophy className="w-5 h-5" />}
              value={categoryRank ? `#${categoryRank.rank}` : "-"}
              label="Dans votre catégorie"
              subtitle={categoryRank ? `sur ${categoryRank.total} établissements` : ""}
              badge={categoryRank && categoryRank.rank <= 3 ? "TOP 3" : undefined}
              status={categoryRank && categoryRank.rank <= 3 ? "excellent" : "good"}
              color="hsl(var(--primary))"
            />
          </div>

          {/* Analytics Section */}
          <div className="space-y-6">
            <EventMetrics 
              metrics={metrics || { views: 0, likes: 0, participants: 0, conversion_rate: 0, like_rate: 0, engagement_score: 0 }}
              benchmark={benchmark}
              categoryRank={categoryRank}
            />
            
            <EventInsights insights={insights} />
          </div>

          {/* Event Details Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Event image */}
              {event.image_url && (
                <Card>
                  <CardContent className="p-0">
                    <img 
                      src={event.image_url} 
                      alt={event.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </CardContent>
                </Card>
              )}

              {/* Event details */}
              <Card>
                <CardHeader>
                  <CardTitle>Détails de l'événement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="h-5 w-5 mr-3 text-orange-500" />
                    <span>{formatDate(event.date)}</span>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <Clock className="h-5 w-5 mr-3 text-orange-500" />
                    <span>{event.time}</span>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <MapPin className="h-5 w-5 mr-3 text-orange-500" />
                    <span>{getLocationDisplay()}</span>
                  </div>

                  {event.price && (
                    <div className="flex items-center text-gray-700">
                      <Euro className="h-5 w-5 mr-3 text-orange-500" />
                      <span>{event.price}</span>
                    </div>
                  )}

                  {event.external_url && (
                    <div className="flex items-center text-gray-700">
                      <ExternalLink className="h-5 w-5 mr-3 text-orange-500" />
                      <a 
                        href={event.external_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        Billeterie / Réservation
                      </a>
                    </div>
                  )}

                  {event.description && (
                    <div className="mt-6">
                      <h3 className="font-semibold text-lg mb-2">Description</h3>
                      <p className="text-gray-700 leading-relaxed">{event.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Quick actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Actions rapides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button onClick={handleEdit} className="w-full" variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier l'événement
                  </Button>
                  <Button onClick={handleShare} className="w-full" variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Partager l'événement
                  </Button>
                  <Button 
                    asChild
                    className="w-full" 
                    variant="outline"
                  >
                    <Link to={`/event/${id}`} target="_blank">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Voir en tant qu'utilisateur
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessEventDetails;
