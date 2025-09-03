
-- 1) FRIENDSHIPS: table + contraintes + RLS + triggers + realtime

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  friend_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','blocked')),
  requested_at timestamptz not null default now(),
  accepted_at timestamptz,
  constraint friendships_no_self check (user_id <> friend_id),
  constraint friendships_pair_unique unique (
    LEAST(user_id, friend_id), 
    GREATEST(user_id, friend_id)
  )
);

alter table public.friendships enable row level security;

-- SELECT: chaque participant peut voir la relation
create policy if not exists "Friendship participants can view"
on public.friendships
for select
using (auth.uid() = user_id or auth.uid() = friend_id);

-- INSERT: seul le demandeur peut créer une demande (pending)
create policy if not exists "User can create pending friendship requests"
on public.friendships
for insert
with check (
  auth.uid() = user_id
  and user_id <> friend_id
  and status = 'pending'
);

-- UPDATE: le destinataire peut accepter; les deux peuvent bloquer
-- 3.1 Accepter (seul friend_id)
create policy if not exists "Recipient can accept friendship"
on public.friendships
for update
using (auth.uid() = friend_id)
with check (
  -- permet accepted ou blocked côté destinataire
  (auth.uid() = friend_id) and (status in ('accepted','blocked'))
);

-- 3.2 Bloquer (les deux côtés)
create policy if not exists "Either participant can block friendship"
on public.friendships
for update
using (auth.uid() = user_id or auth.uid() = friend_id)
with check (status = 'blocked');

-- DELETE: chaque participant peut supprimer
create policy if not exists "Either participant can delete friendship"
on public.friendships
for delete
using (auth.uid() = user_id or auth.uid() = friend_id);

-- Indexes
create index if not exists friendships_user_idx on public.friendships (user_id);
create index if not exists friendships_friend_idx on public.friendships (friend_id);
create index if not exists friendships_status_idx on public.friendships (status);

-- Trigger: set accepted_at quand passe à 'accepted'
create or replace function public.set_friendship_accepted_at()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.status = 'accepted' and (old.status is distinct from 'accepted') then
    if new.accepted_at is null then
      new.accepted_at := now();
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_friendship_accepted_at on public.friendships;
create trigger trg_set_friendship_accepted_at
before update on public.friendships
for each row
when (old.status is distinct from 'accepted' and new.status = 'accepted')
execute procedure public.set_friendship_accepted_at();

-- Realtime
alter table public.friendships replica identity full;
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'friendships'
  ) then
    execute 'alter publication supabase_realtime add table public.friendships';
  end if;
end $$;

-----------------------------------------------------------------------
-- 2) NOTIFICATIONS: table + RLS + trigger d’acceptation + realtime

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null, -- e.g. 'friend_request_accepted'
  payload jsonb,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

alter table public.notifications enable row level security;

-- RLS: lecture et mise à jour par l’utilisateur concerné
create policy if not exists "Users can read their notifications"
on public.notifications
for select
using (auth.uid() = user_id);

create policy if not exists "Users can mark own notifications as read"
on public.notifications
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Indexes
create index if not exists notifications_user_created_idx on public.notifications (user_id, created_at desc);

-- Trigger: notifier le demandeur quand la demande est acceptée
create or replace function public.notify_friendship_accept()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.status = 'accepted' and (old.status is distinct from 'accepted') then
    insert into public.notifications (user_id, type, payload)
    values (
      new.user_id,
      'friend_request_accepted',
      jsonb_build_object('friend_id', new.friend_id, 'accepted_at', coalesce(new.accepted_at, now()))
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_notify_friendship_accept on public.friendships;
create trigger trg_notify_friendship_accept
after update on public.friendships
for each row
when (old.status is distinct from 'accepted' and new.status = 'accepted')
execute procedure public.notify_friendship_accept();

-- Realtime
alter table public.notifications replica identity full;
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then
    execute 'alter publication supabase_realtime add table public.notifications';
  end if;
end $$;

-----------------------------------------------------------------------
-- 3) CONTACTS TÉLÉPHONE (optionnel) : stocker UNIQUEMENT des hashs

create table if not exists public.user_contacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  contact_hash text not null,
  created_at timestamptz not null default now(),
  unique (owner_id, contact_hash)
);

alter table public.user_contacts enable row level security;

create policy if not exists "Owner can manage their contacts"
on public.user_contacts
for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create index if not exists user_contacts_owner_idx on public.user_contacts (owner_id);

-----------------------------------------------------------------------
-- 4) ACCÉLÉRER LA RECHERCHE USERNAME (LIKE/ILIKE)

-- Index btree sur lower(username) pour recherches case-insensitive
create index if not exists profiles_username_lower_idx on public.profiles (lower(username));
