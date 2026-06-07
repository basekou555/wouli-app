-- Worker continu d'extraction : pg_cron déclenche extract-event par petits lots,
-- en respectant le débit du free tier Gemini. Reste inerte tant que le secret
-- Vault 'extract_secret' n'est pas créé (aucune écriture surprise).
create extension if not exists pg_cron;
create extension if not exists pg_net;

create or replace function public.run_extraction_batch(p_limit int default 3)
returns void
language plpgsql
security definer
set search_path = public, vault, net
as $$
declare
  v_secret text;
  -- clé anon (publishable) : sert juste à satisfaire verify_jwt ; la vraie barrière
  -- est x-extract-secret (lu depuis Vault).
  v_anon text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkdmJveGdlc2NzcHR2aGtqZ2psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxOTY2MjUsImV4cCI6MjA2NDc3MjYyNX0.eIDNQwbV1MLDaplX3yH9CdTb6W7DXF8qZ15sb60C0fQ';
begin
  select decrypted_secret into v_secret
  from vault.decrypted_secrets where name = 'extract_secret' limit 1;
  if v_secret is null then
    return; -- worker inerte tant que non configuré
  end if;

  perform net.http_post(
    url := 'https://ddvboxgescsptvhkjgjl.supabase.co/functions/v1/extract-event',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_anon,
      'x-extract-secret', v_secret
    ),
    body := jsonb_build_object('limit', p_limit),
    timeout_milliseconds := 120000
  );
end;
$$;

-- Pas d'appel direct par les clients : seul le cron (postgres) l'exécute.
revoke all on function public.run_extraction_batch(int) from anon, authenticated;

-- Planification : toutes les minutes (3 events/lot => sous le quota free tier).
select cron.schedule('wouli-extract-worker', '* * * * *', $$ select public.run_extraction_batch(3); $$);
