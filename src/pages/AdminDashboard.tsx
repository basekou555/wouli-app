
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { Calendar, MapPin, Users, Eye, Heart, Search, Building, Plus, Trash2 } from 'lucide-react';
import { categories } from '../data/mockEvents';

interface AdminEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  image: string;
  category: string;
  organizer: string;
  tags: string[];
  price?: string;
  maxParticipants?: number;
  views: number;
  likes: number;
  participants: number;
  searchAppearances: number;
}

const AdminDashboard = () => {
  const [adminEvents, setAdminEvents] = useState<AdminEvent[]>([
    {
      id: '1',
      title: 'Olympique Lyonnais vs PSG',
      date: '2024-06-20',
      time: '21:00',
      venue: 'Groupama Stadium',
      description: 'Choc au sommet de la Ligue 1 ! Venez supporter les Gones dans une ambiance électrique au Groupama Stadium.',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop',
      category: 'sport',
      organizer: 'Olympique Lyonnais',
      tags: ['football', 'OL', 'PSG', 'stade'],
      price: '25€',
      maxParticipants: 500,
      views: 1247,
      likes: 89,
      participants: 156,
      searchAppearances: 234
    },
    {
      id: '2',
      title: 'Nuits Sonores 2024',
      date: '2024-05-28',
      time: '18:00',
      venue: 'Musée des Confluences',
      description: 'Festival emblématique de musiques électroniques et cultures digitales. Découvrez les talents émergents et confirmés.',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
      category: 'concert',
      organizer: 'Nuits Sonores',
      tags: ['électro', 'festival', 'musique', 'confluence'],
      price: '45€',
      maxParticipants: 200,
      views: 2156,
      likes: 178,
      participants: 89,
      searchAppearances: 567
    },
    {
      id: '3',
      title: 'Fête des Lumières - Presqu\'île',
      date: '2024-12-08',
      time: '19:00',
      venue: 'Place Bellecour',
      description: 'Événement magique unique au monde ! Déambulation nocturne à travers les installations lumineuses du centre-ville.',
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop',
      category: 'culture',
      organizer: 'Ville de Lyon',
      tags: ['lumières', 'spectacle', 'lyon', 'tradition'],
      views: 3421,
      likes: 267,
      participants: 324,
      searchAppearances: 892
    }
  ]);

  const form = useForm({
    defaultValues: {
      title: '',
      date: '',
      time: '',
      venue: '',
      description: '',
      image: '',
      category: '',
      organizer: '',
      tags: '',
      price: '',
      maxParticipants: ''
    }
  });

  const { toast } = useToast();

  const onSubmit = (data: any) => {
    const newEvent: AdminEvent = {
      id: Date.now().toString(),
      title: data.title,
      date: data.date,
      time: data.time,
      venue: data.venue,
      description: data.description,
      image: data.image,
      category: data.category,
      organizer: data.organizer,
      tags: data.tags.split(',').map((tag: string) => tag.trim()),
      price: data.price || undefined,
      maxParticipants: data.maxParticipants ? parseInt(data.maxParticipants) : undefined,
      views: 0,
      likes: 0,
      participants: 0,
      searchAppearances: 0
    };

    setAdminEvents([...adminEvents, newEvent]);
    form.reset();
    
    toast({
      title: "✅ Événement créé !",
      description: `"${data.title}" a été ajouté avec succès`,
    });
  };

  const deleteEvent = (eventId: string) => {
    setAdminEvents(adminEvents.filter(event => event.id !== eventId));
    toast({
      title: "🗑️ Événement supprimé",
      description: "L'événement a été retiré du système",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Wouli</h1>
              <p className="text-gray-600">Gestion des événements publics lyonnais</p>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              Mode Administrateur
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire d'ajout */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2 text-purple-600" />
                  Ajouter un événement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Titre de l'événement</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Concert de..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Heure</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="venue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lieu</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Groupama Stadium" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="organizer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organisateur</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Ville de Lyon" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Catégorie</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choisir une catégorie" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.filter(cat => cat.id !== 'all').map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.icon} {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Description de l'événement..." rows={3} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL de l'image</FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags (séparés par des virgules)</FormLabel>
                          <FormControl>
                            <Input placeholder="musique, concert, lyon" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prix (optionnel)</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: 15€" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="maxParticipants"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Places max</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="100" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Créer l'événement
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Liste des événements */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Événements Lyon ({adminEvents.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminEvents.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex items-start justify-between">
                        <div className="flex space-x-4 flex-1">
                          <img
                            src={event.image}
                            alt={event.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{event.title}</h3>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <Building className="h-3 w-3 mr-1" />
                              <span className="font-medium">{event.organizer}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              {event.venue}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(event.date).toLocaleDateString('fr-FR')} à {event.time}
                            </div>
                            <Badge variant="outline" className="mt-1">
                              {categories.find(c => c.id === event.category)?.icon} {categories.find(c => c.id === event.category)?.name}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteEvent(event.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t">
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <Eye className="h-4 w-4 text-blue-500" />
                          </div>
                          <div className="text-lg font-bold">{event.views}</div>
                          <div className="text-xs text-gray-500">Vues</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <Heart className="h-4 w-4 text-red-500" />
                          </div>
                          <div className="text-lg font-bold">{event.likes}</div>
                          <div className="text-xs text-gray-500">Likes</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <Users className="h-4 w-4 text-green-500" />
                          </div>
                          <div className="text-lg font-bold">{event.participants}</div>
                          <div className="text-xs text-gray-500">Participants</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <Search className="h-4 w-4 text-purple-500" />
                          </div>
                          <div className="text-lg font-bold">{event.searchAppearances}</div>
                          <div className="text-xs text-gray-500">Recherches</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
