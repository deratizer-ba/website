-- Kontaktné odoslania z formulárov (homepage, /kontakt)
-- Spusti v Supabase SQL Editore

create table contact_submissions (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null,
  phone text,
  message text not null,
  category_id uuid references categories(id) on delete set null,
  subcategory_id uuid references subcategories(id) on delete set null,
  category_label text,
  subcategory_label text,
  source text not null default 'contact_page',
  created_at timestamptz default now(),
  constraint contact_submissions_source_check check (
    source in ('homepage', 'contact_page')
  )
);

alter table contact_submissions enable row level security;

create policy "Public insert contact_submissions"
  on contact_submissions for insert
  with check (true);

create policy "Admin read contact_submissions"
  on contact_submissions for select
  to authenticated
  using (true);

create index idx_contact_submissions_created_at on contact_submissions(created_at desc);
create index idx_contact_submissions_source on contact_submissions(source);
