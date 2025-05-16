
import { z } from 'zod';

// Validation schema with Zod
export const formSchema = z.object({
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

export type FormData = z.infer<typeof formSchema>;

export const categories = [
  { id: 'restaurant', name: 'Restaurant' },
  { id: 'bar', name: 'Bar' },
  { id: 'cinema', name: 'Cinéma' },
  { id: 'concert', name: 'Concert' },
  { id: 'sport', name: 'Sport' },
  { id: 'culture', name: 'Culture' },
  { id: 'travel', name: 'Voyage' },
  { id: 'other', name: 'Autre' },
];

export interface Participant {
  id: string;
  name: string;
  email: string;
}
