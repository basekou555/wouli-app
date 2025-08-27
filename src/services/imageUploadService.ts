import { supabase } from '@/integrations/supabase/client';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const uploadEventImage = async (
  imageBlob: Blob,
  eventId: string
): Promise<ImageUploadResult> => {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `event-${eventId}-${timestamp}.jpg`;
    const filePath = `events/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('events-images')
      .upload(filePath, imageBlob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error('Erreur upload Supabase:', error);
      return {
        success: false,
        error: 'Erreur lors de l\'upload: ' + error.message,
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('events-images')
      .getPublicUrl(filePath);

    return {
      success: true,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error('Erreur uploadEventImage:', error);
    return {
      success: false,
      error: 'Erreur inattendue lors de l\'upload',
    };
  }
};

export const updateEventImageUrl = async (
  eventId: string,
  imageUrl: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('events')
      .update({ image_url: imageUrl })
      .eq('id', eventId);

    if (error) {
      console.error('Erreur mise à jour événement:', error);
      return {
        success: false,
        error: 'Erreur lors de la mise à jour: ' + error.message,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Erreur updateEventImageUrl:', error);
    return {
      success: false,
      error: 'Erreur inattendue lors de la mise à jour',
    };
  }
};