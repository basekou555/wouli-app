// debug-instagram-simple.js
// Script simplifié pour diagnostiquer les sélecteurs Instagram
// Utilise la MÊME logique de connexion que scraper-v5-wouli.js

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs').promises;
require('dotenv').config();

puppeteer.use(StealthPlugin());

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function closePopups(page) {
  try {
    const buttons = await page.$$('button');
    for (const button of buttons) {
      const text = await page.evaluate(el => el.textContent, button);
      if (text && (text.includes('Plus tard') || text.includes('Not Now') || text.includes('Pas maintenant'))) {
        await button.click();
        await wait(1200);
        break;
      }
    }
  } catch (_) {}
}

async function loginInstagram(page) {
  console.log('\n1️⃣ Connexion Instagram...');

  try {
    await page.goto('https://www.instagram.com/accounts/login/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await wait(3000);

    // Gestion cookies (EXACTEMENT comme V5)
    try {
      const cookieButton = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));

        const refuseButton = buttons.find(b =>
          b.textContent.includes('Refuser') ||
          b.textContent.includes('Decline') ||
          b.textContent.includes('Tout refuser')
        );

        const acceptButton = buttons.find(b =>
          b.textContent.includes('Tout accepter') ||
          b.textContent.includes('Accept All') ||
          b.textContent.includes('Accepter')
        );

        if (refuseButton) {
          refuseButton.click();
          return 'refused';
        } else if (acceptButton) {
          acceptButton.click();
          return 'accepted';
        }
        return null;
      });

      if (cookieButton) {
        console.log(`   🍪 Cookies ${cookieButton === 'refused' ? 'refusés' : 'acceptés'}`);
        await wait(2000);
      }
    } catch (e) {
      console.log('   ℹ️ Pas de bannière de cookies détectée');
    }

    // Username (EXACTEMENT comme V5)
    let usernameInput = await page.$('input[name="username"]');
    if (!usernameInput) {
      usernameInput = await page.$('input[type="text"]');
    }
    if (!usernameInput) {
      throw new Error('Impossible de trouver le champ username');
    }

    await usernameInput.click();
    await page.keyboard.type(process.env.INSTAGRAM_USERNAME, { delay: 100 });

    // Password (EXACTEMENT comme V5)
    const passwordInput = await page.$('input[name="password"], input[type="password"]');
    if (!passwordInput) {
      throw new Error('Impossible de trouver le champ password');
    }

    await passwordInput.click();
    await page.keyboard.type(process.env.INSTAGRAM_PASSWORD, { delay: 100 });

    await wait(1500);

    // Submit (EXACTEMENT comme V5)
    const submitButton = await page.$('button[type="submit"]');
    if (submitButton) {
      await submitButton.click();
    } else {
      await page.keyboard.press('Enter');
    }

    await page.waitForNavigation({
      waitUntil: 'networkidle2',
      timeout: 10000
    }).catch(() => {
      console.log('   ⚠️ Navigation timeout, vérification connexion...');
    });

    await wait(3000);

    const currentUrl = page.url();
    if (currentUrl.includes('/accounts/login')) {
      throw new Error('Connexion échouée - toujours sur la page de login');
    }

    await closePopups(page);

    console.log('✅ Connecté !\n');
    return true;

  } catch (error) {
    console.error('❌ Erreur connexion automatique:', error.message);
    console.log('\n⏸️ MODE MANUEL : Connecte-toi manuellement dans le navigateur');
    console.log('   Puis appuie sur Enter pour continuer...\n');

    await new Promise((resolve) => {
      process.stdin.once('data', resolve);
    });

    console.log('✅ Connexion manuelle confirmée\n');
    return true;
  }
}

async function analyzeProfile(page, username) {
  console.log(`2️⃣ Navigation vers @${username}...`);

  const profileUrl = `https://www.instagram.com/${username}/`;
  await page.goto(profileUrl, {
    waitUntil: 'networkidle2',
    timeout: 30000
  });
  await wait(3000);

  console.log('✅ Profil chargé\n');

  // ANALYSE EXACTE comme V5 ligne 270-276
  console.log('3️⃣ ANALYSE DES SÉLECTEURS\n');
  console.log('─'.repeat(60));

  const analysis = await page.evaluate(() => {
    const results = {};

    // TEST 1 : Sélecteur actuel du scraper V5
    const v5Selector = document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]');
    results.v5Count = v5Selector.length;
    results.v5Links = Array.from(v5Selector).slice(0, 5).map(a => a.href);

    // TEST 2 : Variations possibles
    const tests = [
      { name: 'main a[href*="/p/"]', selector: 'main a[href*="/p/"]' },
      { name: 'article a[href*="/p/"]', selector: 'article a[href*="/p/"]' },
      { name: 'a[role="link"][href*="/p/"]', selector: 'a[role="link"][href*="/p/"]' },
      { name: 'div a[href*="/p/"]', selector: 'div a[href*="/p/"]' },
      { name: 'section a[href*="/p/"]', selector: 'section a[href*="/p/"]' }
    ];

    results.tests = tests.map(test => {
      try {
        const elements = document.querySelectorAll(test.selector);
        return {
          name: test.name,
          count: elements.length,
          samples: Array.from(elements).slice(0, 3).map(e => e.href)
        };
      } catch (e) {
        return { name: test.name, count: 0, error: e.message };
      }
    });

    return results;
  });

  // AFFICHAGE RÉSULTATS
  console.log('\n📊 RÉSULTATS:\n');
  console.log(`❌ Sélecteur V5 actuel: ${analysis.v5Count} posts trouvés`);
  if (analysis.v5Count > 0) {
    console.log('   Exemples:');
    analysis.v5Links.forEach((link, i) => console.log(`   ${i+1}. ${link}`));
  } else {
    console.log('   ⚠️ PROBLÈME: Le sélecteur V5 ne trouve RIEN\n');
  }

  console.log('\n🔍 TESTS SÉLECTEURS ALTERNATIFS:\n');

  let bestSelector = null;
  let bestCount = 0;

  analysis.tests.forEach((test, i) => {
    console.log(`${i+1}. ${test.name}`);
    console.log(`   → ${test.count} posts trouvés`);

    if (test.count > bestCount && test.count >= 9) {
      bestSelector = test.name;
      bestCount = test.count;
    }

    if (test.count > 0 && test.samples) {
      console.log(`   → Exemple: ${test.samples[0]}`);
    }
    console.log('');
  });

  // RECOMMANDATION
  console.log('\n' + '='.repeat(60));
  console.log('💡 RECOMMANDATION:\n');

  if (analysis.v5Count > 0) {
    console.log('✅ Le sélecteur V5 FONCTIONNE encore !');
    console.log('   Le problème est AILLEURS (pas les sélecteurs)');
    console.log('   → Vérifie la connexion Instagram');
    console.log('   → Vérifie que les comptes ne sont pas privés\n');
  } else if (bestSelector) {
    console.log('🔧 FIX NÉCESSAIRE:');
    console.log(`   Le meilleur sélecteur: ${bestSelector} (${bestCount} posts)\n`);
    console.log('   📝 Dans scraper-v5-wouli.js (ligne ~272):');
    console.log('   REMPLACE:');
    console.log('      document.querySelectorAll(\'a[href*="/p/"], a[href*="/reel/"]\')');
    console.log('   PAR:');
    console.log(`      document.querySelectorAll('${bestSelector}')\n`);
  } else {
    console.log('❌ AUCUN sélecteur ne fonctionne');
    console.log('   Causes possibles:');
    console.log('   1. Le compte est privé');
    console.log('   2. Le compte n\'a pas de posts');
    console.log('   3. Instagram a radicalement changé sa structure');
    console.log('   4. Problème de connexion\n');
  }

  console.log('='.repeat(60));

  // Sauvegarder HTML pour analyse
  const html = await page.content();
  await fs.writeFile('instagram-debug.html', html);
  console.log('\n💾 HTML sauvegardé: instagram-debug.html');

  return bestSelector;
}

async function main() {
  const username = process.argv[2] || 'lesucrelyon';

  console.log('🔍 DIAGNOSTIC INSTAGRAM - VERSION SIMPLIFIÉE');
  console.log(`📱 Profil: @${username}`);
  console.log('─'.repeat(60));

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1366, height: 768 },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled'
    ]
  });

  const page = await browser.newPage();

  try {
    await loginInstagram(page);
    await analyzeProfile(page, username);

    console.log('\n⏸️ Navigateur laissé ouvert pour inspection');
    console.log('   F12 → Elements pour voir le HTML');
    console.log('   Appuie sur Enter pour fermer...\n');

    await new Promise((resolve) => {
      process.stdin.once('data', resolve);
    });

  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
    console.log('\n✅ Terminé');
  }
}

main();
