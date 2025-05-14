
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db, storage } from '@/firebase.config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, MapPin, Upload, Plus, Minus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Validation schema with Zod
const formSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  date: z.date({
    required_error: "Veuillez sélectionner une date",
  }),
  time: z.string().min(1, "L'heure est requise"),
  location: z.string().min(3, "Le lieu doit contenir au moins 3 caractères"),
  address: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
  category: z.string().min(1, "La catégorie est requise"),
  maxParticipants: z.string().optional(),
  privacy: z.enum(["private", "friends", "public"]),
  allowPlusOne: z.boolean().default(false),
  requireApproval: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

const EventAdminForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [participants, setParticipants] = useState<{ id: string; name: string; email: string }[]>([]);
  const [newParticipantEmail, setNewParticipantEmail] = useState('');
  const [newParticipantName, setNewParticipantName] = useState('');

  // Initialize form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      address: '',
      category: 'restaurant',
      privacy: 'private',
      allowPlusOne: false,
      requireApproval: false,
      time: '19:00',
    },
  });

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add participant
  const addParticipant = () => {
    if (!newParticipantEmail || !newParticipantName) return;
    
    setParticipants([
      ...participants,
      {
        id: uuidv4(),
        name: newParticipantName,
        email: newParticipantEmail
      }
    ]);
    
    setNewParticipantEmail('');
    setNewParticipantName('');
  };

  // Remove participant
  const removeParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  // Form submission handler
  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour créer un événement",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      let imageUrl = '';
      
      // Upload image if provided
      if (imageFile) {
        const storageRef = ref(storage, `events/${uuidv4()}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }
      
      // Combine date and time
      const eventDateTime = new Date(data.date);
      const [hours, minutes] = data.time.split(':');
      eventDateTime.setHours(parseInt(hours, 10));
      eventDateTime.setMinutes(parseInt(minutes, 10));
      
      // Create event document
      const eventData = {
        title: data.title,
        description: data.description,
        date: Timestamp.fromDate(eventDateTime),
        location: data.location,
        address: data.address,
        category: data.category,
        maxParticipants: data.maxParticipants ? parseInt(data.maxParticipants) : null,
        privacy: data.privacy,
        allowPlusOne: data.allowPlusOne,
        requireApproval: data.requireApproval,
        image: imageUrl,
        organizerId: user.uid,
        organizerName: user.displayName || 'Admin',
        organizerAvatar: user.photoURL || '',
        participants: participants.map(p => p.id),
        participantsData: participants,
        createdAt: Timestamp.now(),
      };
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, 'events'), eventData);
      
      toast({
        title: "Événement créé avec succès",
        description: `L'événement ${data.title} a été créé avec l'ID: ${docRef.id}`,
      });
      
      // Reset form
      form.reset();
      setImageFile(null);
      setImagePreview(null);
      setParticipants([]);
      
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'événement:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création de l'événement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Categories available
  const categories = [
    { id: 'restaurant', name: 'Restaurant' },
    { id: 'bar', name: 'Bar' },
    { id: 'cinema', name: 'Cinéma' },
    { id: 'concert', name: 'Concert' },
    { id: 'sport', name: 'Sport' },
    { id: 'culture', name: 'Culture' },
    { id: 'travel', name: 'Voyage' },
    { id: 'other', name: 'Autre' },
  ];

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Section 1: Informations de base */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informations de base</h3>
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre de l'événement</FormLabel>
                  <FormControl>
                    <Input placeholder="Titre de l'événement" {...field} />
                  </FormControl>
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
                    <Textarea 
                      placeholder="Description de l'événement" 
                      rows={4} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                            {field.value ? (
                              format(field.value, 'PPP', { locale: fr })
                            ) : (
                              <span className="text-gray-500">Choisir une date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          locale={fr}
                        />
                      </PopoverContent>
                    </Popover>
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
          </div>
          
          {/* Section 2: Lieu */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-lg font-medium">Lieu</h3>
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du lieu</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input className="pl-10" placeholder="Restaurant, bar, salle..." {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse complète</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Rue de Paris, 75001 Paris" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Section 3: Catégorie et image */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-lg font-medium">Catégorie et image</h3>
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catégorie</FormLabel>
                  <FormControl>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...field}
                    >
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <FormLabel>Image de l'événement (optionnel)</FormLabel>
              <div className="mt-1 flex flex-col space-y-2">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                  onClick={() => document.getElementById('event-image')?.click()}
                >
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Cliquez pour télécharger une image</span>
                  <input
                    type="file"
                    id="event-image"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-auto max-h-48 rounded-md object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                    >
                      Supprimer
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Section 4: Paramètres */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-lg font-medium">Paramètres</h3>
            
            <FormField
              control={form.control}
              name="privacy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confidentialité</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-wrap gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="private" id="private" />
                        <label htmlFor="private" className="cursor-pointer">Privé</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="friends" id="friends" />
                        <label htmlFor="friends" className="cursor-pointer">Amis</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="public" id="public" />
                        <label htmlFor="public" className="cursor-pointer">Public</label>
                      </div>
                    </RadioGroup>
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
                  <FormLabel>Nombre maximum de participants (optionnel)</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" placeholder="Laisser vide si illimité" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="allowPlusOne"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-x-2 rounded-md border p-4">
                    <div>
                      <FormLabel>Autoriser les +1</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="requireApproval"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-x-2 rounded-md border p-4">
                    <div>
                      <FormLabel>Approbation requise</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          {/* Section 5: Participants */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-lg font-medium">Participants</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <FormLabel>Nom</FormLabel>
                <Input 
                  placeholder="Nom du participant"
                  value={newParticipantName}
                  onChange={(e) => setNewParticipantName(e.target.value)}
                />
              </div>
              <div>
                <FormLabel>Email</FormLabel>
                <div className="flex space-x-2">
                  <Input 
                    placeholder="Email"
                    value={newParticipantEmail}
                    onChange={(e) => setNewParticipantEmail(e.target.value)}
                  />
                  <Button 
                    type="button" 
                    size="icon" 
                    onClick={addParticipant}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {participants.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <ul className="space-y-2">
                    {participants.map((p) => (
                      <li key={p.id} className="flex justify-between items-center p-2 rounded-md bg-gray-50">
                        <div>
                          <span className="font-medium">{p.name}</span>
                          <span className="text-sm text-gray-500 ml-2">{p.email}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeParticipant(p.id)}
                        >
                          <Minus className="h-4 w-4 text-red-500" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Submit button */}
          <div className="pt-6">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="mr-2">Création en cours...</span>
                  <div className="h-4 w-4 border-2 border-current border-r-transparent rounded-full animate-spin"></div>
                </>
              ) : (
                'Créer l\'événement'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EventAdminForm;
