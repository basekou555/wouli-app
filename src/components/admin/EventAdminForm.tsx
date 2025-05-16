
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { db, storage } from '@/firebase.config';
import { Form } from "@/components/ui/form";
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formSchema, FormData, Participant } from './form/FormTypes';
import BasicInfoSection from './form/BasicInfoSection';
import LocationSection from './form/LocationSection';
import CategoryImageSection from './form/CategoryImageSection';
import SettingsSection from './form/SettingsSection';
import ParticipantsSection from './form/ParticipantsSection';
import SubmitSection from './form/SubmitSection';

const EventAdminForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);

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

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Section 1: Informations de base */}
          <BasicInfoSection form={form} />
          
          {/* Section 2: Lieu */}
          <LocationSection form={form} />
          
          {/* Section 3: Catégorie et image */}
          <CategoryImageSection 
            form={form}
            imageFile={imageFile}
            setImageFile={setImageFile}
            imagePreview={imagePreview}
            setImagePreview={setImagePreview}
          />
          
          {/* Section 4: Paramètres */}
          <SettingsSection form={form} />
          
          {/* Section 5: Participants */}
          <ParticipantsSection 
            participants={participants}
            setParticipants={setParticipants}
          />
          
          {/* Submit button */}
          <SubmitSection loading={loading} />
        </form>
      </Form>
    </div>
  );
};

export default EventAdminForm;
