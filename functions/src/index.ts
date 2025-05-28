import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';
import { CallableContext } from 'firebase-functions/lib/common/providers/https';
// import { Request } from 'express'; ← à remettre si je fais des onRequest

// Import content generation functions
import { checkApiConfig, generateContent } from './contentGeneration';

// Initialiser dotenv pour l'environnement local
dotenv.config();

// Initialiser Firebase Admin
admin.initializeApp();

// Export content generation functions
export { checkApiConfig, generateContent };

/**
 * Service de configuration pour gérer les clés API et autres configurations
 */
class ConfigService {
  private static keyCache: Record<string, string> = {};
  
  /**
   * Récupère une clé API depuis les variables d'environnement ou Firebase Config
   * @param envKey Nom de la variable d'environnement locale
   * @param configPath Chemin dans la config Firebase (ex: "tmdb.key")
   * @param required Si la clé est obligatoire (lance une erreur si non trouvée)
   * @returns La clé API ou une chaîne vide si non trouvée et non requise
   */
  static getApiKey(envKey: string, configPath: string, required = true): string {
    const cacheKey = `${envKey}:${configPath}`;
    
    // Vérifier le cache d'abord
    if (this.keyCache[cacheKey]) {
      return this.keyCache[cacheKey];
    }
    
    let apiKey: string | undefined;
    
    // En production, utiliser functions.config()
    if (process.env.NODE_ENV === 'production') {
      try {
        const pathParts = configPath.split('.');
        let config: any = functions.config();
        
        for (const part of pathParts) {
          config = config[part];
          if (config === undefined) {
            if (required) {
              console.error(`Configuration ${configPath} non trouvée`);
              throw new functions.https.HttpsError(
                'failed-precondition',
                `Configuration ${configPath} non trouvée`
              );
            }
            break;
          }
        }
        
        apiKey = config;
      } catch (error: any) {
        console.error(`Erreur lors de la récupération de la configuration ${configPath}:`, error);
        if (required) {
          throw new functions.https.HttpsError(
            'internal',
            `Erreur de configuration: ${error.message || 'Erreur inconnue'}`
          );
        }
      }
    } else {
      // En développement, utiliser les variables d'environnement
      apiKey = process.env[envKey];
      
      if (!apiKey && required) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          `Clé API ${envKey} non trouvée dans les variables d'environnement`
        );
      }
    }
    
    // Stocker dans le cache pour les prochains appels
    if (apiKey) {
      this.keyCache[cacheKey] = apiKey;
    }
    
    return apiKey || '';
  
  }

  /**
   * Vérifie l'authentification d'une requête
   * @param context Le contexte de la requête Firebase
   * @returns L'ID de l'utilisateur authentifié
   * @throws {HttpsError} Si l'utilisateur n'est pas authentifié
   */
  static verifyAuth(context: CallableContext): string {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Authentification requise pour accéder à cette fonctionnalité'
      );
    }
    
    return context.auth.uid;
  }
}

/**
 * Interface pour les options de requêtes API externes
 */
interface ApiRequestOptions {
  method?: string;
  endpoint: string;
  params?: Record<string, string>;
  body?: any;
  headers?: Record<string, string>;
}

/**
 * Service pour gérer les requêtes API externes
 */
class ApiService {
  /**
   * Effectue une requête API externe avec gestion d'erreur
   * @param service Nom du service (ex: "tmdb", "stripe")
   * @param options Options de la requête
   * @returns Données de la réponse
   */
  static async makeApiRequest(service: string, options: ApiRequestOptions): Promise<any> {
    try {
      // Construire l'URL avec les paramètres
      const url = new URL(options.endpoint);
      
      // Ajouter les paramètres à l'URL
      if (options.params) {
        Object.entries(options.params).forEach(([key, value]) => {
          url.searchParams.append(key, value);
        });
      }
      
      // Préparer les headers
      const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      };
      
      // Effectuer la requête
      console.log(`Appel API ${service}: ${options.method || 'GET'} ${url.toString()}`);
      
      const response = await fetch(url.toString(), {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erreur API ${service} (${response.status}):`, errorText);
        throw new functions.https.HttpsError(
          'unavailable',
          `Le service ${service} a retourné une erreur: ${response.status}`
        );
      }
      
      // Analyser la réponse JSON
      return await response.json();
    } catch (error: any) {
      // Log détaillé pour le débogage
      console.error(`Échec de requête vers ${service} API:`, error);
      
      // Reformater l'erreur pour le client
      if (error instanceof functions.https.HttpsError) {
        throw error; // Réutiliser l'erreur déjà formatée
      } else {
        throw new functions.https.HttpsError(
          'internal',
          `Erreur lors de la communication avec le service ${service}`,
          { originalMessage: error.message }
        );
      }
    }
  }
}

/**
 * Interfaces pour les données de requête
 */
interface MovieDetailsData {
  movieId: string;
}

interface PaymentData {
  amount: number;
  currency?: string;
  paymentMethod: string;
}

/**
 * Service TMDB pour gérer les interactions avec l'API TMDB
 */
class TMDBService {
  private static readonly API_BASE_URL = 'https://api.themoviedb.org/3';
  
  /**
   * Obtient les détails d'un film par son ID
   */
  static async getMovieDetails(movieId: string): Promise<any> {
    const apiKey = ConfigService.getApiKey('TMDB_API_KEY', 'tmdb.key');
    
    return ApiService.makeApiRequest('tmdb', {
      endpoint: `${this.API_BASE_URL}/movie/${movieId}`,
      params: {
        api_key: apiKey,
        language: 'fr-FR'
      }
    });
  }
  
  /**
   * Obtient les films à l'affiche
   */
  static async getNowPlayingMovies(page: number = 1): Promise<any> {
    const apiKey = ConfigService.getApiKey('TMDB_API_KEY', 'tmdb.key');
    
    return ApiService.makeApiRequest('tmdb', {
      endpoint: `${this.API_BASE_URL}/movie/now_playing`,
      params: {
        api_key: apiKey,
        language: 'fr-FR',
        page: page.toString()
      }
    });
  }
  
  /**
   * Recherche de films par mot-clé
   */
  static async searchMovies(query: string, page: number = 1): Promise<any> {
    const apiKey = ConfigService.getApiKey('TMDB_API_KEY', 'tmdb.key');
    
    return ApiService.makeApiRequest('tmdb', {
      endpoint: `${this.API_BASE_URL}/search/movie`,
      params: {
        api_key: apiKey,
        language: 'fr-FR',
        query,
        page: page.toString()
      }
    });
  }
}

/**
 * Service de paiement pour gérer les transactions
 */
class PaymentService {
  /**
   * Traite un paiement via le fournisseur configuré (Stripe)
   */
  static async processPayment(userId: string, amount: number, currency: string, paymentMethod: string): Promise<any> {
    const apiKey = ConfigService.getApiKey('STRIPE_API_KEY', 'stripe.key');
    
    // En production, il faudrait implémenter la vraie intégration avec Stripe
    // Ceci est une version simplifiée pour la démonstration
    console.log(`Traitement de paiement pour l'utilisateur ${userId}`);
    console.log(`Montant: ${amount} ${currency}`);
    console.log(`Traitement avec la clé Stripe ${apiKey.substring(0, 3)}...`);
    
    // Simuler un appel à Stripe (à remplacer par un vrai appel dans un environnement de production)
    const transactionId = `tx_${Date.now()}`;
    
    // Enregistrer la transaction dans Firestore
    await admin.firestore().collection('payments').add({
      userId,
      amount,
      currency,
      paymentMethod,
      status: 'completed',
      transactionId,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return {
      success: true,
      transactionId,
      amount,
      currency
    };
  }
}

/**
 * Service de cache pour optimiser les performances
 */
class CacheService {
  /**
   * Récupère des données du cache ou appelle la fonction si les données ne sont pas en cache
   * @param cacheKey Clé de cache (collection/document)
   * @param ttlMinutes Durée de vie du cache en minutes
   * @param fetchFn Fonction pour récupérer les données fraîches
   */
  static async getOrSet<T>(
    cacheKey: { collection: string; document: string },
    ttlMinutes: number,
    fetchFn: () => Promise<T>
  ): Promise<{ data: T; fromCache: boolean }> {
    const { collection, document } = cacheKey;
    const cacheRef = admin.firestore().collection(collection).doc(document);
    const cacheDoc = await cacheRef.get();
    
    // Vérifier si les données en cache sont valides
    if (cacheDoc.exists) {
      const cachedData = cacheDoc.data();
      if (cachedData) {
        const cachedTime = cachedData.timestamp?.toDate() || new Date(0);
        const ttlMillis = ttlMinutes * 60 * 1000;
        const expiryTime = new Date(cachedTime.getTime() + ttlMillis);
        
        if (expiryTime > new Date()) {
          console.log(`Cache hit pour ${collection}/${document}`);
          return { data: cachedData.data as T, fromCache: true };
        }
      }
    }
    
    // Récupérer les données fraîches
    console.log(`Cache miss pour ${collection}/${document}, récupération des données fraîches`);
    const freshData = await fetchFn();
    
    // Mettre à jour le cache
    await cacheRef.set({
      data: freshData,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { data: freshData, fromCache: false };
  }
}

// ====== Cloud Functions ======

/**
 * Cloud Function pour obtenir les détails d'un film
 */
export const getMovieDetails = functions.https.onCall(async (data: MovieDetailsData, context: CallableContext) => {
  try {
    // Vérifier l'authentification
    const userId = ConfigService.verifyAuth(context);
    
    // Validation des données
    const { movieId } = data;
    if (!movieId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'L\'ID du film est requis'
      );
    }
    
    console.log(`Utilisateur ${userId} demande des informations sur le film ${movieId}`);
    
    // Utiliser le cache avec TTL de 24h pour les détails de films
    const result = await CacheService.getOrSet(
      { collection: 'tmdb', document: `movie_${movieId}` },
      24 * 60, // 24 heures en minutes
      () => TMDBService.getMovieDetails(movieId)
    );
    
    // Enregistrer la recherche dans l'historique
    await admin.firestore().collection('users').doc(userId).collection('history').add({
      type: 'movie_details',
      movieId,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return {
      success: true,
      data: result.data,
      fromCache: result.fromCache
    };
  } catch (error: any) {
    console.error('Erreur dans getMovieDetails:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', error.message || 'Erreur interne');
  }
});

/**
 * Cloud Function pour obtenir les films à l'affiche
 */
export const getNowPlayingMovies = functions.https.onCall(async (data: { page?: number }, context: CallableContext) => {
  try {
    // Ignorer complètement l'authentification ou utiliser une syntaxe qui évite la création d'une variable non utilisée
    // const _userId = context.auth?.uid;
    
    const page = data?.page || 1;
    
    // Utiliser le cache avec TTL de 6h pour les films à l'affiche
    const result = await CacheService.getOrSet(
      { collection: 'tmdb', document: `now_playing_${page}` },
      6 * 60, // 6 heures en minutes
      () => TMDBService.getNowPlayingMovies(page)
    );
    
    return {
      success: true,
      data: result.data,
      fromCache: result.fromCache
    };
  } catch (error: any) {
    console.error('Erreur dans getNowPlayingMovies:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', error.message || 'Erreur interne');
  }
});

/**
 * Cloud Function pour rechercher des films
 */
export const searchMovies = functions.https.onCall(
  async (data: { query: string; page?: number }, context: CallableContext) => {
    try {
      // Vérifier l'authentification
      const userId = ConfigService.verifyAuth(context);
      
      // Validation des paramètres
      const { query, page = 1 } = data;
      if (!query) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Le terme de recherche est requis'
        );
      }
      
      // Utiliser le cache avec TTL court pour les recherches (1h)
      const result = await CacheService.getOrSet(
        { collection: 'tmdb', document: `search_${query.toLowerCase()}_${page}` },
        60, // 1 heure en minutes
        () => TMDBService.searchMovies(query, page)
      );
      
      // Enregistrer la recherche
      await admin.firestore().collection('users').doc(userId).collection('searches').add({
        query,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return {
        success: true,
        data: result.data,
        fromCache: result.fromCache
      };
    } catch (error: any) {
      console.error('Erreur dans searchMovies:', error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError('internal', error.message || 'Erreur interne');
    }
  }
);

/**
 * Cloud Function pour traiter un paiement
 */
export const processPayment = functions.https.onCall(async (data: PaymentData, context: CallableContext) => {
  try {
    // Vérifier l'authentification
    const userId = ConfigService.verifyAuth(context);
    
    // Validation des données
    const { amount, currency = 'EUR', paymentMethod } = data;
    
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Le montant doit être un nombre positif'
      );
    }
    
    if (!paymentMethod) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'La méthode de paiement est requise'
      );
    }
    
    // Traiter le paiement
    const result = await PaymentService.processPayment(userId, amount, currency, paymentMethod);
    
    return {
      success: true,
      transactionId: result.transactionId,
      amount: result.amount,
      currency: result.currency
    };
  } catch (error: any) {
    console.error('Erreur dans processPayment:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', error.message || 'Erreur de paiement');
  }
});

/**
 * Cloud Function HTTP pour les films à l'affiche (API REST)
 */
export const nowPlayingMoviesApi = functions.https.onRequest(async (req, res) => {
  try {
    // Configuration CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    
    // Validation de la requête
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Méthode non autorisée' });
      return;
    }
    
    // Récupérer la page depuis les query params
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    
    // Utiliser le service avec cache
    const result = await CacheService.getOrSet(
      { collection: 'tmdb', document: `now_playing_${page}` },
      6 * 60, // 6 heures
      () => TMDBService.getNowPlayingMovies(page)
    );
    
    // Répondre avec les données
    res.status(200).json({
      success: true,
      data: result.data,
      fromCache: result.fromCache
    });
  } catch (error: any) {
    console.error('Erreur dans nowPlayingMoviesApi:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: error.message || 'Une erreur inconnue s\'est produite'
    });
  }
});

// Pour la compatibilité avec les anciennes versions (si nécessaire)
export const getTmdbData = functions.https.onCall(async (data, context) => {
  console.warn('Fonction deprecée: getTmdbData. Utilisez getMovieDetails à la place.');
  
  try {
    // Vérifier l'authentification
    const userId = ConfigService.verifyAuth(context);
    
    // Utiliser la même logique que dans getMovieDetails
    const movieId = (data as MovieDetailsData).movieId;
    if (!movieId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'L\'ID du film est requis'
      );
    }
    
    console.log(`Utilisateur ${userId} demande des informations sur le film ${movieId}`);
    
    // Utiliser le cache avec TTL de 24h pour les détails de films
    const result = await CacheService.getOrSet(
      { collection: 'tmdb', document: `movie_${movieId}` },
      24 * 60, // 24 heures en minutes
      () => TMDBService.getMovieDetails(movieId)
    );
    
    // Enregistrer la recherche dans l'historique
    await admin.firestore().collection('users').doc(userId).collection('history').add({
      type: 'movie_details',
      movieId,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return {
      success: true,
      data: result.data,
      fromCache: result.fromCache
    };
  } catch (error: any) {
    console.error('Erreur dans getTmdbData:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', error.message || 'Erreur interne');
  }
});
