-- Optional Supabase schema for saved reports

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  mode text not null,
  input_text text not null,
  input_url text,
  detected_story text,
  main_party text,
  other_party text,
  report_json jsonb not null,
  source_strictness text default 'balanced'
);

create table if not exists report_sources (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references reports(id) on delete cascade,
  created_at timestamptz not null default now(),
  title text,
  url text,
  source_type text,
  strength text,
  note text
);
