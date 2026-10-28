-- Tìshòk Phase 4e: memories. Paste into Supabase > SQL Editor > Run.
create table public.memories (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  couple_id uuid references public.couples(id) on delete set null,
  title text not null check (char_length(title) between 1 and 120),
  body text check (char_length(body) <= 4000),
  memory_date date not null default current_date,
  category text not null default 'moment'
    check (category in ('moment','milestone','testimony','note','hope','answered')),
  visibility text not null default 'private' check (visibility in ('private','shared')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((visibility = 'shared') = (couple_id is not null))
);
create index on public.memories (owner_id, memory_date desc);
create index on public.memories (couple_id) where couple_id is not null;

create trigger memories_write before insert or update on public.memories
  for each row execute function public.prayers_before_write();

alter table public.memories enable row level security;
revoke all on public.memories from anon;

create policy "read own or partner-shared memories" on public.memories for select to authenticated
  using (owner_id = auth.uid() or (visibility = 'shared' and couple_id = public.my_couple_id()));
create policy "add own memories" on public.memories for insert to authenticated
  with check (owner_id = auth.uid());
create policy "edit own memories" on public.memories for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "delete own memories" on public.memories for delete to authenticated
  using (owner_id = auth.uid());

create or replace function public.leave_couple() returns void
language plpgsql security definer set search_path = public as $$
declare cid uuid;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  cid := public.my_couple_id();
  if cid is null then return; end if;
  update public.prayers set visibility = 'private' where couple_id = cid;
  update public.devotional_entries set visibility = 'private' where couple_id = cid;
  update public.us_answers set visibility = 'private' where couple_id = cid;
  update public.memories set visibility = 'private' where couple_id = cid;
  delete from public.invitations where couple_id = cid and accepted_at is null;
  delete from public.couple_members where couple_id = cid and user_id = auth.uid();
  delete from public.couples c where c.id = cid
    and not exists (select 1 from public.couple_members m where m.couple_id = c.id);
end $$;
