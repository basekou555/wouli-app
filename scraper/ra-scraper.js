/**
 * ra-scraper.js
 * Récupère les événements Lyon depuis Resident Advisor (API GraphQL publique)
 *
 * Usage :
 *   node ra-scraper.js           — scrape les 30 prochains jours
 *   node ra-scraper.js --days 14 — scrape les 14 prochains jours
 *   node ra-scraper.js --find-id — affiche l'area ID de Lyon et quitte
 */

const { saveEvents } = require('./save-events');
require('dotenv').config();

const RA_ENDPOINT = 'https://ra.co/graphql';
const RA_BASE     = 'https://ra.co';
const IMAGE_BASE  = 'https://imagecdn.residentadvisor.net/images/';
const SOURCE      = 'resident-advisor';

// ============================================================
// CONFIG
// ============================================================

const CONFIG = {
  // Area ID RA pour Lyon — lancer avec --find-id pour le découvrir
  // puis mettre à jour cette valeur
  LYON_AREA_ID: process.env.RA_LYON_AREA_ID || null,
  DAYS_AHEAD: parseInt(process.argv.find((a, i) => process.argv[i - 1] === '--days') || '30'),
  PAGE_SIZE: 50,
};

// ============================================================
// HELPERS DATE
// ============================================================

function isoDate(date) {
  return date.toISOString().split('T')[0];
}

function dateRange(daysAhead) {
  const from = new Date();
  const to   = new Date(Date.now() + daysAhead * 24 * 3600 * 1000);
  return { from: isoDate(from), to: isoDate(to) };
}

// ============================================================
// API RA
// ============================================================

async function raQuery(query, variables = {}) {
  const res = await fetch(RA_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Referer':      'https://ra.co/',
      'Origin':       'https://ra.co',
      'User-Agent':   'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) throw new Error(`RA API ${res.status}: ${res.statusText}`);
  const data = await res.json();
  if (data.errors) throw new Error(`RA GraphQL: ${data.errors[0]?.message}`);
  return data.data;
}

// ============================================================
// DÉCOUVERTE DE L'AREA ID DE LYON
// ============================================================

async function findLyonAreaId() {
  console.log('Recherche de l\'area ID RA pour Lyon...');

  const query = `
    query SearchAreas($query: String) {
      areas(query: $query) {
        id
        name
        urlName
        country { name }
      }
    }
  `;

  try {
    const data = await raQuery(query, { query: 'Lyon' });
    const areas = data.areas || [];
    const lyon  = areas.find(a =>
      a.name.toLowerCase().includes('lyon') ||
      a.urlName?.toLowerCase().includes('lyon')
    );

    if (lyon) {
      console.log(`✅ Area trouvé : ${lyon.name} (ID: ${lyon.id}, pays: ${lyon.country?.name})`);
      console.log(`   → Ajoute RA_LYON_AREA_ID=${lyon.id} dans ton .env`);
      return lyon.id;
    }

    console.log('Areas trouvés :');
    areas.forEach(a => console.log(`  - ${a.name} (ID: ${a.id}) — ${a.country?.name}`));
    console.log('\n❌ Lyon non trouvé. Essaie avec un autre terme de recherche.');
    return null;
  } catch (e) {
    // Certaines versions de l'API n'ont pas ce query — fallback sur listingDate
    console.log('Recherche par areas non disponible, essai via listings...');
    return await findLyonAreaIdViaListings();
  }
}

async function findLyonAreaIdViaListings() {
  // Approche alternative : scraper la page RA Lyon pour extraire l'area ID
  const res = await fetch('https://ra.co/events/fr/lyon', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html',
    }
  });
  const html = await res.text();

  // L'area ID est souvent dans le JSON hydraté de la page
  const match = html.match(/"area"\s*:\s*\{\s*"id"\s*:\s*"?(\d+)"?/);
  if (match) {
    console.log(`✅ Area ID extrait depuis la page : ${match[1]}`);
    console.log(`   → Ajoute RA_LYON_AREA_ID=${match[1]} dans ton .env`);
    return match[1];
  }

  console.log('❌ Impossible de trouver l\'area ID automatiquement.');
  console.log('   → Va sur https://ra.co/events/fr/lyon et cherche "areaId" dans le code source');
  return null;
}

// ============================================================
// RÉCUPÉRATION DES ÉVÉNEMENTS
// ============================================================

async function fetchRAEvents(areaId, daysAhead = 30) {
  const { from, to } = dateRange(daysAhead);
  console.log(`Récupération des events RA Lyon (${from} → ${to})...`);

  const query = `
    query GetEventListings(
      $filters: FilterInputDtoInput
      $pageSize: Int
      $page: Int
    ) {
      eventListings(
        filters: $filters
        pageSize: $pageSize
        page: $page
        sortOrder: "ascending"
      ) {
        data {
          id
          listingDate
          event {
            id
            title
            startTime
            endTime
            contentUrl
            cost
            images { filename type }
            venue {
              id
              name
              address
              area { id name }
            }
            artists { id name }
          }
        }
        totalResults
      }
    }
  `;

  const allEvents = [];
  let page = 1;

  while (true) {
    const data = await raQuery(query, {
      filters: {
        areas: { id: String(areaId) },
        listingDate: { gte: from, lte: to },
      },
      pageSize: CONFIG.PAGE_SIZE,
      page,
    });

    const listings = data?.eventListings?.data || [];
    const total    = data?.eventListings?.totalResults || 0;

    allEvents.push(...listings.map(l => l.event).filter(Boolean));
    console.log(`   Page ${page} : ${listings.length} events (total: ${total})`);

    if (allEvents.length >= total || listings.length < CONFIG.PAGE_SIZE) break;
    page++;
    await new Promise(r => setTimeout(r, 1000));
  }

  return allEvents;
}

// ============================================================
// CONVERSION AU FORMAT WOULI
// ============================================================

function parsePrice(costStr) {
  if (!costStr) return null;
  const lower = costStr.toLowerCase();
  if (lower.includes('free') || lower.includes('gratuit')) return 0;
  const match = costStr.match(/[\d,]+/);
  return match ? parseFloat(match[0].replace(',', '.')) : null;
}

function buildImageUrl(images) {
  if (!images || !images.length) return null;
  const main = images.find(i => i.type === 'main') || images[0];
  if (!main?.filename) return null;
  return `${IMAGE_BASE}${main.filename}`;
}

function buildDescription(event) {
  const artists = (event.artists || []).map(a => a.name).join(', ');
  const venue   = event.venue?.name || '';
  const date    = event.startTime ? new Date(event.startTime).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long'
  }) : '';

  let desc = event.title;
  if (venue)   desc += ` au ${venue}`;
  if (date)    desc += ` — ${date}`;
  if (artists) desc += `\n\n🎵 ${artists}`;
  if (event.cost) desc += `\n💰 ${event.cost}`;

  return desc.substring(0, 2000);
}

function convertToWouli(raEvent) {
  if (!raEvent?.title || !raEvent?.startTime) return null;

  return {
    title:         raEvent.title,
    description:   buildDescription(raEvent),
    date:          raEvent.startTime,
    price:         parsePrice(raEvent.cost),
    image_url:     buildImageUrl(raEvent.images),
    location:      raEvent.venue?.name || 'Lyon',
    address:       raEvent.venue?.address || 'Lyon',
    category:      'soirees',
    venue_category: 'club',
    ambiance:      'festif',
    event_format:  'soiree-libre',
    social_intensity: 'moyen',
    external_url:  raEvent.contentUrl ? `${RA_BASE}${raEvent.contentUrl}` : null,
    tags:          ['lyon', 'resident-advisor', 'electronic',
                    ...(raEvent.artists || []).map(a => a.name.toLowerCase())].slice(0, 10),
  };
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('🎵 RESIDENT ADVISOR SCRAPER — Lyon\n');

  // Mode découverte : affiche l'area ID et quitte
  if (process.argv.includes('--find-id')) {
    await findLyonAreaId();
    return;
  }

  // Vérifier l'area ID
  let areaId = CONFIG.LYON_AREA_ID;
  if (!areaId) {
    console.log('RA_LYON_AREA_ID non configuré — recherche automatique...\n');
    areaId = await findLyonAreaId();
    if (!areaId) {
      console.error('\n❌ Configure RA_LYON_AREA_ID dans ton .env et relance.');
      process.exit(1);
    }
    console.log('');
  }

  // Récupérer les events
  const raEvents = await fetchRAEvents(areaId, CONFIG.DAYS_AHEAD);
  console.log(`\n${raEvents.length} event(s) RA trouvé(s)\n`);

  if (!raEvents.length) {
    console.log('Aucun événement à importer.');
    return;
  }

  // Convertir au format Wouli
  const events = raEvents.map(convertToWouli).filter(Boolean);
  console.log(`${events.length} event(s) valides après conversion\n`);

  // Aperçu
  events.slice(0, 5).forEach(e => {
    const d = new Date(e.date).toLocaleDateString('fr-FR');
    console.log(`  ${d} — ${e.title} @ ${e.location}`);
  });
  if (events.length > 5) console.log(`  ... et ${events.length - 5} autres`);

  // Sauvegarder
  console.log('');
  const stats = await saveEvents(events, SOURCE);

  console.log(`\n📊 Résumé RA :`);
  console.log(`   Importés  : ${stats.saved}`);
  console.log(`   Doublons  : ${stats.skipped}`);
  console.log(`   Erreurs   : ${stats.errors}`);
}

main().catch(e => {
  console.error('❌ Erreur fatale:', e.message);
  process.exit(1);
});
