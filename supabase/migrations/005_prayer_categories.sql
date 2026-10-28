-- Tìshòk Phase 4c: more prayer categories for the daily Prayer Focus. Paste into SQL Editor > Run.
alter table public.prayers drop constraint if exists prayers_category_check;
alter table public.prayers add constraint prayers_category_check
  check (category in ('general','relationship','family','gratitude','guidance','work','health','growth'));
