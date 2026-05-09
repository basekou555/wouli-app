// scraper-v5-wouli.js
// VERSION 5.1 STABLE : Fix regex page.evaluate + cookie persistence + JSON accounts
// ==================================================================
// CORRECTIONS v5.1:
// - Fix regex /[\uD800-\uDFFF]/g (stray } supprimé dans page.evaluate)
// - Cookie persistence entre les runs (cookies.json)
// - accounts.json corrigé (JSON valide)
// ==================================================================

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

puppeteer.use(StealthPlugin());

const COOKIES_PATH = path.join(__dirname, 'instagram_cookies.json');

class WouliScraperV5 {
  constructor() {
    this.browser = null;
    this.page = null;
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    this.TEST_MODE = process.env.TEST_MODE === 'true';
    this.HEADLESS = process.env.HEADLESS !== 'false'; // true par défaut
    this.AUTO_ENHANCE = process.env.AUTO_ENHANCE === 'true';
    this.ENHANCE_FUNCTION_URL = process.env.ENHANCE_FUNCTION_URL || '';
    this.ENHANCE_FUNCTION_KEY = process.env.ENHANCE_FUNCTION_KEY || '';
    this.ADMIN_UUID = process.env.SUPABASE_ADMIN_UUID || 'b8750c46-6717-4427-aac4-3e5c1e5a86c5';
    this.FILTERING_MODE = process.env.FILTERING_MODE || 'balanced';

    this.events = [];
    this.accounts = [];
    this.config = {};
    this.currentAccount = null;

    this.stats = {
      accounts_scraped: 0,
      posts_analyzed: 0,
      events_single: 0,
      programs_detected: 0,
      programs_parsed: 0,
      programs_manual_review: 0,
      programs_edge_case: 0,
      needs_manual_image: 0,
      ocr_attempts: 0,
      ocr_success: 0,
      errors: []
    };
  }

  // ============================================
  // COOKIE PERSISTENCE
  // ============================================

  async saveCookies() {
    try {
      const cookies = await this.page.cookies();
      await fs.writeFile(COOKIES_PATH, JSON.stringify(cookies, null, 2));
      console.log(`   Cookies sauvegardés (${cookies.length})`);
    } catch (e) {
      console.log('   Impossible de sauvegarder les cookies:', e.message);
    }
  }

  async loadCookies() {
    try {
      const data = await fs.readFile(COOKIES_PATH, 'utf8');
      const cookies = JSON.parse(data);
      await this.page.setCookie(...cookies);
      console.log(`   ${cookies.length} cookies restaurés`);
      return true;
    } catch (e) {
      console.log('   Pas de cookies sauvegardés, connexion complète requise');
      return false;
    }
  }

  // ============================================
  // INIT
  // ============================================

  async loadAccountsList() {
    console.log('Chargement de la liste des comptes...');
    try {
      const accountsPath = path.join(__dirname, 'accounts.json');
      const data = await fs.readFile(accountsPath, 'utf8');
      const jsonData = JSON.parse(data);

      this.accounts = (jsonData.accounts || []).filter(acc => acc.enabled);
      this.config = jsonData.configuration || {};

      if (this.TEST_MODE) {
        console.log('MODE TEST : 1 compte / 5 posts');
        this.accounts = this.accounts.slice(0, 1);
        this.config.scraping = this.config.scraping || {};
        this.config.scraping.posts_per_account = 5;
      }

      console.log(`${this.accounts.length} compte(s) actif(s)`);
      this.accounts
        .sort((a, b) => (b.priority || 0) - (a.priority || 0))
        .forEach(acc => console.log(`   [P${acc.priority}] @${acc.username} - ${acc.venue_name}`));

      return true;
    } catch (error) {
      console.error('Erreur chargement accounts.json:', error.message);
      return false;
    }
  }

  async init() {
    console.log('WOULI SCRAPER V5.1 - Stable');
    console.log(`${new Date().toLocaleString('fr-FR')}`);
    console.log(`Mode filtrage: ${this.FILTERING_MODE.toUpperCase()}`);

    const loaded = await this.loadAccountsList();
    if (!loaded) throw new Error('Impossible de charger la liste des comptes');

    this.browser = await puppeteer.launch({
      headless: this.HEADLESS,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--window-size=1366,768',
        '--disable-blink-features=AutomationControlled'
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

  // ============================================
  // LOGIN AVEC COOKIE PERSISTENCE
  // ============================================

  async login() {
    console.log('\nConnexion Instagram...');

    // Tenter restauration session existante
    const cookiesLoaded = await this.loadCookies();

    if (cookiesLoaded) {
      // Vérifier si la session est encore valide
      await this.page.goto('https://www.instagram.com/', { waitUntil: 'networkidle2' });
      await this.wait(2000);
      const url = this.page.url();
      if (!url.includes('/accounts/login')) {
        console.log('Session restaurée depuis cookies\n');
        await this.closePopups();
        return;
      }
      console.log('   Session expirée, reconnexion...');
    }

    // Connexion complète
    try {
      await this.page.goto('https://www.instagram.com/', { waitUntil: 'networkidle2' });
      await this.wait(3000);

      // Bannière cookies
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
        console.log('   Pas de bannière cookies');
      }

      let usernameInput = await this.page.$('input[name="username"]');
      if (!usernameInput) usernameInput = await this.page.$('input[type="text"]');
      if (!usernameInput) throw new Error('Impossible de trouver le champ username');

      await usernameInput.click();
      await this.page.keyboard.type(process.env.INSTAGRAM_USERNAME || '', { delay: 100 });

      const passwordInput = await this.page.$('input[name="password"], input[type="password"]');
      if (!passwordInput) throw new Error('Impossible de trouver le champ password');

      await passwordInput.click();
      await this.page.keyboard.type(process.env.INSTAGRAM_PASSWORD || '', { delay: 100 });

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
      await this.saveCookies(); // Sauvegarder immédiatement après connexion réussie
      console.log('Connecté !\n');

    } catch (error) {
      console.error('Erreur connexion:', error.message);

      if (!this.HEADLESS) {
        console.log('\nMode manuel : Connectez-vous dans le navigateur puis appuyez sur Enter...');
        await new Promise((resolve) => { process.stdin.once('data', resolve); });
        await this.saveCookies();
        console.log('Connexion manuelle confirmée\n');
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

  // ============================================
  // SCRAPING
  // ============================================

  async scrapeAccount(account) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`@${account.username} (${account.venue_name})`);
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
        console.log('Compte introuvable ou privé');
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

      const maxPosts = (this.config.scraping && this.config.scraping.posts_per_account) || this.config.posts_per_account || 5;
      const postsToAnalyze = postLinks.slice(0, maxPosts);
      console.log(`${postsToAnalyze.length} posts à analyser`);

      let accountEvents = 0;
      for (let i = 0; i < postsToAnalyze.length; i++) {
        console.log(`\n   [Post ${i + 1}/${postsToAnalyze.length}]`);
        const events = await this.analyzePost(postsToAnalyze[i], account);
        if (events && events.length) {
          this.events.push(...events);
          accountEvents += events.length;
        }
        this.stats.posts_analyzed++;
        await this.wait(1500 + Math.random() * 800);
      }

      console.log(`\nRésumé : ${accountEvents} événement(s) trouvés`);
    } catch (error) {
      console.log(`Erreur : ${error.message}`);
      this.stats.errors.push(`@${account.username}: ${error.message}`);
    }
  }

  async analyzePost(postUrl, account) {
    const foundEvents = [];

    try {
      await this.page.goto(postUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      await this.wait(2000);

      // FIX v5.1 : regex corrigée [\uD800-\uDFFF] (le } parasite est supprimé)
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

      console.log(`      ${postData.text.substring(0, 80)}...`);
      console.log(`      Image: ${postData.imageUrl ? 'Trouvée' : 'Non trouvée'}`);

      // SCREENSHOT
      try {
        let screenshotSuccess = false;
        const article = await this.page.$('article');

        if (article) {
          const box = await article.boundingBox();
          if (box) {
            const screenshot = await this.page.screenshot({
              encoding: 'base64',
              type: 'png',
              clip: {
                x: Math.max(0, box.x + 20),
                y: Math.max(0, box.y + 50),
                width: Math.min(box.width - 40, 600),
                height: Math.min(box.height - 100, 800)
              }
            });
            if (screenshot) {
              postData.imageUrl = `data:image/png;base64,${screenshot}`;
              screenshotSuccess = true;
            }
          }
        }

        if (!screenshotSuccess && article) {
          const screenshot = await article.screenshot({ encoding: 'base64', type: 'png' });
          if (screenshot) {
            postData.imageUrl = `data:image/png;base64,${screenshot}`;
            screenshotSuccess = true;
          }
        }

        if (!screenshotSuccess) {
          await this.wait(1000);
          const screenshot = await this.page.screenshot({
            encoding: 'base64',
            type: 'png',
            clip: { x: 150, y: 80, width: 900, height: 600 }
          });
          if (screenshot) postData.imageUrl = `data:image/png;base64,${screenshot}`;
        }

        if (postData.imageUrl && postData.imageUrl.startsWith('data:image')) {
          if (this.detectPopupInImage(postData.imageUrl)) {
            postData.needsManualImage = true;
            this.stats.needs_manual_image++;
          }
        }

      } catch (screenshotError) {
        console.log('      Screenshot échoué:', screenshotError.message);
      }

      // CLASSIFICATION
      if (this.isProgramme(postData.text)) {
        console.log('      Programme détecté');
        this.stats.programs_detected++;

        if (this.isEdgeCaseProgram(postData.text)) {
          console.log('      Cas marginal → Validation manuelle');
          this.stats.programs_edge_case++;
          foundEvents.push(this.createManualReviewEvent(
            postData, account,
            'Programme cas marginal (saison complète, période longue ou format atypique)'
          ));
        } else {
          const programEvents = await this.parseProgram(postData, account);
          foundEvents.push(...programEvents);
        }
      } else if (this.isEvent(postData.text)) {
        console.log('      ÉVÉNEMENT SINGLE DÉTECTÉ');
        const singleEvent = await this.extractSingleEvent(postData, account);
        if (singleEvent) {
          this.stats.events_single++;
          foundEvents.push(singleEvent);
        }
      } else {
        console.log('      Pas un événement');
      }

      foundEvents.forEach(ev => {
        const icon = ev.status === 'manual_review' ? '[MANUEL]' : '[OK]';
        console.log(`         ${icon} ${ev.title}`);
      });

    } catch (error) {
      console.log(`      Erreur: ${error.message}`);
    }

    return foundEvents;
  }

  // ============================================
  // DÉTECTION PROGRAMME / ÉVÉNEMENT
  // ============================================

  isProgramme(text) {
    const lower = (text || '').toLowerCase();

    const keywords = [
      'programme', 'agenda', 'semaine', 'week',
      'événements de la semaine', 'nos eventos', 'cette semaine',
      'planning', 'line up', 'lineup'
    ];

    let keywordMatches = 0;
    for (const k of keywords) {
      if (lower.includes(k)) keywordMatches++;
    }

    const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
    let dayCount = 0;
    for (const day of days) {
      if (lower.includes(day)) dayCount++;
    }

    return dayCount >= 3 || keywordMatches >= 2;
  }

  isEdgeCaseProgram(text) {
    const lower = text.toLowerCase();
    if (lower.includes('saison 2024') || lower.includes('saison 2025') || lower.includes('saison 2026') ||
        lower.includes('programmation annuelle') || lower.includes('toute l\'année')) {
      return true;
    }
    if (/du \d{1,2} \w+ au \d{1,2} \w+ \d{4}/.test(text)) return true;
    const dateMatches = text.match(/\d{1,2}\/\d{1,2}/g);
    if (dateMatches && dateMatches.length > 10) return true;
    return false;
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
      for (const kw of arr) {
        if (lower.includes(kw)) score += (cat === 'timing' || cat === 'event') ? 2 : 1;
      }
    }

    const thresholds = { lax: 2, balanced: 3, strict: 5 };
    const minScore = thresholds[this.FILTERING_MODE] || 3;
    return score >= minScore;
  }

  // ============================================
  // PARSING PROGRAMMES
  // ============================================

  async parseProgram(postData, account) {
    console.log('      Parsing programme...');

    let events = this.parseSimpleProgram(postData.text);

    if (events.length === 0 && postData.imageUrl) {
      console.log('      Parsing échoué, tentative OCR...');
      this.stats.ocr_attempts++;
      const ocrText = await this.extractTextFromImage(postData.imageUrl);
      if (ocrText.length > 50) {
        this.stats.ocr_success++;
        postData.text += '\n' + ocrText;
        events = this.parseSimpleProgram(postData.text);
      }
    }

    if (events.length === 0) {
      console.log('      Parsing impossible → Validation manuelle');
      this.stats.programs_manual_review++;
      return [this.createManualReviewEvent(postData, account, 'Programme non parsable automatiquement')];
    }

    console.log(`      ${events.length} événement(s) extraits du programme`);
    this.stats.programs_parsed++;

    const programEvents = [];
    for (const ev of events) {
      const eventDate = this.getDateForDay(ev.day);
      const fullEvent = await this.createEvent(
        ev.description.substring(0, 100),
        ev.description,
        eventDate,
        account,
        postData.imageUrl,
        postData.url,
        postData.text
      );
      fullEvent.event_type = 'program_parsed';
      fullEvent.parsing_confidence = ev.confidence;
      fullEvent.parsing_method = ev.method;
      fullEvent.event_day = ev.day;
      if (postData.needsManualImage) fullEvent.needs_manual_image = true;
      programEvents.push(fullEvent);
    }

    return programEvents;
  }

  parseSimpleProgram(text) {
    const events = [];

    // Pattern 1 : "• JOUR — Description"
    const pattern1 = /[🔸•\-]\s*(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\s*[—\-:]\s*(.+?)(?=[🔸•\-]\s*(?:lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)|$)/gis;
    const matches1 = [...text.matchAll(pattern1)];
    if (matches1.length > 0) {
      for (const match of matches1) {
        events.push({ day: match[1].toLowerCase(), description: match[2].trim().substring(0, 200), confidence: 0.85, method: 'regex_pattern1' });
      }
      return events;
    }

    // Pattern 2 : "- Jeudi 11/12 : EVENT"
    const pattern2 = /[-•]\s*(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\s*(\d{1,2}\/\d{1,2})?\s*:?\s*(.+?)(?=[-•]|$)/gi;
    const matches2 = [...text.matchAll(pattern2)];
    if (matches2.length > 0) {
      for (const match of matches2) {
        events.push({ day: match[1].toLowerCase(), date: match[2] || null, description: match[3].trim().substring(0, 200), confidence: 0.9, method: 'regex_pattern2' });
      }
      return events;
    }

    // Pattern 3 : "JJ/MM Titre"
    const pattern3 = /(\d{1,2}\/\d{1,2})\s+(.+?)(?=\d{1,2}\/\d{1,2}|$)/g;
    const matches3 = [...text.matchAll(pattern3)];
    if (matches3.length >= 3) {
      for (const match of matches3) {
        const [day, month] = match[1].split('/').map(n => parseInt(n));
        const date = new Date(new Date().getFullYear(), month - 1, day);
        const dayName = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'][date.getDay()];
        events.push({ day: dayName, date: match[1], description: match[2].trim().substring(0, 200), confidence: 0.75, method: 'regex_pattern3' });
      }
      return events;
    }

    return events;
  }

  async extractTextFromImage(imageUrl) {
    try {
      const Tesseract = require('tesseract.js');
      let imageData = imageUrl.startsWith('data:image') ? imageUrl.split(',')[1] : imageUrl;
      const { data: { text } } = await Tesseract.recognize(imageData, 'fra', {
        logger: m => {
          if (m.status === 'recognizing text') process.stdout.write(`\r      OCR: ${Math.round(m.progress * 100)}%`);
        }
      });
      console.log('\n      OCR terminé');
      return text;
    } catch (error) {
      console.error('\n      OCR échoué:', error.message);
      return '';
    }
  }

  detectPopupInImage(base64Image) {
    return base64Image.length < 50000;
  }

  createManualReviewEvent(postData, account, reason) {
    const nowIso = new Date().toISOString();
    return {
      id: crypto.randomUUID ? crypto.randomUUID() : undefined,
      title: `[MANUEL] Programme @${account.username}`,
      description: (postData.text || '').substring(0, 500),
      date: new Date().toISOString(),
      end_date: null,
      location: this.cleanUnicode(account.venue_name),
      address: this.cleanUnicode(account.address || `${account.venue_name}, Lyon`),
      category: account.category || this.config.default_category || 'activites',
      tags: ['instagram', account.username, 'manual_review'],
      image_url: postData.imageUrl || null,
      external_url: postData.url,
      price: null,
      max_participants: null,
      created_by: this.ADMIN_UUID,
      created_by_type: 'admin',
      views: 0,
      likes: 0,
      participants: 0,
      search_appearances: 0,
      created_at: nowIso,
      updated_at: nowIso,
      status: 'pending',
      archived_at: null,
      actual_participants: 0,
      no_show_count: 0,
      end_time: null,
      scraped_at: nowIso,
      submitter_email: null,
      validated_at: null,
      validated_by: null,
      event_type: 'program_unparsed',
      parsing_confidence: null,
      parsing_method: null,
      manual_review_reason: reason,
      account_username: account.username,
      needs_manual_image: postData.needsManualImage || false,
      event_day: null
    };
  }

  // ============================================
  // EXTRACTION ÉVÉNEMENT SINGLE
  // ============================================

  async extractSingleEvent(postData, account) {
    const title = this.extractBetterTitle(postData.text, account);
    const event = await this.createEvent(
      title, postData.text,
      this.extractDate(postData.text),
      account, postData.imageUrl, postData.url, postData.text
    );
    event.event_type = 'single';
    if (postData.needsManualImage) event.needs_manual_image = true;
    return event;
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
        console.warn('Enhance function error:', e.message);
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
      id: crypto.randomUUID ? crypto.randomUUID() : undefined,
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
      views: 0,
      likes: 0,
      participants: 0,
      search_appearances: 0,
      created_at: nowIso,
      updated_at: nowIso,
      status: 'pending',
      archived_at: null,
      actual_participants: 0,
      no_show_count: 0,
      end_time: null,
      scraped_at: nowIso,
      submitter_email: null,
      validated_at: null,
      validated_by: null,
      event_type: 'single',
      parsing_confidence: null,
      parsing_method: null,
      account_username: account.username,
      needs_manual_image: false,
      manual_review_reason: null,
      event_day: null
    };
  }

  // ============================================
  // UTILITAIRES
  // ============================================

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
      const year = now.getFullYear();
      const d = new Date(year, month, day, 22, 0, 0);
      if (d < now) d.setFullYear(year + 1);
      return d.toISOString();
    }

    if (lower.includes('ce soir') || lower.includes('tonight')) {
      const t = new Date(); t.setHours(22, 0, 0, 0); return t.toISOString();
    }
    if (lower.includes('demain') || lower.includes('tomorrow')) {
      const t = new Date(); t.setDate(t.getDate() + 1); t.setHours(22, 0, 0, 0); return t.toISOString();
    }

    const jours = { 'lundi': 1, 'mardi': 2, 'mercredi': 3, 'jeudi': 4, 'vendredi': 5, 'samedi': 6, 'dimanche': 0 };
    for (const j of Object.keys(jours)) {
      if (lower.includes(j)) return this.getDateForDay(j);
    }

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
      const match = (text || '').match(p);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = match[2] || '00';
        const ampm = match[3];
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

  // ============================================
  // SAUVEGARDE SUPABASE
  // ============================================

  async saveToSupabase() {
    if (!this.events.length) {
      console.log('\nAucun événement à sauvegarder');
      return;
    }

    console.log(`\nSauvegarde de ${this.events.length} événement(s)...`);
    const batchSize = 10;
    let saved = 0;

    console.log('\nAperçu :');
    this.events.slice(0, 5).forEach((e, i) => {
      const d = new Date(e.date);
      const icon = e.status === 'manual_review' ? '[MANUEL]' : '[OK]';
      console.log(`   ${i + 1}. ${icon} ${e.title}`);
      console.log(`      ${d.toLocaleDateString('fr-FR')} à ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`);
      console.log(`      ${e.location}`);
    });
    if (this.events.length > 5) console.log(`   ... et ${this.events.length - 5} autres`);

    try {
      for (let i = 0; i < this.events.length; i += batchSize) {
        const batch = this.events.slice(i, i + batchSize);
        const { error } = await this.supabase.from('events').insert(batch);
        if (error) {
          console.error(`\nErreur batch ${i / batchSize + 1}:`, error.message || error);
        } else {
          saved += batch.length;
          console.log(`   Batch ${i / batchSize + 1} sauvegardé (${batch.length})`);
        }
        await this.wait(800);
      }
      console.log(`\nSauvegarde terminée : ${saved}/${this.events.length}`);
      const pendingCount = this.events.filter(e => e.status === 'pending').length;
      console.log(`   → ${pendingCount} événements en 'pending'`);
    } catch (e) {
      console.error('\nErreur générale de sauvegarde:', e);
    }
  }

  async generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('RAPPORT FINAL V5.1');
    console.log('='.repeat(60));
    console.log(`Comptes analysés   : ${this.stats.accounts_scraped}`);
    console.log(`Posts analysés     : ${this.stats.posts_analyzed}`);
    console.log(`Événements single  : ${this.stats.events_single}`);
    console.log(`Programmes détectés: ${this.stats.programs_detected}`);
    console.log(`  - Parsés auto    : ${this.stats.programs_parsed}`);
    console.log(`  - Cas marginaux  : ${this.stats.programs_edge_case}`);
    console.log(`  - Manual review  : ${this.stats.programs_manual_review}`);
    console.log(`OCR tentatives     : ${this.stats.ocr_attempts} (réussis: ${this.stats.ocr_success})`);
    console.log(`Images avec popup  : ${this.stats.needs_manual_image}`);
    console.log(`Total créés        : ${this.events.length}`);
    if (this.stats.errors.length) {
      console.log('\nErreurs :');
      this.stats.errors.forEach(e => console.log('   - ' + e));
    }
    console.log('='.repeat(60));
  }

  async close() {
    console.log('\nFermeture dans 3 secondes...');
    await this.wait(3000);
    if (this.browser) await this.browser.close();
  }
}

// ============================================
// MAIN
// ============================================

async function runScraperV5() {
  const scraper = new WouliScraperV5();
  try {
    await scraper.init();
    await scraper.login();

    const sorted = scraper.accounts.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    console.log(`\nDébut du scraping de ${sorted.length} compte(s)...\n`);

    for (const acc of sorted) {
      await scraper.scrapeAccount(acc);
      await scraper.wait(2500 + Math.random() * 1500);
      if (scraper.stats.errors.length > 5) {
        console.log('\nTrop d\'erreurs consécutives, arrêt.');
        break;
      }
    }

    await scraper.saveToSupabase();
    await scraper.generateReport();
  } catch (e) {
    console.error('\nERREUR FATALE:', e);
  } finally {
    await scraper.close();
  }
}

if (require.main === module) {
  console.log('LANCEMENT DU SCRAPER V5.1');
  console.log(`Mode Test    : ${process.env.TEST_MODE === 'true' ? 'OUI' : 'NON'}`);
  console.log(`Headless     : ${process.env.HEADLESS !== 'false' ? 'OUI' : 'NON'}`);
  console.log(`Auto Enhance : ${process.env.AUTO_ENHANCE === 'true' ? 'OUI' : 'NON'}`);
  console.log(`Filtrage     : ${process.env.FILTERING_MODE || 'balanced'}`);
  console.log(`Instagram    : ${process.env.INSTAGRAM_USERNAME ? 'configuré' : 'MANQUANT'}`);
  console.log(`Supabase     : ${process.env.SUPABASE_URL ? 'configuré' : 'MANQUANT'}`);
  runScraperV5();
}

module.exports = { WouliScraperV5, runScraperV5 };
