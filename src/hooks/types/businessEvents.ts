
import { BusinessEvent } from '@/types/events';
import { ApiError } from '@/types/api';

export interface UseBusinessEventsReturn {
  events: BusinessEvent[];
  loading: boolean;
  error: ApiError | null;
  createEvent: (eventData: Omit<BusinessEvent, 'id' | 'views' | 'likes' | 'participants' | 'user_id'>) => Promise<{ data: BusinessEvent | null; error: ApiError | null }>;
  updateEvent: (eventId: string, eventData: Partial<Omit<BusinessEvent, 'id' | 'user_id'>>) => Promise<{ data: BusinessEvent | null; error: ApiError | null }>;
  deleteEvent: (eventId: string) => Promise<{ error: ApiError | null }>;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export interface CreateEventData extends Omit<BusinessEvent, 'id' | 'views' | 'likes' | 'participants' | 'user_id'> {}

export interface UpdateEventData extends Partial<Omit<BusinessEvent, 'id' | 'user_id'>> {}
