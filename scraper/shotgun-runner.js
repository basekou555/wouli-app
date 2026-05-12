/**
 * shotgun-runner.js
 * Scrape Shotgun Lyon directement (sans étape HTML manuelle)
 * et sauvegarde les événements dans Supabase via save-events.js
 *
 * Usage :
 *   node shotgun-runner.js           — scrape et importe
 *   node shotgun-runner.js --dry-run — affiche sans importer
 */

const cheerio = require('cheerio');
const { saveEvents } = require('./save-events');
require('dotenv').config();

const SHOTGUN_URL = 'https://shotgun.live/fr/cities/lyon';
const SHOTGUN_BASE = 'https://shotgun.live';
const SOURCE = 'shotgun';
const DRY_RUN = process.argv.includes('--dry-run');

// ============================================================
// SCRAPING
// ============================================================

async function fetchShotgunHtml() {
  console.log(`Téléchargement de ${SHOTGUN_URL}...`);
  const res = await fetch(SHOTGUN_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'fr-FR,fr;q=0.9',
    }
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.text();
}

// ============================================================
// PARSING (repris de shotgun-parser.js)
// ============================================================

function parsePrice(priceStr) {
  if (!priceStr) return null;
  const lower = priceStr.toLowerCase();
  if (lower.includes('gratuit') || lower.includes('free')) return 0;
  const match = priceStr.match(/[\d,]+/);
  return match ? parseFloat(match[0].replace(',', '.')) : null;
}

function parseEvents(html) {
  const $ = cheerio.load(html);
  const events = [];
  const seen = new Set();

  $('a[href*="/events/"]').each((_, element) => {
    const $event = $(element);
    const eventPath = $event.attr('href');
    if (!eventPath || !eventPath.includes('/events/')) return;
    if (seen.has(eventPath)) return;
    seen.add(eventPath);

    const title = $event.find('p.font-bold').text().trim();
    if (!title || title.length < 3) return;

    const $img      = $event.find('img');
    const imageUrl  = $img.attr('src') || $img.attr('srcset')?.split(' ')[0];
    const venue     = $event.find('div.text-muted-foreground').first().text().trim();
    const datetime  = $event.find('time[datetime]').attr('datetime');
    const dateText  = $event.find('time[datetime]').text().trim();

    const priceEl   = $event.find('span').filter((_, el) => $(el).text().includes('€')).first();
    const priceStr  = priceEl.text().trim();

    const tags = [];
    $event.find('div.inline-flex.items-center').each((_, tag) => {
      const t = $(tag).text().trim();
      if (t) tags.push(t.toLowerCase());
    });

    const externalUrl = eventPath.startsWith('http')
      ? eventPath
      : `${SHOTGUN_BASE}${eventPath}`;

    events.push({
      title,
      description:   `${title}${venue ? ` au ${venue}` : ''}${dateText ? ` — ${dateText}` : ''}${priceStr ? `\n💰 ${priceStr}` : ''}`,
      date:          datetime || new Date().toISOString(),
      price:         parsePrice(priceStr),
      image_url:     imageUrl || null,
      location:      venue || 'Lyon',
      address:       venue ? `${venue}, Lyon` : 'Lyon',
      category:      'soirees',
      venue_category: 'club',
      ambiance:      'festif',
      event_format:  'soiree-libre',
      social_intensity: 'moyen',
      external_url:  externalUrl,
      tags:          ['lyon', 'shotgun', ...tags].slice(0, 10),
    });
  });

  return events;
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('🎯 SHOTGUN RUNNER — Lyon\n');

  const html = await fetchShotgunHtml();
  const events = parseEvents(html);

  console.log(`${events.length} événement(s) trouvé(s) sur Shotgun\n`);

  if (!events.length) {
    console.log('Aucun événement parsé. La structure HTML a peut-être changé.');
    return;
  }

  // Aperçu
  events.slice(0, 5).forEach(e => {
    const d = new Date(e.date).toLocaleDateString('fr-FR');
    console.log(`  ${d} — ${e.title} @ ${e.location}`);
  });
  if (events.length > 5) console.log(`  ... et ${events.length - 5} autres`);

  if (DRY_RUN) {
    console.log('\n[DRY RUN] Aucune sauvegarde.');
    return;
  }

  console.log('');
  const stats = await saveEvents(events, SOURCE);

  console.log(`\n📊 Résumé Shotgun :`);
  console.log(`   Importés  : ${stats.saved}`);
  console.log(`   Doublons  : ${stats.skipped}`);
  console.log(`   Erreurs   : ${stats.errors}`);
}

main().catch(e => {
  console.error('❌ Erreur fatale:', e.message);
  process.exit(1);
});
