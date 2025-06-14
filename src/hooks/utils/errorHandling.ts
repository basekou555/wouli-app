
import { ApiError } from '@/types/api';

export const createApiError = (error: any, context: string): ApiError => {
  console.error(`Error in ${context}:`, error);
  return {
    message: error.message || 'Une erreur inattendue s\'est produite',
    code: error.code,
    details: error
  };
};
