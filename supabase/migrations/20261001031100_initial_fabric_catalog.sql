-- Editorial data defaults to draft. No automatic rankings or clinical claims.
create schema if not exists private;
grant usage on schema private to anon, authenticated;
create or replace function private.is_editor() returns boolean language sql stable security invoker set search_path = '' as $$
 select coalesce((auth.jwt()->'app_metadata'->>'role') in ('editor','admin'),false);
$$;
create or replace function private.is_member() returns boolean language sql stable security invoker set search_path = '' as $$
 select auth.uid() is not null and not coalesce((auth.jwt()->>'is_anonymous')::boolean,false);
$$;
revoke all on function private.is_editor(), private.is_member() from public;
grant execute on function private.is_editor(), private.is_member() to anon, authenticated;

create table public.evidence (
 id text primary key, title text not null, url text not null check(url ~ '^https://'),
 kind text not null, publication text not null, finding text not null, limitation text not null,
 access text not null, checked_at date not null, status text not null default 'draft' check(status in ('draft','published'))
);
create table public.fabrics (
 id text primary key, name text not null, definition text not null, source_ids text[] not null default '{}',
 summary text not null, limitation text not null, image text, image_credit text not null default '',
 image_url text not null default '', image_rights text not null default 'pending' check(image_rights in ('pending','cleared')),
 checked_at date not null, status text not null default 'draft' check(status in ('draft','published'))
);
create table public.products (
 id text primary key, brand text not null, title text not null, category text not null,
 material text not null default '', size text not null default '', country text not null default '',
 price text not null default '', kc text not null default '', stock text not null default '', note text not null default '',
 url text not null check(url ~ '^https://'), image text, image_rights text not null default 'pending' check(image_rights in ('pending','cleared')),
 fabric_ids text[] not null default '{}', checked_at date not null, verification_status text not null,
 status text not null default 'draft' check(status in ('draft','published')),
 search_document tsvector generated always as (to_tsvector('simple',coalesce(title,'') || ' ' || coalesce(brand,'') || ' ' || coalesce(material,''))) stored
);
create index products_search_idx on public.products using gin(search_document);
create index products_fabric_idx on public.products using gin(fabric_ids);
create index products_category_idx on public.products(category) where status='published';
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 nickname text not null check(char_length(nickname) between 2 and 20)
);
create table public.posts (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 nickname text not null check(char_length(nickname) between 2 and 20),
 title text not null check(char_length(title) between 3 and 120), body text not null check(char_length(body) between 10 and 10000),
 category text not null check(category in ('아기옷','피부 고민','일상')),
 status text not null default 'published' check(status in ('draft','published','hidden')), created_at timestamptz not null default now()
);
create index posts_published_idx on public.posts(created_at desc) where status='published';
create index posts_user_idx on public.posts(user_id);
create table public.comments (
 id uuid primary key default gen_random_uuid(), post_id uuid not null references public.posts(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade, nickname text not null check(char_length(nickname) between 2 and 20),
 body text not null check(char_length(body) between 2 and 2000),
 status text not null default 'published' check(status in ('published','hidden')), created_at timestamptz not null default now()
);
create index comments_post_idx on public.comments(post_id,created_at);
create index comments_user_idx on public.comments(user_id);
create table public.reports (
 id uuid primary key default gen_random_uuid(), post_id uuid not null references public.posts(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade, reason text not null check(char_length(reason) between 5 and 500),
 status text not null default 'open' check(status in ('open','resolved')), created_at timestamptz not null default now(),
 unique(post_id,user_id)
);
create index reports_user_idx on public.reports(user_id);
create index reports_open_idx on public.reports(created_at) where status='open';

alter table public.evidence enable row level security;
alter table public.fabrics enable row level security;
alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.reports enable row level security;
grant select on public.evidence,public.fabrics,public.products,public.posts,public.comments to anon,authenticated;
grant insert,update,delete on public.evidence,public.fabrics,public.products to authenticated;
grant select,insert,update on public.profiles,public.reports to authenticated;
grant insert(id,user_id,nickname,title,body,category,status) on public.posts to authenticated;
grant update(title,body,category,status) on public.posts to authenticated;
grant insert(id,post_id,user_id,nickname,body,status) on public.comments to authenticated;
grant update(body,status) on public.comments to authenticated;
create policy evidence_read on public.evidence for select to anon,authenticated using(status='published' or (select private.is_editor()));
create policy evidence_editor on public.evidence for all to authenticated using((select private.is_editor())) with check((select private.is_editor()));
create policy fabrics_read on public.fabrics for select to anon,authenticated using(status='published' or (select private.is_editor()));
create policy fabrics_editor on public.fabrics for all to authenticated using((select private.is_editor())) with check((select private.is_editor()));
create policy products_read on public.products for select to anon,authenticated using(status='published' or (select private.is_editor()));
create policy products_editor on public.products for all to authenticated using((select private.is_editor())) with check((select private.is_editor()));
create policy profiles_read on public.profiles for select to authenticated using(id=(select auth.uid()));
create policy profiles_insert on public.profiles for insert to authenticated with check(id=(select auth.uid()) and (select private.is_member()));
create policy profiles_update on public.profiles for update to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()) and (select private.is_member()));
create policy posts_read on public.posts for select to anon,authenticated using(status='published' or (user_id=(select auth.uid()) and status='draft') or (select private.is_editor()));
create policy posts_insert on public.posts for insert to authenticated with check(user_id=(select auth.uid()) and (select private.is_member()) and status in ('draft','published'));
create policy posts_update on public.posts for update to authenticated using((user_id=(select auth.uid()) and status!='hidden') or (select private.is_editor())) with check((user_id=(select auth.uid()) and status in ('draft','published')) or (select private.is_editor()));
create policy comments_read on public.comments for select to anon,authenticated using((status='published' and exists(select 1 from public.posts p where p.id=post_id and p.status='published')) or (select private.is_editor()));
create policy comments_insert on public.comments for insert to authenticated with check(user_id=(select auth.uid()) and (select private.is_member()) and status='published' and exists(select 1 from public.posts p where p.id=post_id and p.status='published'));
create policy comments_update on public.comments for update to authenticated using((user_id=(select auth.uid()) and status='published') or (select private.is_editor())) with check((user_id=(select auth.uid()) and status='published' and exists(select 1 from public.posts p where p.id=post_id and p.status='published')) or (select private.is_editor()));
create policy reports_read on public.reports for select to authenticated using(user_id=(select auth.uid()) or (select private.is_editor()));
create policy reports_insert on public.reports for insert to authenticated with check(user_id=(select auth.uid()) and (select private.is_member()) and status='open' and exists(select 1 from public.posts p where p.id=post_id and p.status='published'));
create policy reports_update on public.reports for update to authenticated using((select private.is_editor())) with check((select private.is_editor()));

-- Korean literal substring matching supplements simple full-text tokenization.
-- Invoker security preserves RLS. No interpolated SQL or service-role access.
create function public.search_products(query text default '', fabric text default null, product_category text default null)
returns setof public.products language sql stable security invoker set search_path = '' as $$
 select p.* from public.products p
 where p.status='published'
 and (fabric is null or fabric = any(p.fabric_ids))
 and (product_category is null or p.category = product_category)
 and (trim(query) = '' or p.search_document @@ websearch_to_tsquery('simple',query)
 or position(lower(trim(query)) in lower(p.title || ' ' || p.brand || ' ' || p.material)) > 0)
 order by p.id limit 100;
$$;
revoke all on function public.search_products(text,text,text) from public;
grant execute on function public.search_products(text,text,text) to anon,authenticated;
