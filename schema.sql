-- Supabase SQL Editor ichida bir marta ishga tushiring.
create extension if not exists pgcrypto;

create table if not exists public.users (
  telegram_id text primary key,
  first_name text not null default '',
  last_name text not null default '',
  username text not null default '',
  role text not null default 'student' check (role in ('admin','student')),
  status text not null default 'pending' check (status in ('pending','approved','blocked')),
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  track text not null check (track in ('ai','it')),
  created_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  description text not null default '',
  track text not null check (track in ('ai','it')),
  storage_path text not null,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;

-- Brauzer uchun anon ruxsat berilmaydi. Barcha amallar Vercel API orqali,
-- faqat serverdagi service-role kaliti bilan bajariladi.
revoke all on public.users from anon, authenticated;
revoke all on public.courses from anon, authenticated;
revoke all on public.lessons from anon, authenticated;

-- Storage > New bucket: academy-videos, Private (public emas).
