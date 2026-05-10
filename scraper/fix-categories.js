/**
 * fix-categories.js
 * Corrige les catégories des comptes importés depuis Notion
 * qui ont été mal mappés en "activites" par défaut.
 *
 * Usage: node fix-categories.js
 */

const fs = require('fs');
const ACCOUNTS_FILE = 'accounts-v5.json';

// Même mapping que notion-import.js
const CATEGORY_MAP = {
  'tiers-lieu festif': 'soirees',
  'lieu culturel / bar': 'soirees',
  'péniche': 'soirees',
  'peniche': 'soirees',
  'guinguette': 'soirees',
  'guinguette / pétanque': 'soirees',
  'guinguette / petanque': 'soirees',
  'guinguette / p tanque': 'soirees',
  'café-concert': 'soirees',
  'cafe-concert': 'soirees',
  'caf  concert': 'soirees',
  'piano bar / resto': 'soirees',
  'cocktail / speakeasy': 'a-boire',
  'cocktail / victorian': 'a-boire',
  'cocktail / rooftop': 'a-boire',
  'cocktail classique': 'a-boire',
  'cocktail / soul': 'a-boire',
  'speakeasy': 'a-boire',
  'lounge': 'a-boire',
  'pub irlandais': 'a-boire',
  'pub anglais': 'a-boire',
  'pub / bar': 'a-boire',
  'pub / resto': 'a-boire',
  'bar / tiers-lieu': 'a-boire',
  'bar à jeux': 'a-boire',
  'bar   jeux': 'a-boire',
  'bar   jeux / festif': 'a-boire',
  'bar à vin': 'a-boire',
  'bar   vin': 'a-boire',
  'brasserie / festif': 'a-boire',
  'brasserie historique / festif': 'a-boire',
  'brasserie / bar': 'a-boire',
  'food court / bar': 'a-boire',
  'brunch': 'a-manger',
  'planches / festif': 'a-manger',
  'bouchon / bar': 'a-manger',
  'bar à flammekueche': 'a-manger',
  'bar à flamme': 'a-manger',
  'tiers-lieu': 'activites',
};

function extractType(notes) {
  if (!notes) return null;
  const match = notes.match(/Prospection Notion — (.+)/);
  return match ? match[1].toLowerCase().trim() : null;
}

const data = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf-8'));
let fixed = 0;
let unchanged = 0;

for (const account of data.accounts) {
  const type = extractType(account.notes);
  if (!type) continue;

  const correctCategory = CATEGORY_MAP[type];
  if (correctCategory && account.category !== correctCategory) {
    account.category = correctCategory;
    fixed++;
  } else {
    unchanged++;
  }
}

fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
console.log(`✅ ${fixed} catégorie(s) corrigée(s)`);
console.log(`   ${unchanged} compte(s) déjà corrects ou sans mapping connu`);
