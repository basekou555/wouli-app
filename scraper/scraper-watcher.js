// scraper-watcher.js
// ==================================================================
// Veilleur local — fait le pont entre le bouton "Lancer" de l'admin Wouli
// et le scraper Puppeteer qui tourne sur cette machine.
//
// Fonctionnement :
//   1. L'admin clique "Lancer" -> une ligne scraper_runs passe en "pending".
//   2. Ce watcher la détecte, la revendique (-> "running"), et lance
//      scraper-v5-wouli.js en lui passant SCRAPER_RUN_ID.
//   3. Le scraper écrit compteurs + logs dans cette même ligne (realtime admin).
//   4. À la fin du process, le watcher marque "completed" / "failed".
//
// Lancement : node scraper-watcher.js   (garder ce terminal ouvert)
// Variables d'env (depuis scraper/.env) : SUPABASE_URL, SUPABASE_SERVICE_KEY
// ==================================================================

const { createClient } = require('@supabase/supabase-js');
const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const POLL_MS = 5000;            // fréquence de surveillance
const MAX_PENDING_AGE_MS = 15 * 60 * 1000; // ignore les "pending" plus vieux que 15 min (anti-zombie)
const SCRAPER_SCRIPT = 'scraper-v5-wouli.js';

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ SUPABASE_URL / SUPABASE_SERVICE_KEY manquants dans scraper/.env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

let busy = false; // empêche deux scrapes simultanés

// Pousse une ligne dans la console admin (RPC atomique).
async function pushLog(runId, level, message) {
  try {
    await supabase.rpc('append_scraper_log', {
      run_id: runId,
      log_entry: { timestamp: new Date().toISOString(), level, message },
    });
  } catch (_) { /* non bloquant */ }
}

async function claimPendingRun() {
  // Plus ancien run en attente, pas trop vieux.
  const since = new Date(Date.now() - MAX_PENDING_AGE_MS).toISOString();
  const { data: pend, error } = await supabase
    .from('scraper_runs')
    .select('id, created_at, accounts_count')
    .eq('status', 'pending')
    .gte('created_at', since)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) { console.error('Lecture pending:', error.message); return null; }
  if (!pend) return null;

  // Revendication atomique : ne passe à "running" que si c'est ENCORE "pending".
  const { data: claimed, error: upErr } = await supabase
    .from('scraper_runs')
    .update({ status: 'running', started_at: new Date().toISOString() })
    .eq('id', pend.id)
    .eq('status', 'pending')
    .select()
    .maybeSingle();
  if (upErr) { console.error('Revendication:', upErr.message); return null; }
  return claimed; // null si un autre process l'a pris entre-temps
}

function runScraper(run) {
  return new Promise((resolve) => {
    console.log(`▶️  Lancement du scraper pour le run ${run.id}`);
    const child = spawn('node', [SCRAPER_SCRIPT], {
      cwd: __dirname,
      stdio: 'inherit',
      env: { ...process.env, SCRAPER_RUN_ID: run.id },
    });

    // Détecte une annulation depuis l'admin pendant l'exécution.
    const cancelWatch = setInterval(async () => {
      const { data } = await supabase
        .from('scraper_runs').select('status').eq('id', run.id).maybeSingle();
      if (data && data.status === 'cancelled') {
        console.log('🛑 Run annulé depuis l\'admin — arrêt du scraper.');
        child.kill('SIGTERM');
      }
    }, 4000);

    child.on('exit', (code) => { clearInterval(cancelWatch); resolve(code ?? 0); });
    child.on('error', (err) => {
      clearInterval(cancelWatch);
      console.error('Impossible de lancer le scraper:', err.message);
      resolve(1);
    });
  });
}

async function finalizeRun(run, code, startedAt) {
  // Ne pas écraser un statut déjà final (ex: cancelled par l'admin).
  const { data } = await supabase
    .from('scraper_runs').select('status').eq('id', run.id).maybeSingle();
  if (data && ['completed', 'failed', 'cancelled'].includes(data.status)) return;

  const duration = Math.round((Date.now() - new Date(startedAt).getTime()) / 1000);
  const ok = code === 0;
  await pushLog(run.id, ok ? 'success' : 'error',
    ok ? 'Scraper terminé.' : `Scraper interrompu (code ${code}).`);
  await supabase.from('scraper_runs').update({
    status: ok ? 'completed' : 'failed',
    completed_at: new Date().toISOString(),
    duration_seconds: duration,
    error_message: ok ? null : `Process terminé avec le code ${code}`,
  }).eq('id', run.id);
}

async function tick() {
  if (busy) return;
  try {
    const run = await claimPendingRun();
    if (!run) return;
    busy = true;
    console.log(`✅ Run ${run.id} revendiqué.`);
    await pushLog(run.id, 'info', 'Scraper démarré par le watcher local.');
    const startedAt = run.started_at || new Date().toISOString();
    const code = await runScraper(run);
    await finalizeRun(run, code, startedAt);
    console.log(`🏁 Run ${run.id} finalisé (code ${code}).`);
  } catch (e) {
    console.error('Erreur tick:', e.message);
  } finally {
    busy = false;
  }
}

console.log('👀 Watcher Wouli démarré — en attente de runs "pending"…');
console.log(`   Script ciblé : ${path.join(__dirname, SCRAPER_SCRIPT)}`);
setInterval(tick, POLL_MS);
tick();
