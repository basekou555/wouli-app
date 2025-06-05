
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

// Initialiser dotenv pour l'environnement local
dotenv.config();

// Initialiser Firebase Admin
admin.initializeApp();

// Fonction utilitaire améliorée pour récupérer la clé API en fonction de l'environnement
const getApiKey = (localKey: string | undefined, configPath: string): string => {
  // En production, utiliser functions.config()
  if (process.env.NODE_ENV === 'production') {
    try {
      // Exemple: pour TMDB_API_KEY, configPath serait "tmdb.key"
      const pathParts = configPath.split('.');
      let config: any = functions.config();
      
      for (const part of pathParts) {
        config = config[part];
        if (config === undefined) {
          console.error(`Configuration ${configPath} non trouvée`);
          throw new Error(`Configuration ${configPath} non trouvée`);
        }
      }
      
      return config;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la configuration ${configPath}:`, error);
      throw new Error(`Clé API ${configPath} non configurée correctement en production`);
    }
  } 
  
  // En local, utiliser process.env
  if (!localKey) {
    console.error(`Clé API ${configPath.replace('.', '_').toUpperCase()} non trouvée dans les variables d'environnement`);
    throw new Error(`Clé API ${configPath.replace('.', '_').toUpperCase()} non trouvée dans les variables d'environnement`);
  }
  
  return localKey;
};

// Fonction pour vérifier l'authenticité de la requête
const verifyAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentification requise pour accéder à cette fonctionnalité'
    );
  }
  
  return context.auth.uid;
};

// Exemple d'utilisation avec l'API TMDB
export const getTmdbData = functions.https.onCall(async (data, context) => {
  try {
    // Vérifier l'authentification
    const userId = verifyAuth(context);
    
    // Récupérer la clé API
    const apiKey = getApiKey(process.env.TMDB_API_KEY, 'tmdb.key');
    
    // Valider les paramètres
    const movieId = data.movieId;
    if (!movieId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'L\'ID du film est requis'
      );
    }
    
    // Simuler un appel API (à remplacer par votre vraie logique)
    console.log(`Utilisateur ${userId} demande des informations sur le film ${movieId}`);
    console.log(`Appel à l'API TMDB avec la clé ${apiKey.substring(0, 3)}...`);
    
    // Retourner une réponse simulée
    return {
      success: true,
      message: `Données récupérées pour le film ${movieId}`,
      // En réalité, vous feriez un fetch ici avec la clé API
    };
  } catch (error: any) {
    console.error('Erreur dans la Cloud Function getTmdbData:', error);
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Une erreur interne s\'est produite'
    );
  }
});

// Exemple d'utilisation avec une autre API (ex: Stripe)
export const processPayment = functions.https.onCall(async (data, context) => {
  try {
    // Vérifier l'authentification
    const userId = verifyAuth(context);
    
    // Récupérer la clé API Stripe
    const apiKey = getApiKey(process.env.STRIPE_API_KEY, 'stripe.key');
    
    // Validation des données de paiement
    if (!data.amount || !data.currency || !data.paymentMethod) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Informations de paiement incomplètes'
      );
    }
    
    // Logique similaire pour Stripe...
    console.log(`Traitement de paiement pour l'utilisateur ${userId}`);
    console.log(`Montant: ${data.amount} ${data.currency}`);
    console.log(`Traitement avec la clé Stripe ${apiKey.substring(0, 3)}...`);
    
    // Ajouter une trace dans Firestore pour suivre la transaction
    await admin.firestore().collection('payments').add({
      userId,
      amount: data.amount,
      currency: data.currency,
      paymentMethod: data.paymentMethod,
      status: 'completed',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { 
      success: true, 
      message: 'Paiement traité avec succès',
      transactionId: `tx_${Date.now()}`
    };
  } catch (error: any) {
    console.error('Erreur dans la Cloud Function processPayment:', error);
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Une erreur lors du traitement du paiement'
    );
  }
});
