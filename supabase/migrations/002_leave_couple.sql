-- Tìshòk Phase 3b: safe disconnect. Paste into Supabase > SQL Editor > Run.
-- Removes only the couple link. It never deletes anyone's profile or personal content.
create function public.leave_couple() returns void
language plpgsql security definer set search_path = public as $$
declare cid uuid;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  cid := public.my_couple_id();
  if cid is null then return; end if;
  -- Unused invitation codes die with the link, so nobody can join later using an old code.
  delete from public.invitations where couple_id = cid and accepted_at is null;
  delete from public.couple_members where couple_id = cid and user_id = auth.uid();
  delete from public.couples c where c.id = cid
    and not exists (select 1 from public.couple_members m where m.couple_id = c.id);
end $$;

revoke execute on function public.leave_couple() from public, anon;
grant execute on function public.leave_couple() to authenticated;
