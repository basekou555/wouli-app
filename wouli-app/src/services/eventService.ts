
import { collection, query, where, getDocs, orderBy, Timestamp, DocumentData } from 'firebase/firestore';
import { db } from '../firebase.config';
import { mockEvents } from '../mocks/events';
import { toast } from "@/hooks/use-toast";

export interface EventData {
  id: string;
  title: string;
  location: string;
  date: Timestamp | { toDate: () => Date };
  image?: string;
  organizerName?: string;
  organizerAvatar?: string;
  participants?: string[];
  description?: string;
  organizerId?: string; // Changed from organizer to organizerId
  [key: string]: any; // Allow for additional properties
}

export async function fetchEvents(
  filter: 'all' | 'future' | 'past' = 'all',
  page: number = 1,
  pageSize: number = 10,
  userId?: string
): Promise<EventData[]> {
  try {
    const eventsRef = collection(db, 'events');
    let q;

    if (filter === 'future') {
      q = query(
        eventsRef,
        where('date', '>=', new Date()),
        orderBy('date', 'asc')
      );
    } else if (filter === 'past') {
      q = query(
        eventsRef,
        where('date', '<', new Date()),
        orderBy('date', 'desc')
      );
    } else {
      q = query(eventsRef, orderBy('date', 'desc'));
    }

    const querySnapshot = await getDocs(q);
    const eventsData: EventData[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as DocumentData;
      
      // Make sure all required properties exist
      if (data.title && data.location && data.date) {
        eventsData.push({
          id: doc.id,
          title: data.title,
          location: data.location,
          date: data.date,
          image: data.image || null,
          organizerName: data.organizerName || 'Utilisateur',
          organizerAvatar: data.organizerAvatar || null,
          participants: data.participants || [],
          description: data.description || '',
          organizerId: data.organizerId || data.organizer || null, // Handle both fields for compatibility
          ...data // Include any other properties
        } as EventData);
      } else {
        console.warn(`Event ${doc.id} is missing required properties and was skipped`);
      }
    });
    
    // Apply pagination
    const startIdx = (page - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    
    return eventsData.slice(startIdx, endIdx);
  } catch (error) {
    console.error('Error fetching events:', error);
    toast({
      title: "Erreur",
      description: "Impossible de charger les événements. Utilisation des données de démonstration.",
      variant: "destructive"
    });
    
    // Convert mock events to the correct format
    const mockData = mockEvents.map(event => {
      // Convert date string to Timestamp-like object
      const eventDate = new Date(event.date);
      
      return {
        ...event,
        date: {
          toDate: () => eventDate
        },
        participants: event.participants || []
      };
    });
    
    // Apply pagination
    const startIdx = (page - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    
    return mockData.slice(startIdx, endIdx);
  }
}

// Function to fetch user events for profile
export async function fetchUserEvents(userId: string) {
  try {
    // Requête pour les événements à venir
    const upcomingEventsQuery = query(
      collection(db, 'events'), 
      where('participants', 'array-contains', userId),
      where('date', '>=', new Date())
    );
    const upcomingEventsSnapshot = await getDocs(upcomingEventsQuery);
    const upcomingEvents = upcomingEventsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Requête pour les événements passés
    const pastEventsQuery = query(
      collection(db, 'events'), 
      where('participants', 'array-contains', userId),
      where('date', '<', new Date())
    );
    const pastEventsSnapshot = await getDocs(pastEventsQuery);
    const pastEvents = pastEventsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Requête pour les événements organisés
    const organizedEventsQuery = query(
      collection(db, 'events'), 
      where('organizerId', '==', userId) // Changed from 'organizer' to 'organizerId'
    );
    const organizedEventsSnapshot = await getDocs(organizedEventsQuery);
    const organizedEvents = organizedEventsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      upcoming: upcomingEvents,
      past: pastEvents,
      organized: organizedEvents
    };
  } catch (error) {
    console.error('Error fetching user events:', error);
    toast({
      title: "Erreur",
      description: "Impossible de charger vos événements. Utilisation des données de démonstration.",
      variant: "destructive"
    });
    
    // Return mock events filtered for user
    const mockUpcoming = mockEvents
      .filter(event => new Date(event.date) >= new Date())
      .filter(event => event.participants?.includes(userId));
      
    const mockPast = mockEvents
      .filter(event => new Date(event.date) < new Date())
      .filter(event => event.participants?.includes(userId));
      
    const mockOrganized = mockEvents
      .filter(event => event.organizerId === userId); // Changed from event.organizer to event.organizerId
      
    return {
      upcoming: mockUpcoming,
      past: mockPast,
      organized: mockOrganized
    };
  }
}

// Now let's create our content generation service with API integration
export interface ApiKeyConfig {
  key: string;
  service: string;
}

// Function to check if the API key is valid and configured
export async function checkApiKeyConfiguration(service: string): Promise<boolean> {
  try {
    // Check if we have an API key in localStorage (for development purposes only)
    const storedKey = localStorage.getItem(`${service}_api_key`);
    if (storedKey) return true;
    
    // Otherwise, check if it's configured in Firebase
    const { getFunctions, httpsCallable } = await import('firebase/functions');
    const functions = getFunctions();
    const checkApiConfig = httpsCallable(functions, 'checkApiConfig');
    const result = await checkApiConfig({ service });
    
    return (result.data as any).configured || false;
  } catch (error) {
    console.error('Error checking API configuration:', error);
    return false;
  }
}

// Function to save API key configuration (for development purposes only)
export function saveApiKey(service: string, key: string): void {
  if (!key || !service) return;
  localStorage.setItem(`${service}_api_key`, key);
  toast({
    title: "Configuration sauvegardée",
    description: `La clé API pour ${service} a été sauvegardée localement.`,
  });
}

// Function to generate content based on a prompt
export async function generateContent(
  prompt: string, 
  options: { 
    service?: string, 
    maxTokens?: number, 
    temperature?: number 
  } = {}
): Promise<{ text: string; error?: string; }> {
  const service = options.service || 'openai';
  const maxTokens = options.maxTokens || 500;
  const temperature = options.temperature || 0.7;
  
  try {
    // Check if the API key is configured
    const isConfigured = await checkApiKeyConfiguration(service);
    
    if (!isConfigured) {
      return {
        text: '',
        error: `La clé API pour ${service} n'est pas configurée. Veuillez configurer la clé API dans les paramètres.`
      };
    }
    
    // Get the API key (for development purposes only)
    const localApiKey = localStorage.getItem(`${service}_api_key`);
    
    if (localApiKey) {
      // For development: direct API call using the locally stored key
      // In production, this should be done through Firebase Functions
      if (service === 'openai') {
        const response = await fetch('https://api.openai.com/v1/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localApiKey}`
          },
          body: JSON.stringify({
            model: 'text-davinci-003',
            prompt,
            max_tokens: maxTokens,
            temperature
          })
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        return { text: data.choices[0].text.trim() };
      }
      
      return { 
        text: '',
        error: `Le service ${service} n'est pas encore supporté en mode développement.`
      };
    }
    
    // For production: Use Firebase Functions
    const { getFunctions, httpsCallable } = await import('firebase/functions');
    const functions = getFunctions();
    const generateContentFunction = httpsCallable(functions, 'generateContent');
    
    const result = await generateContentFunction({
      prompt,
      service,
      maxTokens,
      temperature
    });
    
    const data = result.data as any;
    
    if (data.error) {
      return { text: '', error: data.error };
    }
    
    return { text: data.text };
  } catch (error: any) {
    console.error('Error generating content:', error);
    return { 
      text: '',
      error: error.message || 'Une erreur est survenue lors de la génération du contenu.'
    };
  }
}
