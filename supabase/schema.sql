-- ============================================================
-- UZLENS — Supabase schema (Stage 3: auth, profiles, history)
-- ============================================================
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New
-- query), or via `supabase db push` / migrations. Statements are written
-- to be safe to re-run.

-- ------------------------------------------------------------
-- 1. profiles
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles: select own" on public.profiles;
create policy "Profiles: select own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Profiles: insert own" on public.profiles;
create policy "Profiles: insert own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Profiles: delete own" on public.profiles;
create policy "Profiles: delete own"
  on public.profiles for delete
  using (auth.uid() = id);

-- Auto-create a profile row whenever someone signs up, so the app never
-- has to insert into `profiles` itself.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------
-- 2. analyses  (Text Analyzer results)
-- ------------------------------------------------------------
create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  original_text text not null,
  normalized_text text,
  language text,
  script text,
  word_count integer not null default 0,
  sentence_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists analyses_user_id_created_at_idx
  on public.analyses (user_id, created_at desc);

alter table public.analyses enable row level security;

drop policy if exists "Analyses: select own" on public.analyses;
create policy "Analyses: select own"
  on public.analyses for select
  using (auth.uid() = user_id);

drop policy if exists "Analyses: insert own" on public.analyses;
create policy "Analyses: insert own"
  on public.analyses for insert
  with check (auth.uid() = user_id);

drop policy if exists "Analyses: delete own" on public.analyses;
create policy "Analyses: delete own"
  on public.analyses for delete
  using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 3. ocr_documents  (OCR results)
-- ------------------------------------------------------------
create table if not exists public.ocr_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  filename text,
  original_text text,
  cleaned_text text,
  confidence numeric,
  created_at timestamptz not null default now()
);

create index if not exists ocr_documents_user_id_created_at_idx
  on public.ocr_documents (user_id, created_at desc);

alter table public.ocr_documents enable row level security;

drop policy if exists "OCR documents: select own" on public.ocr_documents;
create policy "OCR documents: select own"
  on public.ocr_documents for select
  using (auth.uid() = user_id);

drop policy if exists "OCR documents: insert own" on public.ocr_documents;
create policy "OCR documents: insert own"
  on public.ocr_documents for insert
  with check (auth.uid() = user_id);

drop policy if exists "OCR documents: delete own" on public.ocr_documents;
create policy "OCR documents: delete own"
  on public.ocr_documents for delete
  using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 4. word_search_history  (So'z pasporti searches)
-- ------------------------------------------------------------
create table if not exists public.word_search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  word text not null,
  created_at timestamptz not null default now()
);

create index if not exists word_search_history_user_id_created_at_idx
  on public.word_search_history (user_id, created_at desc);

alter table public.word_search_history enable row level security;

drop policy if exists "Word history: select own" on public.word_search_history;
create policy "Word history: select own"
  on public.word_search_history for select
  using (auth.uid() = user_id);

drop policy if exists "Word history: insert own" on public.word_search_history;
create policy "Word history: insert own"
  on public.word_search_history for insert
  with check (auth.uid() = user_id);

drop policy if exists "Word history: delete own" on public.word_search_history;
create policy "Word history: delete own"
  on public.word_search_history for delete
  using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- Notes
-- ------------------------------------------------------------
-- * The Uzbek dictionary powering "So'z pasporti" / "Lug'at" is bundled as
--   static data in src/lib/data/dictionary.ts. It is not stored in
--   Supabase, so it needs no table or policy here — it ships publicly with
--   the client bundle already.
-- * Only the anon key is ever used from the browser (see src/lib/supabase.ts).
--   The service_role key must never be added to this project's env vars.
-- * No UPDATE policy is defined anywhere on purpose — history rows are
--   write-once/delete-only from the client, matching the app's spec.
