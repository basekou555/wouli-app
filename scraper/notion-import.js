/**
 * notion-import.js
 * Importe les comptes Instagram depuis un export CSV Notion vers accounts-v5.json
 *
 * USAGE:
 * 1. Dans Notion : ··· → Exporter → Format CSV
 * 2. Renomme le fichier exporté en "notion-export.csv"
 * 3. Place-le dans ce dossier (C:\projets\wouli-scraper\)
 * 4. node notion-import.js
 */

const fs = require('fs');

const CSV_FILE = 'notion-export.csv';
const ACCOUNTS_FILE = 'accounts-v5.json';

// Mapping type Notion → event_category Supabase valide
// (seules 4 valeurs acceptées : soirees | a-boire | a-manger | activites)
const CATEGORY_MAP = {
  // Soirées
  'club': 'soirees',
  'discothèque': 'soirees',
  'discotheque': 'soirees',
  'discotheque / club': 'soirees',
  'soirée': 'soirees',
  'soiree': 'soirees',
  'boite': 'soirees',
  'boîte de nuit': 'soirees',
  'salle de concert': 'soirees',
  'salle de spectacle': 'soirees',
  'concert': 'soirees',
  'venue': 'soirees',
  // À boire
  'bar': 'a-boire',
  'bar de nuit': 'a-boire',
  'cocktail bar': 'a-boire',
  'pub': 'a-boire',
  'cave à vin': 'a-boire',
  'cave a vin': 'a-boire',
  'brasserie': 'a-boire',
  'rooftop': 'a-boire',
  // À manger
  'restaurant': 'a-manger',
  'resto': 'a-manger',
  'bistro': 'a-manger',
  'bistrot': 'a-manger',
  'pizzeria': 'a-manger',
  'fast food': 'a-manger',
  'street food': 'a-manger',
  // Activités
  'musée': 'activites',
  'musee': 'activites',
  'théâtre': 'activites',
  'theatre': 'activites',
  'cinéma': 'activites',
  'cinema': 'activites',
  'festival': 'activites',
  'sport': 'activites',
  'bowling': 'activites',
  'karting': 'activites',
  'escape game': 'activites',
  'laser game': 'activites',
  'loisirs': 'activites',
  'activite': 'activites',
  'activité': 'activites',
  'guide': 'activites',
  'media': 'activites',
  'autre': 'activites',
};

// ============================================================
// PARSING CSV (gère les guillemets et virgules dans les valeurs)
// ============================================================

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(content) {
  // Supprimer le BOM UTF-8 que Notion ajoute parfois (casse le nom de la 1ère colonne)
  const cleaned = content.replace(/^﻿/, '');
  const lines = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const header = parseCSVLine(lines[0]);
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const row = {};
    header.forEach((col, i) => { row[col] = values[i] || ''; });
    return row;
  });
}

// ============================================================
// HELPERS
// ============================================================

function cleanUsername(raw) {
  if (!raw) return null;
  return raw
    .replace(/^@/, '')
    .replace(/https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/\/$/, '')
    .replace(/\?.*$/, '')
    .trim()
    .toLowerCase();
}

function mapCategory(typeRaw) {
  if (!typeRaw) return 'activites';
  const key = typeRaw.toLowerCase().trim();
  return CATEGORY_MAP[key] || 'activites';
}

function guessType(typeRaw) {
  const lower = (typeRaw || '').toLowerCase();
  if (lower.includes('club') || lower.includes('disco') || lower.includes('boite')) return 'club';
  if (lower.includes('bar') || lower.includes('pub') || lower.includes('brasserie')) return 'bar';
  if (lower.includes('restaurant') || lower.includes('resto') || lower.includes('bistro')) return 'restaurant';
  if (lower.includes('salle') || lower.includes('concert') || lower.includes('venue')) return 'venue';
  return 'venue';
}

// ============================================================
// MAIN
// ============================================================

function main() {
  console.log('📥 NOTION → ACCOUNTS-V5.JSON IMPORTER\n');

  // Lire CSV
  if (!fs.existsSync(CSV_FILE)) {
    console.error(`❌ Fichier "${CSV_FILE}" introuvable dans ce dossier.`);
    console.log('\n📋 Instructions:');
    console.log('   1. Ouvre ta BDD Notion');
    console.log('   2. Clique sur ··· (en haut à droite) → Exporter → Format CSV');
    console.log('   3. Renomme le fichier téléchargé en "notion-export.csv"');
    console.log('   4. Place-le ici : C:\\projets\\wouli-scraper\\');
    console.log('   5. Relance : node notion-import.js\n');
    process.exit(1);
  }

  const csvContent = fs.readFileSync(CSV_FILE, 'utf-8');
  const rows = parseCSV(csvContent);

  if (rows.length === 0) {
    console.error('❌ Le CSV est vide ou mal formaté.');
    process.exit(1);
  }

  const detectedColumns = Object.keys(rows[0]);
  console.log(`📄 ${rows.length} ligne(s) lue(s) depuis ${CSV_FILE}`);
  console.log(`   Colonnes détectées : ${detectedColumns.join(' | ')}\n`);

  // Lire accounts existants
  const existing = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf-8'));
  const existingUsernames = new Set(existing.accounts.map(a => a.username.toLowerCase()));

  // Construire les nouveaux comptes
  const newAccounts = [];
  const duplicates = [];
  const noUsername = [];

  for (const row of rows) {
    // Colonnes Notion (noms exacts du CSV exporté)
    const usernameRaw =
      row['username'] ||
      row['Username'] ||
      row['Username Instagram'] ||
      row['Instagram'] ||
      '';

    const username = cleanUsername(usernameRaw);

    if (!username) {
      noUsername.push(row['Établissement'] || row['Nom Insta'] || row['Nom'] || row['Name'] || '(inconnu)');
      continue;
    }

    if (existingUsernames.has(username)) {
      duplicates.push(username);
      continue;
    }

    const venueName =
      row['Établissement'] ||
      row['Nom Insta'] ||
      row['Nom du lieu'] ||
      row['Nom'] ||
      row['Name'] ||
      username;

    const typeRaw =
      row['Type'] ||
      row['Type / catégorie'] ||
      row['Type / Catégorie'] ||
      row['Catégorie'] ||
      '';

    const mapsLink =
      row['Google_Maps'] ||
      row['lien google maps'] ||
      row['Lien Google Maps'] ||
      row['Google Maps'] ||
      row['Maps'] ||
      '';

    newAccounts.push({
      username,
      venue_name: venueName.trim(),
      type: guessType(typeRaw),
      category: mapCategory(typeRaw),
      priority: 3,
      trusted: false,
      enabled: true,
      address: mapsLink || `${venueName.trim()}, Lyon`,
      notes: typeRaw ? `Prospection Notion — ${typeRaw}` : 'Importé depuis Notion'
    });

    existingUsernames.add(username);
  }

  // Rapport
  console.log('📊 Résultats :');
  console.log(`   ✅ Nouveaux comptes à ajouter : ${newAccounts.length}`);
  console.log(`   ⏭️  Déjà dans accounts-v5.json : ${duplicates.length}`);
  console.log(`   ⚠️  Sans username Instagram    : ${noUsername.length}`);

  if (noUsername.length > 0) {
    console.log('\n   Lieux sans username (à compléter manuellement) :');
    noUsername.forEach(n => console.log(`   - ${n}`));
  }

  if (newAccounts.length === 0) {
    console.log('\n✅ Aucun nouveau compte — accounts-v5.json déjà à jour.');
    return;
  }

  // Aperçu
  console.log('\n🔍 Aperçu des nouveaux comptes :');
  newAccounts.slice(0, 8).forEach(acc => {
    console.log(`   @${acc.username.padEnd(30)} ${acc.venue_name.padEnd(25)} → ${acc.category}`);
  });
  if (newAccounts.length > 8) console.log(`   ... et ${newAccounts.length - 8} autres`);

  // Vérification catégories inconnues (tombées dans "activites" par défaut)
  const unmappedTypes = [...new Set(
    newAccounts
      .filter(a => a.category === 'activites')
      .map(a => {
        const match = a.notes.match(/Prospection Notion — (.+)/);
        return match ? match[1] : null;
      })
      .filter(Boolean)
  )];

  if (unmappedTypes.length > 0) {
    console.log('\n⚠️  Types mappés en "activites" par défaut (vérifie si correct) :');
    unmappedTypes.forEach(t => console.log(`   "${t}"`));
    console.log('   → Pour corriger, ajoute le mapping dans CATEGORY_MAP dans ce script\n');
  }

  // Sauvegarder
  existing.accounts.push(...newAccounts);
  existing.last_updated = new Date().toISOString().split('T')[0];

  fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(existing, null, 2), 'utf-8');

  const totalEnabled = existing.accounts.filter(a => a.enabled).length;
  console.log(`\n✅ ${newAccounts.length} compte(s) ajouté(s) dans accounts-v5.json`);
  console.log(`   Total comptes actifs : ${totalEnabled}`);
  console.log('\n🚀 Lance ensuite : node scraper-v5-wouli.js\n');
}

main();
