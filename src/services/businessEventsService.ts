
// Ce service est maintenant redirigé vers le service unifié
import { 
  fetchBusinessEventsForDashboard,
  createBusinessEvent as createBusiness,
  updateBusinessEvent as updateBusiness,
  deleteBusinessEvent as deleteBusiness
} from './unifiedEventService';
import { BusinessEvent } from '@/types/events';

export const fetchBusinessEvents = async (): Promise<BusinessEvent[]> => {
  return fetchBusinessEventsForDashboard();
};

export const createBusinessEvent = createBusiness;

export const updateBusinessEvent = updateBusiness;

export const deleteBusinessEvent = deleteBusiness;
