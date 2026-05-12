/**
 * save-events.js
 * Module partagé pour sauvegarder des événements dans Supabase.
 * Utilisé par tous les scrapers (Instagram, RA, Shotgun, etc.)
 *
 * Usage :
 *   const { saveEvents } = require('./save-events');
 *   await saveEvents(events, 'resident-advisor');
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const ADMIN_UUID = process.env.SUPABASE_ADMIN_UUID || 'b8750c46-6717-4427-aac4-3e5c1e5a86c5';
const VALID_CATEGORIES = ['soirees', 'activites', 'a-boire', 'a-manger'];

// ============================================================
// NORMALISATION
// ============================================================

function normalizeEvent(event, source) {
  const now = new Date().toISOString();

  return {
    title:            (event.title || '').substring(0, 200),
    description:      (event.description || '').substring(0, 2000),
    date:             event.date || now,
    price:            event.price ?? null,
    image_url:        event.image_url || null,
    location:         (event.location || 'Lyon').substring(0, 200),
    address:          (event.address || event.location || 'Lyon').substring(0, 300),
    category:         VALID_CATEGORIES.includes(event.category) ? event.category : 'activites',
    venue_category:   event.venue_category || 'club',
    ambiance:         event.ambiance || 'festif',
    event_format:     event.event_format || 'soiree-libre',
    social_intensity: event.social_intensity || 'moyen',
    external_url:     event.external_url || null,
    tags:             Array.isArray(event.tags) ? event.tags : ['lyon', source],
    created_by:       ADMIN_UUID,
    created_by_type:  'admin',
    status:           'pending',
    views:            0,
    likes:            0,
    participants:     0,
    search_appearances: 0,
    created_at:       now,
    updated_at:       now,
    scraped_at:       now,
    actual_participants: 0,
    no_show_count:    0,
  };
}

// ============================================================
// DÉDUPLICATION
// ============================================================

async function getExistingUrls(urls) {
  if (!urls.length) return new Set();
  const { data } = await supabase
    .from('events')
    .select('external_url')
    .in('external_url', urls);
  return new Set((data || []).map(e => e.external_url).filter(Boolean));
}

// ============================================================
// SAUVEGARDE
// ============================================================

/**
 * Sauvegarde un tableau d'événements dans Supabase.
 * @param {Array} rawEvents - Événements bruts
 * @param {string} source   - Nom de la source ('resident-advisor', 'shotgun', etc.)
 * @returns {{ saved, skipped, errors }}
 */
async function saveEvents(rawEvents, source) {
  if (!rawEvents.length) {
    console.log(`[${source}] Aucun événement à sauvegarder`);
    return { saved: 0, skipped: 0, errors: 0 };
  }

  // Normaliser
  const events = rawEvents.map(e => normalizeEvent(e, source));

  // Dédupliquer : exclure les external_url déjà en base
  const withUrl    = events.filter(e => e.external_url);
  const withoutUrl = events.filter(e => !e.external_url);
  const existingUrls = await getExistingUrls(withUrl.map(e => e.external_url));

  const toInsert = [
    ...withUrl.filter(e => !existingUrls.has(e.external_url)),
    ...withoutUrl
  ];

  const skipped = events.length - toInsert.length;
  if (skipped > 0) console.log(`[${source}] ${skipped} doublon(s) ignoré(s)`);
  if (!toInsert.length) return { saved: 0, skipped, errors: 0 };

  // Insérer par batch de 10
  const BATCH = 10;
  let saved = 0;
  let errors = 0;

  for (let i = 0; i < toInsert.length; i += BATCH) {
    const batch = toInsert.slice(i, i + BATCH);
    const { error } = await supabase.from('events').insert(batch);
    if (error) {
      console.error(`[${source}] Erreur batch ${Math.floor(i / BATCH) + 1}:`, error.message);
      errors += batch.length;
    } else {
      saved += batch.length;
    }
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`[${source}] ✅ ${saved} événement(s) sauvegardé(s) — ${errors} erreur(s)`);
  return { saved, skipped, errors };
}

module.exports = { saveEvents, normalizeEvent, supabase, ADMIN_UUID };
