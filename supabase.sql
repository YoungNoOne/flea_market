create table if not exists wishes (
  id uuid primary key default gen_random_uuid(),
  item_name text not null,
  budget text,
  description text,
  nickname text,
  contact text,
  is_public boolean default true,
  created_at timestamp with time zone default now()
);

alter table wishes enable row level security;

drop policy if exists "Anyone can submit wishes" on wishes;
drop policy if exists "Anyone can read public wishes" on wishes;
drop view if exists public_wishes;

create policy "Anyone can submit wishes"
on wishes
for insert
to anon
with check (true);

grant insert on wishes to anon;
revoke select on wishes from anon;

create view public_wishes as
select
  id,
  item_name,
  budget,
  description,
  nickname,
  is_public,
  created_at
from wishes
where is_public = true;

grant select on public_wishes to anon;
