
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Clock, MapPin, Users, Eye, Heart, Search, TrendingUp, Edit3, Copy, Share2 } from 'lucide-react';
import { mockEvents } from '../data/mockEvents';
import { categories } from '../data/mockEvents';

const BusinessEventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Pour ce MVP, on utilise les mockEvents. Dans une vraie app, on ferait un appel API
  const event = mockEvents.find(e => e.id === id);

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Événement non trouvé</h2>
          <Button onClick={() => navigate('/business')}>
            Retour au dashboard
          </Button>
        </div>
      </div>
    );
  }

  const categoryInfo = categories.find(c => c.id === event.category);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/business')}
              className="mr-3"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Détails de l'événement</h1>
              <p className="text-sm text-gray-600">Analysez les performances de votre événement</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Edit3 className="h-4 w-4 mr-1" />
              Modifier
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-1" />
              Partager
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image et infos principales */}
            <Card>
              <CardContent className="p-0">
                <div className="relative h-64 md:h-80">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                      {categoryInfo?.icon} {categoryInfo?.name}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h1>
                  <p className="text-gray-600 mb-4">{event.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                      <span className="text-sm">{new Date(event.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-purple-500" />
                      <span className="text-sm">{event.time}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-purple-500" />
                      <span className="text-sm">{event.venue}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-2 text-purple-500" />
                      <span className="text-sm">{event.participants} participants</span>
                    </div>
                  </div>

                  {event.price && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-green-800 font-medium">{event.price}</p>
                    </div>
                  )}

                  {event.tags.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-medium text-gray-900 mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {event.tags.map((tag, index) => (
                          <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Insights et recommandations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                  Insights et recommandations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">📈 Taux d'engagement</h4>
                  <p className="text-sm text-blue-800">
                    Votre événement a un taux d'engagement de {Math.round((event.likes / event.views) * 100)}% 
                    (moyenne: 8%). C'est {event.likes / event.views > 0.08 ? 'excellent' : 'correct'} !
                  </p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">🎯 Visibilité</h4>
                  <p className="text-sm text-green-800">
                    Votre événement apparaît {event.searchAppearances} fois dans les recherches. 
                    Les tags populaires comme "{event.tags[0]}" améliorent votre visibilité.
                  </p>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-medium text-orange-900 mb-2">💡 Conseil</h4>
                  <p className="text-sm text-orange-800">
                    {event.participants < 50 
                      ? "Partagez votre événement sur vos réseaux sociaux pour augmenter la participation."
                      : "Excellente participation ! Pensez à créer des événements récurrents."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar avec statistiques */}
          <div className="space-y-6">
            {/* Statistiques en temps réel */}
            <Card>
              <CardHeader>
                <CardTitle>Statistiques en temps réel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Eye className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-sm font-medium">Vues</span>
                  </div>
                  <span className="text-xl font-bold text-blue-600">{event.views}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <Heart className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-sm font-medium">Likes</span>
                  </div>
                  <span className="text-xl font-bold text-red-600">{event.likes}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm font-medium">Participants</span>
                  </div>
                  <span className="text-xl font-bold text-green-600">{event.participants}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center">
                    <Search className="h-5 w-5 text-orange-500 mr-2" />
                    <span className="text-sm font-medium">Recherches</span>
                  </div>
                  <span className="text-xl font-bold text-orange-600">{event.searchAppearances}</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Dupliquer cet événement
                </Button>
                
                <Button className="w-full" variant="outline">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Modifier l'événement
                </Button>
                
                <Button className="w-full" variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Partager l'événement
                </Button>
              </CardContent>
            </Card>

            {/* Métriques supplémentaires */}
            <Card>
              <CardHeader>
                <CardTitle>Détails d'audience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Taux de conversion:</span>
                  <span className="font-medium">{Math.round((event.participants / event.views) * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Portée estimée:</span>
                  <span className="font-medium">{Math.floor(event.views * 1.3)} personnes</span>
                </div>
                <div className="flex justify-between">
                  <span>Âge moyen:</span>
                  <span className="font-medium">22-26 ans</span>
                </div>
                <div className="flex justify-between">
                  <span>Zone géographique:</span>
                  <span className="font-medium">Lyon & périphérie</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessEventDetails;
