-- Tìshòk Phase 4a: Prayer Room. Paste into Supabase > SQL Editor > Run.
create table public.prayers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  couple_id uuid references public.couples(id) on delete set null,
  body text not null check (char_length(body) between 1 and 2000),
  category text not null default 'general'
    check (category in ('general','relationship','family','gratitude','guidance')),
  visibility text not null default 'private' check (visibility in ('private','shared')),
  answered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((visibility = 'shared') = (couple_id is not null))
);
create index on public.prayers (owner_id, created_at desc);
create index on public.prayers (couple_id) where couple_id is not null;

-- The server decides who owns a prayer and which couple it is shared with.
-- The browser cannot choose either one.
create function public.prayers_before_write() returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then new.owner_id := auth.uid(); end if;
  if tg_op = 'UPDATE' then new.owner_id := old.owner_id; end if;
  if new.visibility = 'shared' then
    new.couple_id := public.my_couple_id();
    if new.couple_id is null then
      raise exception 'Connect with your partner before sharing a prayer';
    end if;
  else
    new.couple_id := null;
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger prayers_write before insert or update on public.prayers
  for each row execute function public.prayers_before_write();

alter table public.prayers enable row level security;
revoke all on public.prayers from anon;

create policy "read own or partner-shared prayers" on public.prayers for select to authenticated
  using (owner_id = auth.uid() or (visibility = 'shared' and couple_id = public.my_couple_id()));
create policy "add own prayers" on public.prayers for insert to authenticated
  with check (owner_id = auth.uid());
create policy "edit own prayers" on public.prayers for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "delete own prayers" on public.prayers for delete to authenticated
  using (owner_id = auth.uid());

-- Disconnecting makes every shared prayer private to its owner. Nothing is deleted.
create or replace function public.leave_couple() returns void
language plpgsql security definer set search_path = public as $$
declare cid uuid;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  cid := public.my_couple_id();
  if cid is null then return; end if;
  update public.prayers set visibility = 'private' where couple_id = cid;
  delete from public.invitations where couple_id = cid and accepted_at is null;
  delete from public.couple_members where couple_id = cid and user_id = auth.uid();
  delete from public.couples c where c.id = cid
    and not exists (select 1 from public.couple_members m where m.couple_id = c.id);
end $$;
