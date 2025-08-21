
-- 1) Enum des rôles d'app, table user_roles, RLS et fonctions de vérification

create type if not exists public.app_role as enum ('admin', 'moderator', 'user');

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Fonction de vérification générique: has_role()
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = _user_id
      and ur.role = _role
  );
$$;

-- Fonction pratique: is_admin() (compatible avec l'état actuel qui stocke 'admin' sur profiles.type)
create or replace function public.is_admin(_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.has_role(_user_id, 'admin'), false)
         or exists (select 1 from public.profiles p where p.id = _user_id and p.type = 'admin');
$$;

-- Politiques RLS sur user_roles
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_roles'
      and policyname = 'Users can view their own roles or admins'
  ) then
    create policy "Users can view their own roles or admins"
      on public.user_roles
      for select
      to authenticated
      using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_roles'
      and policyname = 'Only admins can modify roles'
  ) then
    create policy "Only admins can modify roles"
      on public.user_roles
      for all
      to authenticated
      using (public.has_role(auth.uid(), 'admin'))
      with check (public.has_role(auth.uid(), 'admin'));
  end if;
end
$$;

-- 2) RLS ciblé sur events_pending: lecture/gestion réservée aux admins
-- (on suppose que l'INSERT est déjà permis aux utilisateurs via vos flows existants)

alter table public.events_pending enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'events_pending'
      and policyname = 'Admins can view all pending events'
  ) then
    create policy "Admins can view all pending events"
      on public.events_pending
      for select
      to authenticated
      using (public.is_admin(auth.uid()));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'events_pending'
      and policyname = 'Admins can update pending events'
  ) then
    create policy "Admins can update pending events"
      on public.events_pending
      for update
      to authenticated
      using (public.is_admin(auth.uid()))
      with check (public.is_admin(auth.uid()));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'events_pending'
      and policyname = 'Admins can delete pending events'
  ) then
    create policy "Admins can delete pending events"
      on public.events_pending
      for delete
      to authenticated
      using (public.is_admin(auth.uid()));
  end if;
end
$$;

-- 3) RPC sécurisées pour l’interface d’admin de validation

-- Approuver un event: insère dans public.events et marque events_pending comme 'approved'
create or replace function public.approve_pending_event(p_event_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event public.events_pending%rowtype;
  v_new_event_id uuid;
begin
  -- Vérifier admin
  if not public.is_admin(auth.uid()) then
    raise exception 'Insufficient privileges: admin required';
  end if;

  -- Récupérer l'event en attente
  select * into v_event
  from public.events_pending
  where id = p_event_id
  for update;

  if not found then
    raise exception 'Pending event % not found', p_event_id;
  end if;

  -- Insérer dans events (adapter les champs au schéma existant)
  insert into public.events (
    title,
    description,
    date,
    location,
    address,
    category,
    price,
    external_url,
    created_by,
    created_by_type,
    status,
    created_at
  ) values (
    v_event.title,
    v_event.description,
    v_event.date,
    v_event.location,
    v_event.address,
    v_event.category,
    v_event.price,
    v_event.external_url,
    auth.uid(),
    'admin',
    'active',
    now()
  )
  returning id into v_new_event_id;

  -- Marquer comme approuvé
  update public.events_pending
  set status = 'approved',
      validated_by = auth.uid(),
      validated_at = now()
  where id = p_event_id;

  return v_new_event_id;
end;
$$;

-- Refuser un event: met simplement le statut à 'rejected'
create or replace function public.reject_pending_event(p_event_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'Insufficient privileges: admin required';
  end if;

  update public.events_pending
  set status = 'rejected',
      validated_by = auth.uid(),
      validated_at = now()
  where id = p_event_id;

  if not found then
    raise exception 'Pending event % not found', p_event_id;
  end if;
end;
$$;

-- Autoriser les utilisateurs authentifiés à appeler les fonctions
grant execute on function public.has_role(uuid, public.app_role) to authenticated;
grant execute on function public.is_admin(uuid) to authenticated;
grant execute on function public.approve_pending_event(uuid) to authenticated;
grant execute on function public.reject_pending_event(uuid) to authenticated;
