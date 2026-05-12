/**
 * scraper-bot.js
 * Bot Telegram pour piloter le scraper Wouli à distance
 *
 * Commandes :
 *   /scrape  — Lance le scraper (reprend depuis le checkpoint si existant)
 *   /reset   — Supprime le checkpoint et lance depuis zéro
 *   /stop    — Arrête le scraper en cours
 *   /status  — État actuel (en cours / inactif)
 *   /help    — Liste des commandes
 *
 * Usage : node scraper-bot.js
 * Requis dans .env : TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const TOKEN    = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID  = String(process.env.TELEGRAM_CHAT_ID || '');
const PROGRESS = path.join(__dirname, 'scraper-progress.json');

if (!TOKEN || !CHAT_ID) {
  console.error('❌ TELEGRAM_BOT_TOKEN et TELEGRAM_CHAT_ID requis dans .env');
  process.exit(1);
}

let scraperProcess = null;
let offset = 0;

// ============================================================
// TELEGRAM API
// ============================================================

async function apiCall(method, body = {}) {
  const res = await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

async function send(text) {
  return apiCall('sendMessage', { chat_id: CHAT_ID, text, parse_mode: 'HTML' });
}

async function getUpdates() {
  const data = await apiCall('getUpdates', { offset, timeout: 30, allowed_updates: ['message'] });
  return data.result || [];
}

// ============================================================
// COMMANDES
// ============================================================

async function cmdScrape() {
  if (scraperProcess) {
    await send('⚠️ Le scraper tourne déjà.');
    return;
  }

  const hasCheckpoint = fs.existsSync(PROGRESS);
  if (hasCheckpoint) {
    let info = '';
    try {
      const p = JSON.parse(fs.readFileSync(PROGRESS, 'utf8'));
      info = `\n⏩ Reprise depuis ${p.completedAccounts?.length || 0} comptes déjà traités`;
    } catch {}
    await send(`🚀 <b>Lancement du scraper (reprise)...</b>${info}`);
  } else {
    await send('🚀 <b>Lancement du scraper...</b>');
  }

  startScraper();
}

async function cmdReset() {
  if (scraperProcess) {
    await send('⚠️ Arrête d\'abord le scraper en cours avec /stop');
    return;
  }
  if (fs.existsSync(PROGRESS)) {
    fs.unlinkSync(PROGRESS);
    await send('🗑 Checkpoint supprimé.');
  }
  await send('🚀 <b>Lancement depuis zéro...</b>');
  startScraper();
}

async function cmdStop() {
  if (!scraperProcess) {
    await send('ℹ️ Aucun scraper en cours.');
    return;
  }
  scraperProcess.kill('SIGTERM');
  scraperProcess = null;
  await send('🛑 Scraper arrêté.');
}

async function cmdStatus() {
  if (scraperProcess) {
    let progress = '';
    if (fs.existsSync(PROGRESS)) {
      try {
        const p = JSON.parse(fs.readFileSync(PROGRESS, 'utf8'));
        const count = p.completedAccounts?.length || 0;
        const since = p.startedAt ? `\nDémarré le ${new Date(p.startedAt).toLocaleString('fr-FR')}` : '';
        progress = `\n${count} comptes traités${since}`;
      } catch {}
    }
    await send(`🟢 <b>Scraper en cours</b>${progress}`);
  } else {
    const hasCheckpoint = fs.existsSync(PROGRESS);
    await send(hasCheckpoint
      ? '⚫ Scraper inactif — checkpoint disponible (/scrape pour reprendre)'
      : '⚫ Scraper inactif');
  }
}

async function cmdHelp() {
  await send([
    '🤖 <b>Wouli Scraper Bot</b>',
    '',
    '/scrape — Lancer (reprend si checkpoint)',
    '/reset  — Repartir depuis zéro',
    '/stop   — Arrêter',
    '/status — État actuel',
    '/help   — Ce message'
  ].join('\n'));
}

// ============================================================
// PROCESSUS SCRAPER
// ============================================================

function startScraper() {
  scraperProcess = spawn('node', [path.join(__dirname, 'scraper-v5-wouli.js')], {
    cwd: __dirname,
    env: process.env
  });

  scraperProcess.stdout.on('data', d => process.stdout.write(d));
  scraperProcess.stderr.on('data', d => process.stderr.write(d));

  scraperProcess.on('close', async (code) => {
    scraperProcess = null;
    if (code === 0) {
      // Le scraper envoie lui-même le résumé Telegram en fin de run
      // Ici on gère juste les crashes inattendus (code != 0)
    } else if (code !== null) {
      // code=null = SIGTERM volontaire (/stop), pas une erreur
      await send(`❌ <b>Scraper terminé anormalement</b> (code ${code})`);
    }
  });

  scraperProcess.on('error', async (err) => {
    scraperProcess = null;
    await send(`❌ <b>Erreur de lancement</b> : ${err.message}`);
  });
}

// ============================================================
// BOUCLE DE POLLING
// ============================================================

async function handleMessage(text) {
  const cmd = (text || '').trim().toLowerCase().split('@')[0]; // ignore @BotName suffix
  switch (cmd) {
    case '/scrape':  return cmdScrape();
    case '/reset':   return cmdReset();
    case '/stop':    return cmdStop();
    case '/status':  return cmdStatus();
    case '/help':
    case '/start':   return cmdHelp();
    default:
      await send(`Commande inconnue. Tape /help`);
  }
}

async function poll() {
  while (true) {
    try {
      const updates = await getUpdates();
      for (const update of updates) {
        offset = update.update_id + 1;
        const msg = update.message;
        if (!msg?.text) continue;
        // Sécurité : ignorer tous les chats sauf le CHAT_ID configuré
        if (String(msg.chat.id) !== CHAT_ID) {
          console.log(`Message ignoré (chat_id: ${msg.chat.id})`);
          continue;
        }
        console.log(`[Bot] Commande reçue : ${msg.text}`);
        await handleMessage(msg.text);
      }
    } catch (e) {
      if (!e.message?.includes('fetch')) {
        console.error('[Bot] Erreur polling:', e.message);
      }
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

// ============================================================
// DÉMARRAGE
// ============================================================

console.log('🤖 Wouli Bot démarré — en attente de commandes Telegram...');
console.log(`   Chat ID configuré : ${CHAT_ID}`);
send('🤖 <b>Wouli Bot en ligne</b>\nTape /help pour voir les commandes.').catch(() => {});
poll();
