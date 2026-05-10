// scraper-v4-wouli.js
// VERSION 4 CLEAN : Version stable et fonctionnelle
// ==================================================================

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

puppeteer.use(StealthPlugin());

class WouliScraperV4 {
  constructor() {
    this.browser = null;
    this.page = null;
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    this.TEST_MODE = process.env.TEST_MODE === 'true';
    this.HEADLESS = process.env.HEADLESS === 'true';
    this.AUTO_ENHANCE = process.env.AUTO_ENHANCE === 'true';
    this.ENHANCE_FUNCTION_URL = process.env.ENHANCE_FUNCTION_URL || '';
    this.ENHANCE_FUNCTION_KEY = process.env.ENHANCE_FUNCTION_KEY || '';
    this.ADMIN_UUID = process.env.SUPABASE_ADMIN_UUID || 'b8750c46-6717-4427-aac4-3e5c1e5a86c5';

    this.events = [];
    this.accounts = [];
    this.config = {};
    this.currentAccount = null;

    this.stats = {
      accounts_scraped: 0,
      accounts_skipped: 0,
      posts_analyzed: 0,
      events_found: 0,
      programmes_skipped: 0,
      errors: []
    };
  }

  async loadAccountsList() {
    console.log(' Chargement de la liste des comptes...');
    try {
      const accountsPath = path.join(__dirname, 'accounts.json');
      const data = await fs.readFile(accountsPath, 'utf8');
      const jsonData = JSON.parse(data);

      this.accounts = (jsonData.accounts || []).filter(acc => acc.enabled);
      this.config = jsonData.configuration || {};

      if (this.TEST_MODE) {
        console.log(' MODE TEST : 1 compte / 5 posts');
        this.accounts = this.accounts.slice(0, 1);
        this.config.posts_per_account = 5;
      }

      console.log(` ${this.accounts.length} compte(s) actif(s)`);
      this.accounts
        .sort((a, b) => (b.priority || 0) - (a.priority || 0))
        .forEach(acc => console.log(`   [P${acc.priority}] @${acc.username} - ${acc.venue_name}`));

      return true;
    } catch (error) {
      console.error(' Erreur chargement accounts.json:', error.message);
      return false;
    }
  }

  async init() {
    console.log(' WOULI SCRAPER V4 - Clean Version');
    console.log(` ${new Date().toLocaleString('fr-FR')}`);

    const loaded = await this.loadAccountsList();
    if (!loaded) throw new Error('Impossible de charger la liste des comptes');

    this.browser = await puppeteer.launch({
      headless: this.HEADLESS,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--window-size=1366,768'
      ],
      defaultViewport: {
        width: 1366,
        height: 768,
        deviceScaleFactor: 2
      },
      protocolTimeout: 60000
    });

    this.page = await this.browser.newPage();
    await this.page.setDefaultNavigationTimeout(30000);
    await this.page.setDefaultTimeout(30000);
    await this.page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
  }

  async login() {
    console.log('\n Connexion Instagram...');

    try {
      await this.page.goto('https://www.instagram.com/', { waitUntil: 'networkidle2' });
      await this.wait(3000);

      try {
        await this.wait(2000);
        const cookieButton = await this.page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const refuseButton = buttons.find(btn =>
            btn.textContent.includes('Refuser') ||
            btn.textContent.includes('Decline') ||
            btn.textContent.includes('Only allow')
          );
          const acceptButton = buttons.find(btn =>
            btn.textContent.includes('Autoriser tous') ||
            btn.textContent.includes('Accept all')
          );
          if (refuseButton) { refuseButton.click(); return 'refused'; }
          else if (acceptButton) { acceptButton.click(); return 'accepted'; }
          return null;
        });
        if (cookieButton) {
          console.log(`   Cookies ${cookieButton === 'refused' ? 'refusés' : 'acceptés'}`);
          await this.wait(2000);
        }
      } catch (e) {
        console.log('   Pas de bannière de cookies détectée');
      }

      let usernameInput = await this.page.$('input[name="username"]');
      if (!usernameInput) usernameInput = await this.page.$('input[type="text"]');
      if (!usernameInput) throw new Error('Impossible de trouver le champ username');

      await usernameInput.click();
      await this.page.keyboard.type(process.env.INSTAGRAM_USERNAME || '', { delay: 100 });

      const passwordInput = await this.page.$('input[name="password"], input[type="password"]');
      if (!passwordInput) throw new Error('Impossible de trouver le champ password');

      await passwordInput.click();
      await this.page.keyboard.type(process.env.INSTAGRAM_PASSWORD, { delay: 100 });

      await this.wait(1500);

      const submitButton = await this.page.$('button[type="submit"]');
      if (submitButton) await submitButton.click();
      else await this.page.keyboard.press('Enter');

      await this.page.waitForNavigation({
        waitUntil: 'networkidle2',
        timeout: 10000
      }).catch(() => {
        console.log('   Navigation timeout, vérification connexion...');
      });

      await this.wait(3000);

      const currentUrl = this.page.url();
      if (currentUrl.includes('/accounts/login')) {
        throw new Error('Connexion échouée - toujours sur la page de login');
      }

      await this.closePopups();
      console.log(' Connecté !\n');

    } catch (error) {
      console.error(' Erreur connexion:', error.message);

      if (!this.HEADLESS) {
        console.log('\n Mode manuel : Connectez-vous manuellement dans le navigateur');
        console.log('   Appuyez sur Enter quand vous êtes connecté...');
        await new Promise((resolve) => { process.stdin.once('data', resolve); });
        console.log(' Connexion manuelle confirmée\n');
      } else {
        throw error;
      }
    }
  }

  async closePopups() {
    try {
      const buttons = await this.page.$$('button');
      for (const button of buttons) {
        const text = await this.page.evaluate(el => el.textContent, button);
        if (text && (text.includes('Plus tard') || text.includes('Not Now') || text.includes('Pas maintenant'))) {
          await button.click();
          await this.wait(1200);
          break;
        }
      }
    } catch (_) {}
  }

  async scrapeAccount(account) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(` @${account.username} (${account.venue_name})`);
    console.log(`${'='.repeat(60)}`);

    this.stats.accounts_scraped++;
    this.currentAccount = account;

    try {
      await this.page.goto(`https://www.instagram.com/${account.username}/`, {
        waitUntil: 'networkidle2',
        timeout: 20000
      });
      await this.wait(2500);

      const pageTitle = await this.page.title();
      if (pageTitle.includes('introuvable') || pageTitle.includes('not found')) {
        console.log(' Compte introuvable ou privé');
        this.stats.errors.push(`@${account.username}: introuvable`);
        return;
      }

      const postLinks = await this.page.evaluate(() => {
        const links = new Set();
        document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]').forEach(link => {
          if (link.href.includes('/p/') || link.href.includes('/reel/')) links.add(link.href);
        });
        return Array.from(links);
      });

      const maxPosts = this.config.posts_per_account || 5;
      const postsToAnalyze = postLinks.slice(0, maxPosts);
      console.log(` ${postsToAnalyze.length} posts à analyser`);

      let accountEvents = 0;
      for (let i = 0; i < postsToAnalyze.length; i++) {
        console.log(`\n   [Post ${i + 1}/${postsToAnalyze.length}]`);
        const events = await this.analyzePost(postsToAnalyze[i], account);
        if (events && events.length) {
          this.events.push(...events);
          accountEvents += events.length;
          this.stats.events_found += events.length;
        }
        this.stats.posts_analyzed++;
        await this.wait(1500 + Math.random() * 800);
      }

      console.log(`\n Résumé : ${accountEvents} événement(s) trouvés`);
    } catch (error) {
      console.log(` Erreur : ${error.message}`);
      this.stats.errors.push(`@${account.username}: ${error.message}`);
    }
  }

  async analyzePost(postUrl, account) {
    const foundEvents = [];

    try {
      await this.page.goto(postUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      await this.wait(2000);

      const postData = await this.page.evaluate(() => {
        const cleanText = (text) => {
          if (!text) return '';
          return text
            .replace(/^\d+\s+likes?,\s+\d+\s+comments?\s+-\s+/, '')
            .replace(/^[^:]+:\s+"/, '')
            .replace(/"$/, '')
            .replace(/[\u{1F600}-\u{1F9FF}]/gu, '')
            .replace(/[\u{2600}-\u{26FF}]/gu, '')
            .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
            .replace(/[\uD800-\uDFFF]/g, '')
            .trim();
        };

        let fullText = '';
        const metaDesc = document.querySelector('meta[property="og:description"]');
        if (metaDesc) fullText = cleanText(metaDesc.content);

        if (!fullText || fullText.length < 50) {
          const spans = Array.from(document.querySelectorAll('span'))
            .filter(span => {
              const t = span.textContent;
              return t && t.length > 50 && !t.includes('likes') && !t.includes('Suivre') && !t.includes('commentaire');
            });
          if (spans.length > 0) fullText = cleanText(spans[0].textContent);
        }

        fullText = fullText
          .replace(/\.\s+/g, '.\n')
          .replace(/!\s+/g, '!\n')
          .replace(/\s{3,}/g, '\n\n')
          .trim();

        let imageUrl = '';
        const metaImage = document.querySelector('meta[property="og:image"]');
        if (metaImage && metaImage.content) imageUrl = metaImage.content;

        if (!imageUrl) {
          const postImg = document.querySelector('article img, div[role="presentation"] img');
          if (postImg && postImg.src && !postImg.src.includes('profile')) imageUrl = postImg.src;
        }

        return { text: fullText, imageUrl, url: window.location.href };
      });

      console.log(`       ${postData.text.substring(0, 80)}...`);
      console.log(`       Image: ${postData.imageUrl ? 'Trouvée' : 'Non trouvée'}`);

      if (this.isProgramme(postData.text)) {
        console.log('       Programme détecté → IGNORÉ');
        this.stats.programmes_skipped++;
        return [];
      }

      if (this.isEvent(postData.text)) {
        console.log('       ÉVÉNEMENT DÉTECTÉ');
        const singleEvent = await this.extractSingleEvent(postData, account);
        if (singleEvent) foundEvents.push(singleEvent);
      } else {
        console.log('       Pas un événement');
      }

      foundEvents.forEach(ev => console.log(`         → ${ev.title}`));
    } catch (error) {
      console.log(`       Erreur: ${error.message}`);
    }
    return foundEvents;
  }

  isProgramme(text) {
    const lower = (text || '').toLowerCase();
    const keywords = [
      'programme', 'agenda', 'semaine', 'week',
      'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche',
      'événements de la semaine', 'nos eventos', 'cette semaine',
      'planning', 'line up'
    ];
    let matches = 0;
    for (const k of keywords) if (lower.includes(k)) matches++;
    return matches >= 3;
  }

  isEvent(text) {
    if (!text || text.length < 20) return false;
    const lower = text.toLowerCase();
    let score = 0;
    const eventKeywords = {
      timing: ['ce soir', 'tonight', 'demain', 'tomorrow', 'vendredi', 'samedi', 'jeudi', 'soir'],
      event: ['soirée', 'party', 'event', 'concert', 'dj set', 'live', 'show', 'afterwork'],
      action: ['réservation', 'reser', 'entrée', 'billetterie', 'link in bio', 'tickets'],
      price: ['gratuit', 'free', '€', 'euros']
    };
    for (const [cat, arr] of Object.entries(eventKeywords)) {
      for (const kw of arr) if (lower.includes(kw)) score += (cat === 'timing' || cat === 'event') ? 2 : 1;
    }
    const minScore = this.config.min_score_for_event || 3;
    return score >= minScore;
  }

  async extractSingleEvent(postData, account) {
    const title = this.extractBetterTitle(postData.text, account);
    return this.createEvent(title, postData.text, this.extractDate(postData.text), account, postData.imageUrl, postData.url, postData.text);
  }

  async createEvent(title, description, dateISO, account, imageUrl, sourceUrl, originalText) {
    const timeHHMM = this.extractTime(originalText || '');
    const eventDate = new Date(dateISO);
    const [h, m] = timeHHMM.split(':');
    eventDate.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);

    let finalTitle = this.cleanUnicode(title).substring(0, 100);
    let finalDesc = this.cleanUnicode((description || '').substring(0, 1200));
    let maybeOverriddenTime = null;

    if (this.AUTO_ENHANCE && this.ENHANCE_FUNCTION_URL) {
      try {
        const resp = await fetch(this.ENHANCE_FUNCTION_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.ENHANCE_FUNCTION_KEY ? { 'Authorization': `Bearer ${this.ENHANCE_FUNCTION_KEY}` } : {})
          },
          body: JSON.stringify({ title: finalTitle, description: finalDesc, location: account.venue_name })
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data.title) finalTitle = this.cleanUnicode(String(data.title)).substring(0, 100);
          if (data.description) finalDesc = this.cleanUnicode(String(data.description)).substring(0, 1200);
          if (data.time && /^\d{2}:\d{2}$/.test(data.time)) maybeOverriddenTime = data.time;
        }
      } catch (e) {
        console.warn(' Enhance function error:', e.message);
      }
    }

    if (maybeOverriddenTime) {
      const [H, M] = maybeOverriddenTime.split(':');
      eventDate.setHours(parseInt(H, 10), parseInt(M, 10), 0, 0);
    }

    const priceText = this.extractPrice(originalText || '');
    let priceNumeric = null;
    if (priceText) {
      if (priceText.toLowerCase().includes('gratuit')) priceNumeric = 0;
      else {
        const match = priceText.match(/\d+(?:[\.,]\d+)?/);
        if (match) priceNumeric = parseFloat(match[0].replace(',', '.'));
      }
    }

    const nowIso = new Date().toISOString();
    return {
      id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : undefined,
      title: finalTitle,
      description: finalDesc,
      date: eventDate.toISOString(),
      end_date: null,
      location: this.cleanUnicode(account.venue_name),
      address: this.cleanUnicode(account.address || `${account.venue_name}, Lyon`),
      category: account.category || this.config.default_category || 'activites',
      tags: ['instagram', account.username],
      image_url: imageUrl || null,
      external_url: sourceUrl,
      price: priceNumeric,
      max_participants: null,
      created_by: this.ADMIN_UUID,
      created_by_type: 'admin',
      views: 0, likes: 0, participants: 0, search_appearances: 0,
      created_at: nowIso, updated_at: nowIso,
      status: 'pending',
      archived_at: null, actual_participants: 0, no_show_count: 0,
      end_time: null, scraped_at: nowIso,
      submitter_email: null, validated_at: null, validated_by: null
    };
  }

  cleanUnicode(str) {
    if (!str) return str;
    return String(str)
      .replace(/[\u{1F600}-\u{1F9FF}]/gu, '')
      .replace(/[\u{2600}-\u{26FF}]/gu, '')
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
      .replace(/[\uD800-\uDFFF]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  extractBetterTitle(text, account) {
    const cleaned = (text || '')
      .replace(/^\d+\s+likes?,\s+\d+\s+comments?\s+-\s+/, '')
      .replace(/^[^:]+:\s+"/, '')
      .replace(/"$/, '');
    const lines = cleaned.split(/[\n|]/);
    for (const line of lines) {
      const l = line.trim();
      if (l.length < 10 || l.length > 150) continue;
      const emojiCount = (l.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
      if (emojiCount > 5) continue;
      if (/(soirée|party|concert|event|dj|live|samedi|vendredi|jeudi)/i.test(l)) {
        return this.cleanEventTitle(l);
      }
    }
    return this.cleanEventTitle(lines[0] || `Événement @${account.venue_name}`);
  }

  cleanEventTitle(line) {
    let title = (line || '')
      .replace(/^[\s\-–—:•→]+/, '')
      .replace(/[\s\-–—:]+$/, '')
      .replace(/\s+/g, ' ')
      .trim();
    title = title.replace(/[\u{1F300}-\u{1F9FF}]{3,}/gu, '');
    const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
    for (const j of jours) {
      if (title.toLowerCase().startsWith(j)) title = title.slice(j.length).trim();
    }
    return title;
  }

  extractDate(text) {
    const lower = (text || '').toLowerCase();
    const now = new Date();

    const dateMatch = (text || '').match(/(\d{1,2})\s+(janvier|février|mars|avril|mai|juin|juillet|août|aout|septembre|octobre|novembre|décembre)/i);
    if (dateMatch) {
      const day = parseInt(dateMatch[1]);
      const monthMap = {
        'janvier': 0, 'février': 1, 'mars': 2, 'avril': 3, 'mai': 4, 'juin': 5,
        'juillet': 6, 'août': 7, 'aout': 7, 'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11
      };
      const month = monthMap[dateMatch[2].toLowerCase()] ?? 8;
      const d = new Date(now.getFullYear(), month, day, 22, 0, 0);
      if (d < now) d.setFullYear(now.getFullYear() + 1);
      return d.toISOString();
    }

    if (lower.includes('ce soir') || lower.includes('tonight')) {
      const t = new Date(); t.setHours(22, 0, 0, 0); return t.toISOString();
    }
    if (lower.includes('demain') || lower.includes('tomorrow')) {
      const t = new Date(); t.setDate(t.getDate() + 1); t.setHours(22, 0, 0, 0); return t.toISOString();
    }

    const jours = { 'lundi': 1, 'mardi': 2, 'mercredi': 3, 'jeudi': 4, 'vendredi': 5, 'samedi': 6, 'dimanche': 0 };
    for (const j of Object.keys(jours)) if (lower.includes(j)) return this.getDateForDay(j);
    return this.getDateForDay('vendredi');
  }

  extractTime(text) {
    const patterns = [
      /(\d{1,2})[hH](\d{2})?/,
      /(\d{1,2}):(\d{2})/,
      /à partir de (\d{1,2})[hH]/i,
      /dès (\d{1,2})[hH]/i,
      /from (\d{1,2})(?::(\d{2}))?/i,
      /(\d{1,2})\s*(pm|am)/i
    ];
    for (const p of patterns) {
      const m = (text || '').match(p);
      if (m) {
        let hours = parseInt(m[1], 10);
        const minutes = m[2] || '00';
        const ampm = m[3];
        if (ampm) {
          if (/pm/i.test(ampm) && hours < 12) hours += 12;
          if (/am/i.test(ampm) && hours === 12) hours = 0;
        }
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      }
    }
    const defaults = { club: '23:00', bar: '19:00', restaurant: '12:00', venue: '20:00' };
    return defaults[this.currentAccount?.type] || '21:00';
  }

  getDateForDay(dayName) {
    const now = new Date();
    const map = { 'lundi': 1, 'mardi': 2, 'mercredi': 3, 'jeudi': 4, 'vendredi': 5, 'samedi': 6, 'dimanche': 0 };
    const target = map[dayName.toLowerCase()];
    const current = now.getDay();
    let daysUntil = (target - current + 7) % 7;
    if (daysUntil === 0) daysUntil = 7;
    const t = new Date();
    t.setDate(t.getDate() + daysUntil);
    const defaultTime = this.config.default_event_time || '22:00';
    const [H, M] = defaultTime.split(':');
    t.setHours(parseInt(H, 10), parseInt(M, 10), 0, 0);
    return t.toISOString();
  }

  extractPrice(text) {
    const lower = (text || '').toLowerCase();
    if (lower.includes('gratuit') || lower.includes('free') || lower.includes('entrée libre')) {
      const m = (text || '').match(/gratuit\s+avant\s+(\d+h)/i);
      if (m) return `Gratuit avant ${m[1]}`;
      return 'Gratuit';
    }
    const prices = (text || '').match(/(\d+[\.,]?\d*)\s*€/g);
    if (prices && prices.length) return prices.join(' / ');
    return null;
  }

  async wait(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  async saveToSupabase() {
    if (!this.events.length) {
      console.log('\n Aucun événement à sauvegarder');
      return;
    }

    console.log(`\n Sauvegarde de ${this.events.length} événement(s)...`);
    const batchSize = 10;
    let saved = 0;

    console.log('\n Aperçu :');
    this.events.slice(0, 5).forEach((e, i) => {
      const d = new Date(e.date);
      console.log(`   ${i + 1}. ${e.title}`);
      console.log(`       ${d.toLocaleDateString('fr-FR')} à ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`);
      console.log(`       ${e.location}`);
    });
    if (this.events.length > 5) console.log(`   ... et ${this.events.length - 5} autres`);

    try {
      for (let i = 0; i < this.events.length; i += batchSize) {
        const batch = this.events.slice(i, i + batchSize);
        const { error } = await this.supabase.from('events').insert(batch);
        if (error) {
          console.error(`\n Erreur batch ${i / batchSize + 1}:`, error.message || error);
        } else {
          saved += batch.length;
          console.log(`   Batch ${i / batchSize + 1} sauvegardé (${batch.length})`);
        }
        await this.wait(800);
      }
      console.log(`\n Sauvegarde terminée : ${saved}/${this.events.length}`);
    } catch (e) {
      console.error('\n Erreur générale de sauvegarde:', e);
    }
  }

  async generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log(' RAPPORT FINAL V4');
    console.log('='.repeat(60));
    console.log(`Comptes analysés   : ${this.stats.accounts_scraped}`);
    console.log(`Posts analysés     : ${this.stats.posts_analyzed}`);
    console.log(`Programmes ignorés : ${this.stats.programmes_skipped}`);
    console.log(`Total événements   : ${this.stats.events_found}`);
    if (this.stats.errors.length) {
      console.log('\n Erreurs :');
      this.stats.errors.forEach(e => console.log('   - ' + e));
    }
    console.log('='.repeat(60));
  }

  async close() {
    console.log('\n Fermeture dans 5 secondes...');
    await this.wait(5000);
    if (this.browser) await this.browser.close();
  }
}

async function runScraperV4() {
  const scraper = new WouliScraperV4();
  try {
    await scraper.init();
    await scraper.login();

    const sorted = scraper.accounts.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    console.log(`\n Début du scraping de ${sorted.length} compte(s)...\n`);

    for (const acc of sorted) {
      await scraper.scrapeAccount(acc);
      await scraper.wait(2500 + Math.random() * 1500);
      if (scraper.stats.errors.length > 5) {
        console.log('\n Trop d\'erreurs, arrêt.');
        break;
      }
    }

    await scraper.saveToSupabase();
    await scraper.generateReport();
  } catch (e) {
    console.error('\n ERREUR FATALE:', e);
  } finally {
    await scraper.close();
  }
}

if (require.main === module) {
  console.log(' LANCEMENT DU SCRAPER V4');
  console.log(`  - Mode Test: ${process.env.TEST_MODE === 'true' ? 'OUI' : 'NON'}`);
  console.log(`  - Headless: ${process.env.HEADLESS === 'true' ? 'OUI' : 'NON'}`);
  console.log(`  - Instagram User: ${process.env.INSTAGRAM_USERNAME ? 'configuré' : 'MANQUANT'}`);
  console.log(`  - Supabase URL: ${process.env.SUPABASE_URL ? 'configuré' : 'MANQUANT'}`);
  runScraperV4();
}

module.exports = { WouliScraperV4, runScraperV4 };
