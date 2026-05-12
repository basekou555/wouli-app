/**
 * scraper-bot.js
 * Bot Telegram pour piloter le scraper Wouli à distance
 *
 * Commandes :
 *   /scrape   — Lance le scraper Instagram (reprend si checkpoint)
 *   /reset    — Supprime le checkpoint et relance depuis zéro
 *   /ra       — Lance le scraper Resident Advisor
 *   /shotgun  — Lance le scraper Shotgun Lyon
 *   /all      — Lance toutes les sources (Instagram + RA + Shotgun)
 *   /stop     — Arrête le process en cours
 *   /status   — État actuel
 *   /help     — Liste des commandes
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

// Process actif (un seul à la fois)
let activeProcess = null;
let activeSource  = null;
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
// LANCEMENT DE PROCESS
// ============================================================

function launchProcess(script, args, label) {
  if (activeProcess) return false;

  activeProcess = spawn('node', [path.join(__dirname, script), ...args], {
    cwd: __dirname,
    env: process.env
  });
  activeSource = label;

  activeProcess.stdout.on('data', d => process.stdout.write(d));
  activeProcess.stderr.on('data', d => process.stderr.write(d));

  activeProcess.on('close', async (code) => {
    const src = activeSource;
    activeProcess = null;
    activeSource  = null;
    // code null = SIGTERM volontaire (/stop)
    if (code !== null && code !== 0) {
      await send(`❌ <b>${src} terminé anormalement</b> (code ${code})`);
    }
    // Les scrapers envoient eux-mêmes leur résumé Telegram en fin de run
  });

  activeProcess.on('error', async (err) => {
    activeProcess = null;
    activeSource  = null;
    await send(`❌ <b>Erreur de lancement ${label}</b> : ${err.message}`);
  });

  return true;
}

// ============================================================
// COMMANDES — INSTAGRAM
// ============================================================

async function cmdScrape() {
  if (activeProcess) {
    await send(`⚠️ <b>${activeSource}</b> tourne déjà. /stop pour arrêter.`);
    return;
  }
  const hasCheckpoint = fs.existsSync(PROGRESS);
  let msg = '🚀 <b>Lancement Instagram...</b>';
  if (hasCheckpoint) {
    try {
      const p = JSON.parse(fs.readFileSync(PROGRESS, 'utf8'));
      msg = `🚀 <b>Reprise Instagram...</b>\n⏩ ${p.completedAccounts?.length || 0} comptes déjà traités`;
    } catch {}
  }
  await send(msg);
  launchProcess('scraper-v5-wouli.js', [], 'Instagram');
}

async function cmdReset() {
  if (activeProcess) {
    await send('⚠️ Arrête d\'abord avec /stop');
    return;
  }
  if (fs.existsSync(PROGRESS)) {
    fs.unlinkSync(PROGRESS);
    await send('🗑 Checkpoint supprimé.');
  }
  await send('🚀 <b>Instagram — démarrage depuis zéro...</b>');
  launchProcess('scraper-v5-wouli.js', [], 'Instagram');
}

// ============================================================
// COMMANDES — SOURCES SECONDAIRES
// ============================================================

async function cmdRA() {
  if (activeProcess) {
    await send(`⚠️ <b>${activeSource}</b> tourne déjà. /stop pour arrêter.`);
    return;
  }
  await send('🎵 <b>Lancement Resident Advisor Lyon...</b>');
  launchProcess('ra-scraper.js', [], 'Resident Advisor');
}

async function cmdShotgun() {
  if (activeProcess) {
    await send(`⚠️ <b>${activeSource}</b> tourne déjà. /stop pour arrêter.`);
    return;
  }
  await send('🎯 <b>Lancement Shotgun Lyon...</b>');
  launchProcess('shotgun-runner.js', [], 'Shotgun');
}

async function cmdAll() {
  if (activeProcess) {
    await send(`⚠️ <b>${activeSource}</b> tourne déjà. /stop pour arrêter.`);
    return;
  }
  await send('🚀 <b>Lancement de toutes les sources...</b>\nRA et Shotgun d\'abord, Instagram ensuite.');

  // Lancer RA puis Shotgun en séquence (rapides), puis Instagram
  const runAll = async () => {
    for (const [script, label] of [
      ['ra-scraper.js',      'Resident Advisor'],
      ['shotgun-runner.js',  'Shotgun'],
    ]) {
      await new Promise((resolve) => {
        const proc = spawn('node', [path.join(__dirname, script)], {
          cwd: __dirname,
          env: process.env
        });
        proc.stdout.on('data', d => process.stdout.write(d));
        proc.stderr.on('data', d => process.stderr.write(d));
        proc.on('close', (code) => {
          if (code !== 0) console.error(`[${label}] Terminé avec code ${code}`);
          resolve();
        });
      });
    }
    // Puis Instagram (long)
    await send('✅ RA + Shotgun terminés — lancement Instagram...');
    launchProcess('scraper-v5-wouli.js', [], 'Instagram (/all)');
  };

  runAll().catch(e => send(`❌ Erreur /all : ${e.message}`));
}

// ============================================================
// COMMANDES — CONTRÔLE
// ============================================================

async function cmdStop() {
  if (!activeProcess) {
    await send('ℹ️ Aucun process en cours.');
    return;
  }
  const src = activeSource;
  activeProcess.kill('SIGTERM');
  activeProcess = null;
  activeSource  = null;
  await send(`🛑 <b>${src}</b> arrêté.`);
}

async function cmdStatus() {
  if (activeProcess) {
    let progress = '';
    if (activeSource?.includes('Instagram') && fs.existsSync(PROGRESS)) {
      try {
        const p = JSON.parse(fs.readFileSync(PROGRESS, 'utf8'));
        const count = p.completedAccounts?.length || 0;
        const since = p.startedAt ? `\nDémarré le ${new Date(p.startedAt).toLocaleString('fr-FR')}` : '';
        progress = `\n${count} comptes traités${since}`;
      } catch {}
    }
    await send(`🟢 <b>${activeSource} en cours</b>${progress}`);
  } else {
    const hasCheckpoint = fs.existsSync(PROGRESS);
    await send(hasCheckpoint
      ? '⚫ Inactif — checkpoint Instagram disponible (/scrape pour reprendre)'
      : '⚫ Inactif — toutes les sources disponibles');
  }
}

async function cmdHelp() {
  await send([
    '🤖 <b>Wouli Scraper Bot</b>',
    '',
    '<b>Instagram</b>',
    '/scrape  — Lancer (reprend si checkpoint)',
    '/reset   — Repartir depuis zéro',
    '',
    '<b>Autres sources</b>',
    '/ra      — Resident Advisor Lyon',
    '/shotgun — Shotgun Lyon',
    '/all     — Toutes les sources',
    '',
    '<b>Contrôle</b>',
    '/stop    — Arrêter',
    '/status  — État actuel',
    '/help    — Ce message'
  ].join('\n'));
}

// ============================================================
// BOUCLE DE POLLING
// ============================================================

async function handleMessage(text) {
  const cmd = (text || '').trim().toLowerCase().split('@')[0];
  switch (cmd) {
    case '/scrape':   return cmdScrape();
    case '/reset':    return cmdReset();
    case '/ra':       return cmdRA();
    case '/shotgun':  return cmdShotgun();
    case '/all':      return cmdAll();
    case '/stop':     return cmdStop();
    case '/status':   return cmdStatus();
    case '/help':
    case '/start':    return cmdHelp();
    default:
      await send('Commande inconnue. Tape /help');
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
        if (String(msg.chat.id) !== CHAT_ID) {
          console.log(`[Bot] Message ignoré (chat_id: ${msg.chat.id})`);
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
