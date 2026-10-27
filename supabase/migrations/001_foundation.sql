-- Tìshòk Phase 3: profiles, couples, invitations, with Row Level Security.
-- Paste into Supabase > SQL Editor > New query > Run. Safe to run once on a new project.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null check (char_length(first_name) between 1 and 40),
  relationship_stage text not null default 'dating'
    check (relationship_stage in ('dating','engaged','married','parenting')),
  timezone text not null default 'Africa/Lusaka',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.couples (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- user_id is unique: a person can belong to only one couple at a time.
create table public.couple_members (
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (couple_id, user_id)
);

-- Only a hash of the invite code is stored. Codes expire after 48 hours.
create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  invited_by uuid not null references auth.users(id) on delete cascade,
  code_hash text not null unique,
  expires_at timestamptz not null default now() + interval '48 hours',
  accepted_by uuid references auth.users(id),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.invitations (invited_by);

create function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- Helper: which couple is the signed-in user in?
create function public.my_couple_id() returns uuid
language sql stable security definer set search_path = public as $$
  select couple_id from public.couple_members where user_id = auth.uid() limit 1
$$;

-- ---------- Row Level Security ----------
alter table public.profiles enable row level security;
alter table public.couples enable row level security;
alter table public.couple_members enable row level security;
alter table public.invitations enable row level security;

-- Profiles: you can read yourself and your connected partner; you can only write yourself.
create policy "read own or partner profile" on public.profiles for select to authenticated
  using (id = auth.uid() or id in (select user_id from public.couple_members where couple_id = public.my_couple_id()));
create policy "insert own profile" on public.profiles for insert to authenticated
  with check (id = auth.uid());
create policy "update own profile" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Couples and members: read-only for members. All changes go through the functions below.
create policy "read own couple" on public.couples for select to authenticated
  using (id = public.my_couple_id());
create policy "read own couple members" on public.couple_members for select to authenticated
  using (couple_id = public.my_couple_id());

-- Invitations: only the person who created one can see it. No direct writes.
create policy "read own invitations" on public.invitations for select to authenticated
  using (invited_by = auth.uid());

-- ---------- Trusted functions (run on the server, not in the browser) ----------
create function public.create_invitation() returns text
language plpgsql security definer set search_path = public as $$
declare cid uuid; code text;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  cid := public.my_couple_id();
  if cid is null then
    insert into public.couples (created_by) values (auth.uid()) returning id into cid;
    insert into public.couple_members (couple_id, user_id) values (cid, auth.uid());
  end if;
  if (select count(*) from public.couple_members where couple_id = cid) >= 2 then
    raise exception 'Your couple already has two members';
  end if;
  code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
  insert into public.invitations (couple_id, invited_by, code_hash)
    values (cid, auth.uid(), encode(sha256(convert_to(code, 'utf8')), 'hex'));
  return code;
end $$;

create function public.accept_invitation(p_code text) returns uuid
language plpgsql security definer set search_path = public as $$
declare inv public.invitations%rowtype;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  if public.my_couple_id() is not null then raise exception 'You are already connected to a partner'; end if;
  select * into inv from public.invitations
    where code_hash = encode(sha256(convert_to(upper(trim(p_code)), 'utf8')), 'hex')
      and accepted_at is null and expires_at > now()
    for update;
  if not found then raise exception 'This invitation is invalid or has expired'; end if;
  if inv.invited_by = auth.uid() then raise exception 'You cannot accept your own invitation'; end if;
  if (select count(*) from public.couple_members where couple_id = inv.couple_id) >= 2 then
    raise exception 'This couple is already full';
  end if;
  insert into public.couple_members (couple_id, user_id) values (inv.couple_id, auth.uid());
  update public.invitations set accepted_by = auth.uid(), accepted_at = now() where id = inv.id;
  return inv.couple_id;
end $$;

revoke execute on function public.create_invitation() from public, anon;
revoke execute on function public.accept_invitation(text) from public, anon;
revoke execute on function public.my_couple_id() from public, anon;
grant execute on function public.create_invitation() to authenticated;
grant execute on function public.accept_invitation(text) to authenticated;
grant execute on function public.my_couple_id() to authenticated;
