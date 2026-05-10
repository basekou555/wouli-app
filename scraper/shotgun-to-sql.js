/**
 * SHOTGUN TO SUPABASE SQL GENERATOR
 * Génère des requêtes SQL INSERT pour importer les événements Shotgun dans Wouli
 *
 * USAGE:
 * 1. Configure les constantes en haut du fichier (ADMIN_USER_ID, etc.)
 * 2. node shotgun-to-sql.js
 * 3. Copie le SQL généré dans l'éditeur SQL de Supabase
 */

const fs = require('fs');

// ============================================================================
// CONFIGURATION À PERSONNALISER
// ============================================================================

const CONFIG = {
  // ID de l'utilisateur admin/scraper qui créera les events
  ADMIN_USER_ID: 'b8750c46-6717-4427-aac4-3e5c1e5a86c5',

  // Type de créateur
  CREATED_BY_TYPE: 'admin',

  // ID par défaut si venue non trouvée (NULL ou UUID d'un lieu par défaut)
  DEFAULT_VENUE_ID: null,

  // Valeurs par défaut pour les champs obligatoires
  DEFAULTS: {
    category: 'soirees',           // Tous les events Shotgun = soirées
    venue_category: 'club',         // Tous les events Shotgun = club
    ambiance: 'festif',
    social_intensity: 'moyen',
    event_format: 'soiree-libre',
    status: 'validated'             // Events Shotgun = déjà validés
  },

  // Mapping des lieux connus vers leurs IDs (à remplir avec tes venues existantes)
  VENUE_MAPPING: {
    'Le Sucre': null,           // Remplacer par UUID si existe
    'Le Transbordeur': null,
    'Ninkasi': null,
    'Azar': null,
    // Ajoute tes autres venues ici
  },

  // Input/Output
  INPUT_FILE: 'shotgun-events.json',
  OUTPUT_FILE: 'shotgun-import.sql'
};

// ============================================================================
// VALIDATION & SÉCURITÉ
// ============================================================================

/**
 * Valeurs autorisées selon les contraintes de la table events
 */
const VALID_VALUES = {
  category: ['soirees', 'concerts', 'expositions', 'ateliers', 'sports', 'conferences', 'projections'],
  ambiance: ['chill', 'festif', 'culturel', 'sportif', 'chic', 'casual'],
  event_format: ['soiree-libre', 'tournoi', 'atelier', 'performance', 'exposition', 'projection', 'competition'],
  social_intensity: ['solo', 'petit-groupe', 'moyen', 'grand-groupe'],
  venue_category: ['bar', 'club', 'restaurant', 'salle-spectacle', 'activite', 'culture', 'espace-exterieur']
};

/**
 * Valide et corrige une valeur enum
 */
function validateEnum(value, type, defaultValue) {
  if (VALID_VALUES[type].includes(value)) {
    return value;
  }
  console.warn(`⚠️  Valeur invalide pour ${type}: "${value}" → utilise "${defaultValue}"`);
  return defaultValue;
}

// ============================================================================
// MAPPING INTELLIGENT
// ============================================================================

/**
 * Déduit la catégorie de venue depuis le nom
 */
function guessVenueCategory(venueName) {
  const name = venueName.toLowerCase();

  if (name.includes('club') || name.includes('sucre') || name.includes('warehouse')) {
    return 'club';
  }
  if (name.includes('bar') || name.includes('ninkasi')) {
    return 'bar';
  }
  if (name.includes('transbordeur') || name.includes('salle') || name.includes('amphithéâtre')) {
    return 'salle-spectacle';
  }
  if (name.includes('restaurant') || name.includes('brasserie')) {
    return 'restaurant';
  }
  if (name.includes('musée') || name.includes('galerie')) {
    return 'culture';
  }
  if (name.includes('escape') || name.includes('laser')) {
    return 'activite';
  }

  return CONFIG.DEFAULTS.venue_category;
}

/**
 * Déduit l'ambiance depuis les tags et le titre
 */
function guessAmbiance(title, tags) {
  const text = (title + ' ' + (tags || []).join(' ')).toLowerCase();

  if (text.match(/techno|house|electro|rave|club/i)) {
    return 'festif';
  }
  if (text.match(/jazz|classique|concert|live/i)) {
    return 'culturel';
  }
  if (text.match(/afterwork|apéro|chill|lounge/i)) {
    return 'chill';
  }
  if (text.match(/gala|cocktail|vernissage/i)) {
    return 'chic';
  }

  return CONFIG.DEFAULTS.ambiance;
}

/**
 * Déduit le format d'événement
 */
function guessEventFormat(title, tags) {
  const text = (title + ' ' + (tags || []).join(' ')).toLowerCase();

  if (text.match(/concert|live|performance/i)) {
    return 'performance';
  }
  if (text.match(/exposition|expo|galerie/i)) {
    return 'exposition';
  }
  if (text.match(/projection|cinéma|film/i)) {
    return 'projection';
  }
  if (text.match(/atelier|workshop|cours/i)) {
    return 'atelier';
  }
  if (text.match(/tournoi|compétition/i)) {
    return 'tournoi';
  }

  return CONFIG.DEFAULTS.event_format;
}

/**
 * Parse le prix "11,00 €" → 11.00
 */
function parsePrice(priceString) {
  if (!priceString) return null;

  const match = priceString.match(/[\d,]+/);
  if (!match) return null;

  return parseFloat(match[0].replace(',', '.'));
}

/**
 * Échappe les quotes pour SQL et gère les caractères problématiques
 */
function escapeSql(str) {
  if (!str) return null;

  // Remplacer les apostrophes par doubles apostrophes (SQL standard)
  let escaped = str.replace(/'/g, "''");

  // Remplacer les caractères null/contrôle qui peuvent poser problème
  escaped = escaped.replace(/\0/g, '');

  // Normaliser les espaces et sauts de ligne
  escaped = escaped.replace(/\r\n/g, '\n');
  escaped = escaped.replace(/\r/g, '\n');

  return escaped;
}

/**
 * Génère une description basique depuis le titre et les tags
 */
function generateDescription(title, tags, venue, dateText, price) {
  let desc = `${title}`;

  if (venue && venue !== 'Lyon') {
    desc += ` au ${venue}`;
  }

  if (dateText) {
    desc += ` le ${dateText}`;
  }

  if (tags && tags.length > 0) {
    desc += `\n\n🎵 ${tags.join(' · ')}`;
  }

  if (price) {
    desc += `\n💰 À partir de ${price}`;
  }

  // Sécurité : tronquer strictement à 1900 chars pour laisser de la marge
  if (desc.length > 1900) {
    desc = desc.substring(0, 1897) + '...';
  }

  return desc;
}

// ============================================================================
// GÉNÉRATEUR SQL
// ============================================================================

function generateInsertSQL(events) {
  let sql = '';
  let stats = {
    total: events.length,
    withPrice: 0,
    withVenue: 0,
    skipped: 0
  };

  sql += `-- ============================================================================\n`;
  sql += `-- IMPORT ÉVÉNEMENTS SHOTGUN LYON\n`;
  sql += `-- Généré le: ${new Date().toISOString()}\n`;
  sql += `-- Total événements: ${events.length}\n`;
  sql += `-- ============================================================================\n\n`;

  sql += `BEGIN;\n\n`;

  events.forEach((event, index) => {
    // Validation basique
    if (!event.title || event.title.length < 3) {
      stats.skipped++;
      sql += `-- SKIPPED (titre invalide): ${event.title || 'N/A'}\n`;
      return;
    }

    if (!event.datetime) {
      stats.skipped++;
      sql += `-- SKIPPED (pas de date): ${event.title}\n`;
      return;
    }

    // Validation de la date
    const eventDate = new Date(event.datetime);
    if (isNaN(eventDate.getTime())) {
      stats.skipped++;
      sql += `-- SKIPPED (date invalide): ${event.title} - ${event.datetime}\n`;
      return;
    }

    // Parsing des données
    const title = escapeSql(event.title.substring(0, 200));
    const imageUrl = escapeSql(event.image);
    const eventUrl = escapeSql(event.url);
    const date = event.datetime;
    const price = parsePrice(event.price);
    const venue = event.venue || 'Lyon';
    const location = escapeSql(venue); // Nom du lieu pour la colonne location
    const venueId = CONFIG.VENUE_MAPPING[venue] || CONFIG.DEFAULT_VENUE_ID;

    // Mapping intelligent avec validation
    const category = CONFIG.DEFAULTS.category;  // 'soirees' pour tous
    const venueCategory = CONFIG.DEFAULTS.venue_category;  // 'club' pour tous
    const ambiance = validateEnum(guessAmbiance(event.title, event.tags), 'ambiance', CONFIG.DEFAULTS.ambiance);
    const eventFormat = validateEnum(guessEventFormat(event.title, event.tags), 'event_format', CONFIG.DEFAULTS.event_format);
    const socialIntensity = validateEnum(CONFIG.DEFAULTS.social_intensity, 'social_intensity', 'moyen');
    const description = escapeSql(generateDescription(
      event.title,
      event.tags,
      venue,
      event.dateText,
      event.price
    ));

    // Stats
    if (price) stats.withPrice++;
    if (venueId) stats.withVenue++;

    // Génération SQL
    sql += `-- Event ${index + 1}: ${event.title}\n`;
    sql += `INSERT INTO events (\n`;
    sql += `  title,\n`;
    sql += `  description,\n`;
    sql += `  date,\n`;
    sql += `  price,\n`;
    sql += `  image_url,\n`;
    sql += `  location,\n`;
    sql += `  category,\n`;
    sql += `  venue_category,\n`;
    sql += `  ambiance,\n`;
    sql += `  event_format,\n`;
    sql += `  social_intensity,\n`;
    sql += `  created_by,\n`;
    sql += `  created_by_type,\n`;
    if (venueId) sql += `  venue_id,\n`;
    sql += `  status\n`;
    sql += `) VALUES (\n`;
    sql += `  '${title}',\n`;
    sql += `  '${description}',\n`;
    sql += `  '${date}',\n`;
    sql += `  ${price !== null ? price : 'NULL'},\n`;
    sql += `  '${imageUrl}',\n`;
    sql += `  '${location}',\n`;
    sql += `  '${category}',\n`;
    sql += `  '${venueCategory}',\n`;
    sql += `  '${ambiance}',\n`;
    sql += `  '${eventFormat}',\n`;
    sql += `  '${socialIntensity}',\n`;
    sql += `  '${CONFIG.ADMIN_USER_ID}',\n`;
    sql += `  '${CONFIG.CREATED_BY_TYPE}',\n`;
    if (venueId) sql += `  '${venueId}',\n`;
    sql += `  '${CONFIG.DEFAULTS.status}'\n`;
    sql += `);\n\n`;
  });

  sql += `COMMIT;\n\n`;

  // Stats finales
  sql += `-- ============================================================================\n`;
  sql += `-- STATISTIQUES\n`;
  sql += `-- Total: ${stats.total}\n`;
  sql += `-- Importés: ${stats.total - stats.skipped}\n`;
  sql += `-- Ignorés: ${stats.skipped}\n`;
  sql += `-- Avec prix: ${stats.withPrice}\n`;
  sql += `-- Avec venue_id: ${stats.withVenue}\n`;
  sql += `-- ============================================================================\n`;

  return { sql, stats };
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  console.log('🎯 SHOTGUN TO SUPABASE SQL GENERATOR\n');

  // Vérifier que le JSON existe
  if (!fs.existsSync(CONFIG.INPUT_FILE)) {
    console.error(`❌ Erreur: Le fichier "${CONFIG.INPUT_FILE}" n'existe pas.`);
    console.log('Exécute d\'abord: node shotgun-parser.js\n');
    process.exit(1);
  }

  // Lire les événements
  console.log(`📄 Lecture de ${CONFIG.INPUT_FILE}...`);
  const events = JSON.parse(fs.readFileSync(CONFIG.INPUT_FILE, 'utf-8'));
  console.log(`✅ ${events.length} événements chargés\n`);

  // Générer le SQL
  console.log('🔧 Génération du SQL...');
  const { sql, stats } = generateInsertSQL(events);

  // Sauvegarder
  fs.writeFileSync(CONFIG.OUTPUT_FILE, sql, 'utf-8');
  console.log(`\n💾 SQL généré dans ${CONFIG.OUTPUT_FILE}\n`);

  // Afficher les stats
  console.log('📊 Statistiques:');
  console.log(`- Total événements: ${stats.total}`);
  console.log(`- Seront importés: ${stats.total - stats.skipped}`);
  console.log(`- Ignorés (invalides): ${stats.skipped}`);
  console.log(`- Avec prix: ${stats.withPrice}`);
  console.log(`- Avec venue_id: ${stats.withVenue}`);

  // Warnings
  console.log('\n⚠️  AVANT D\'EXÉCUTER LE SQL:');
  console.log('✅ 1. ADMIN_USER_ID configuré');
  console.log('⚠️  2. Vérifie que les venues existent ou configure DEFAULT_VENUE_ID');
  console.log('⚠️  3. Teste d\'abord avec 1-2 events avant le batch complet');

  console.log('\n🚀 Prochaines étapes:');
  console.log(`1. Ouvre Supabase SQL Editor`);
  console.log(`2. Copie-colle le contenu de ${CONFIG.OUTPUT_FILE}`);
  console.log(`3. Exécute la requête`);
  console.log(`4. Vérifie dans ta table events\n`);
}

try {
  main();
} catch (error) {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
}
