create table if not exists scores (
  id uuid default gen_random_uuid() primary key,
  player_name text not null,
  score integer not null,
  gems integer default 0,
  level integer default 1,
  time_seconds integer default 0,
  created_at timestamptz default now()
);

alter table scores enable row level security;

create policy "Anyone can read scores"
  on scores for select using (true);

create policy "Anyone can insert scores"
  on scores for insert with check (true);
