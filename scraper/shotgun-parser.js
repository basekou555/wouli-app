/**
 * SHOTGUN LYON EVENT PARSER
 * Parse le HTML de Shotgun Lyon pour extraire tous les événements
 *
 * USAGE:
 * 1. Sauvegarde le HTML complet de https://shotgun.live/fr/cities/lyon dans shotgun-raw.html
 * 2. npm install cheerio
 * 3. node shotgun-parser.js
 * 4. Récupère le fichier shotgun-events.json généré
 */

const fs = require('fs');
const cheerio = require('cheerio');

// Configuration
const INPUT_FILE = 'shotgun-raw.html';
const OUTPUT_FILE = 'shotgun-events.json';

function parseEvents(htmlContent) {
  const $ = cheerio.load(htmlContent);
  const events = [];

  $('a[href*="/events/"]').each((index, element) => {
    const $event = $(element);

    const eventUrl = $event.attr('href');
    if (!eventUrl || !eventUrl.includes('/events/')) return;

    const title = $event.find('p.font-bold').text().trim();
    if (!title) return;

    const $img = $event.find('img');
    const imageUrl = $img.attr('src') || $img.attr('srcset')?.split(' ')[0];

    const venue = $event.find('div.text-muted-foreground').first().text().trim();

    const datetime = $event.find('time[datetime]').attr('datetime');
    const dateText = $event.find('time[datetime]').text().trim();
    const timeText = $event.find('time').not('[datetime]').text().trim();

    const priceElements = $event.find('span').filter((i, el) => {
      return $(el).text().includes('€');
    });
    const price = priceElements.first().text().trim();

    const tags = [];
    $event.find('div.inline-flex.items-center').each((i, tag) => {
      const tagText = $(tag).text().trim();
      if (tagText) tags.push(tagText);
    });

    const event = {
      title,
      url: `https://shotgun.live${eventUrl}`,
      slug: eventUrl.split('/').pop(),
      image: imageUrl,
      venue: venue || null,
      datetime: datetime || null,
      dateText: dateText || null,
      timeText: timeText || null,
      price: price || null,
      tags: tags.length > 0 ? tags : null,
      scraped_at: new Date().toISOString()
    };

    events.push(event);
  });

  return events;
}

function main() {
  console.log('🎯 SHOTGUN LYON EVENT PARSER\n');

  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`❌ Erreur: Le fichier "${INPUT_FILE}" n'existe pas.`);
    console.log('\n📋 Instructions:');
    console.log('1. Ouvre https://shotgun.live/fr/cities/lyon dans ton navigateur');
    console.log('2. Scroll jusqu\'en bas pour charger tous les événements');
    console.log('3. Clique droit sur la page → "Enregistrer sous" → Sauvegarde en tant que "shotgun-raw.html"');
    console.log('4. Place le fichier dans le même dossier que ce script');
    console.log('5. Relance: node shotgun-parser.js\n');
    process.exit(1);
  }

  console.log(`📄 Lecture de ${INPUT_FILE}...`);
  const htmlContent = fs.readFileSync(INPUT_FILE, 'utf-8');

  console.log('🔍 Extraction des événements...');
  const events = parseEvents(htmlContent);

  console.log(`✅ ${events.length} événements trouvés`);

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(events, null, 2), 'utf-8');
  console.log(`\n💾 Résultat sauvegardé dans ${OUTPUT_FILE}`);

  console.log('\n📊 Statistiques:');
  console.log(`- Total événements: ${events.length}`);
  console.log(`- Avec image: ${events.filter(e => e.image).length}`);
  console.log(`- Avec prix: ${events.filter(e => e.price).length}`);
  console.log(`- Avec date: ${events.filter(e => e.datetime).length}`);
  console.log(`- Avec lieu: ${events.filter(e => e.venue).length}`);

  console.log('\n🎉 Aperçu des premiers événements:');
  events.slice(0, 3).forEach((event, index) => {
    console.log(`\n${index + 1}. ${event.title}`);
    console.log(`   📍 ${event.venue || 'N/A'}`);
    console.log(`   📅 ${event.dateText || 'N/A'} ${event.timeText || ''}`);
    console.log(`   💰 ${event.price || 'N/A'}`);
    console.log(`   🔗 ${event.url}`);
  });

  console.log('\n✨ Terminé ! Tu peux maintenant:');
  console.log(`1. Ouvrir ${OUTPUT_FILE} pour voir tous les événements`);
  console.log('2. Filtrer manuellement les événements hors Grand Lyon');
  console.log('3. Importer dans Supabase via l\'admin Wouli\n');
}

try {
  main();
} catch (error) {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
}
