
import { collection, query, where, getDocs, orderBy, Timestamp, DocumentData } from 'firebase/firestore';
import { db } from '../../firebase.config';
import { mockEvents } from '../components/chat/mockData';
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
  [key: string]: any; // Allow for additional properties
}

export async function fetchEvents(
  filter: 'all' | 'future' | 'past' = 'all',
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
          ...data // Include any other properties
        } as EventData);
      } else {
        console.warn(`Event ${doc.id} is missing required properties and was skipped`);
      }
    });
    
    return eventsData;
  } catch (error) {
    console.error('Error fetching events:', error);
    toast({
      title: "Erreur",
      description: "Impossible de charger les événements. Utilisation des données de démonstration.",
      variant: "destructive"
    });
    
    // Convert mock events to the correct format
    return mockEvents.map(event => {
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
      where('organizer', '==', userId)
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
      .filter(event => event.organizer === userId);
      
    return {
      upcoming: mockUpcoming,
      past: mockPast,
      organized: mockOrganized
    };
  }
}
