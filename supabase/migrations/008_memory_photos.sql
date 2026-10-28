-- Tìshòk Phase 4f: private memory photos. Paste into Supabase > SQL Editor > Run.
alter table public.memories add column photo_path text
  check (photo_path is null or char_length(photo_path) <= 200);

-- A photo path must live in the memory owner's own folder (stops pointing at someone else's file).
create function public.memories_photo_guard() returns trigger language plpgsql as $$
begin
  if new.photo_path is not null and split_part(new.photo_path, '/', 1) <> new.owner_id::text then
    raise exception 'Invalid photo path';
  end if;
  return new;
end $$;
create trigger memories_z_photo_guard before insert or update on public.memories
  for each row execute function public.memories_photo_guard();

-- Private bucket: JPEG, PNG or WebP only, 3 MB max each.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('memory-photos', 'memory-photos', false, 3145728, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "upload own photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'memory-photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- You can read your own files, and files attached to a memory you are allowed to see
-- (the memories table's own privacy rules decide that).
create policy "read photos of visible memories" on storage.objects for select to authenticated
  using (bucket_id = 'memory-photos' and (
    (storage.foldername(name))[1] = auth.uid()::text
    or exists (select 1 from public.memories m where m.photo_path = storage.objects.name)
  ));

create policy "delete own photos" on storage.objects for delete to authenticated
  using (bucket_id = 'memory-photos' and (storage.foldername(name))[1] = auth.uid()::text);
