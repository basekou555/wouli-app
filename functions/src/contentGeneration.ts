
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import fetch from 'node-fetch';
import { CallableContext } from 'firebase-functions/lib/common/providers/https';

// Service class for API key management
class ApiKeyService {
  static async getApiKey(service: string, context: CallableContext): Promise<string> {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Vous devez être connecté pour accéder à cette fonctionnalité.'
      );
    }
    
    // Get the API key from environment variables or Firebase Config
    let apiKey: string | undefined;
    
    if (process.env.NODE_ENV === 'production') {
      try {
        apiKey = functions.config()[service]?.key;
      } catch (error) {
        console.error(`Error getting ${service} API key from config:`, error);
      }
    } else {
      apiKey = process.env[`${service.toUpperCase()}_API_KEY`];
    }
    
    if (!apiKey) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        `La clé API pour ${service} n'est pas configurée.`
      );
    }
    
    return apiKey;
  }
}

// Content generation service
class ContentService {
  static async generateWithOpenAI(prompt: string, maxTokens: number, temperature: number, apiKey: string): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'text-davinci-003',
          prompt,
          max_tokens: maxTokens,
          temperature
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenAI API error:', errorData);
        throw new functions.https.HttpsError(
          'aborted',
          `Erreur de l'API OpenAI: ${response.status}`
        );
      }
      
      const data = await response.json();
      return data.choices[0].text.trim();
    } catch (error: any) {
      console.error('Error generating content with OpenAI:', error);
      throw new functions.https.HttpsError(
        'internal',
        error.message || 'Une erreur est survenue lors de la génération du contenu.'
      );
    }
  }
}

/**
 * Cloud Function for checking if an API key is configured
 */
export const checkApiConfig = functions.https.onCall(async (data, context) => {
  try {
    const { service } = data;
    
    if (!service) {
      return { configured: false };
    }
    
    let isConfigured = false;
    
    if (process.env.NODE_ENV === 'production') {
      isConfigured = !!functions.config()[service]?.key;
    } else {
      isConfigured = !!process.env[`${service.toUpperCase()}_API_KEY`];
    }
    
    return { configured: isConfigured };
  } catch (error) {
    console.error('Error checking API configuration:', error);
    return { configured: false };
  }
});

/**
 * Cloud Function for generating content
 */
export const generateContent = functions.https.onCall(async (data, context) => {
  try {
    const { prompt, service = 'openai', maxTokens = 500, temperature = 0.7 } = data;
    
    if (!prompt) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Le prompt est requis pour générer du contenu.'
      );
    }
    
    const apiKey = await ApiKeyService.getApiKey(service, context);
    
    let text = '';
    
    // Use the appropriate service for content generation
    if (service === 'openai') {
      text = await ContentService.generateWithOpenAI(prompt, maxTokens, temperature, apiKey);
    } else {
      throw new functions.https.HttpsError(
        'unimplemented',
        `Le service ${service} n'est pas encore supporté.`
      );
    }
    
    // Save the generated content to Firestore for history/analytics
    if (context.auth) {
      await admin.firestore().collection('content_generations').add({
        userId: context.auth.uid,
        prompt,
        service,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        tokens: text.split(/\s+/).length,
        // Don't store the actual generated text for privacy reasons
      });
    }
    
    return { text };
  } catch (error: any) {
    console.error('Error in generateContent:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Une erreur est survenue lors de la génération du contenu.'
    );
  }
});
