import { supabase } from '@/integrations/supabase/client';

export interface PublicBusinessInfo {
  id: string;
  username: string;
  bio?: string;
  city?: string;
  avatar_url?: string;
}

/**
 * Safely fetch public business information without exposing personal data
 * This uses a secure database function that filters out phone numbers, addresses, etc.
 */
export const getPublicBusinessInfo = async (): Promise<PublicBusinessInfo[]> => {
  try {
    const { data, error } = await supabase.rpc('get_public_business_info');
    
    if (error) {
      console.error('Error fetching public business info:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Unexpected error in getPublicBusinessInfo:', error);
    return [];
  }
};

/**
 * Get public info for a specific business by ID
 */
export const getPublicBusinessById = async (businessId: string): Promise<PublicBusinessInfo | null> => {
  try {
    const businesses = await getPublicBusinessInfo();
    return businesses.find(business => business.id === businessId) || null;
  } catch (error) {
    console.error('Error fetching business by ID:', error);
    return null;
  }
};