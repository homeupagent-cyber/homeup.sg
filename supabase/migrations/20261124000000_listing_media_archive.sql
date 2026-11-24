-- Listing media archive: one permanent row per listing ever seen.
--
-- Why: the sync hard-deletes a `listings` row 7 days after it leaves
-- PropertyGuru. The photo files stay in Storage, but nothing links the folder
-- to an address any more. This table keeps that link forever.
--
-- A trigger on `listings` fills it, so the sync kit, the website's sync
-- buttons and manual admin edits are all covered without a kit rebuild.
--
-- Nothing in the app deletes from this table. Only server code using the
-- service role key reads or writes it (RLS on, no policies).
--
-- Run this file first, then 20261124000100_listing_media_archive_backfill.sql.

begin;

-- ---------------------------------------------------------------------------
-- 1. Table
-- ---------------------------------------------------------------------------

create table if not exists public.listing_media_archive (
  -- Link. Plain uuid with no foreign key, so deleting a listing never
  -- deletes its archive row. For Part E folders this is the folder name.
  listing_id            uuid primary key,
  source_pg_listing_id  text,
  source_pg_url         text,
  slug                  text,

  -- Label and details (latest values from `listings`; never blanked)
  title                 text,
  address_line_1        text,
  flat_type             text,
  listed_as             text,
  rooms                 integer,
  bathrooms             integer,
  area_sqft             numeric,
  tenure                integer,
  is_freehold           boolean,
  condition             text,
  last_asking_price     numeric,

  -- Agent, looked up from pg_listing_sources. Never overwritten with empty.
  agent_slug            text,

  -- Storage paths in `listing-images`, featured photo first.
  -- New paths are appended; old ones are never removed.
  photo_paths           text[] not null default '{}',

  -- Dates
  first_seen_at         timestamptz not null default now(),
  delisted_at           timestamptz,
  relisted_at           timestamptz,
  record_deleted_at     timestamptz,
  updated_at            timestamptz not null default now(),

  -- Sold details (Part D). Edited by admins only, never by the trigger.
  sold_confirmed        boolean not null default false,
  sold_date             date,
  sold_price            numeric,
  price_source          text,
  storey_range          text,
  seller_consent        text not null default 'unknown',
  consent_date          date,
  consent_note          text,
  marketing_notes       text,

  -- Originals (Part B): paths in the private `listing-originals` bucket.
  original_paths        text[] not null default '{}',

  -- Recovery (Part E)
  labelled_by_hand      boolean not null default false,
  label_notes           text,
  hidden                boolean not null default false,

  constraint listing_media_archive_price_source_check
    check (price_source is null or price_source in ('hdb_resale', 'ura_caveat', 'agent_reported')),
  constraint listing_media_archive_seller_consent_check
    check (seller_consent in ('unknown', 'yes', 'no')),
  constraint listing_media_archive_sold_needs_date
    check (not sold_confirmed or sold_date is not null),
  constraint listing_media_archive_price_needs_source
    check (sold_price is null or price_source is not null),
  constraint listing_media_archive_sold_price_positive
    check (sold_price is null or sold_price > 0)
);

create index if not exists listing_media_archive_delisted_at_idx
  on public.listing_media_archive (delisted_at desc nulls last);

create index if not exists listing_media_archive_source_pg_listing_id_idx
  on public.listing_media_archive (source_pg_listing_id);

-- RLS on with no policies: anon and logged-in users get nothing.
alter table public.listing_media_archive enable row level security;
revoke all on table public.listing_media_archive from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. Helpers
-- ---------------------------------------------------------------------------

-- Public URL -> storage path.
-- ".../storage/v1/object/public/listing-images/listings/<id>/x.jpg?t=1"
--   -> "listings/<id>/x.jpg"
-- Anything not in the bucket (an outside URL typed by hand) is kept as is,
-- so no photo reference is ever lost. A value that is already a path
-- passes through unchanged.
create or replace function public.listing_media_archive_to_path(url text)
returns text
language sql
immutable
set search_path = public, pg_temp
as $$
  select case
    when url is null or btrim(url) = '' then null
    when position('/listing-images/' in url) > 0 then
      split_part(
        substr(url, position('/listing-images/' in url) + length('/listing-images/')),
        '?', 1
      )
    else btrim(url)
  end
$$;

-- Merge two photo lists: keep existing order, append new paths, drop
-- blanks and duplicates. Never removes a path that was there before.
create or replace function public.listing_media_archive_merge_paths(existing text[], incoming text[])
returns text[]
language sql
immutable
set search_path = public, pg_temp
as $$
  select coalesce(array_agg(s.path order by s.first_ord), '{}'::text[])
  from (
    select public.listing_media_archive_to_path(t.raw) as path, min(t.ord) as first_ord
    from unnest(coalesce(existing, '{}'::text[]) || coalesce(incoming, '{}'::text[]))
      with ordinality as t(raw, ord)
    where t.raw is not null and btrim(t.raw) <> ''
    group by 1
  ) s
$$;

-- Upsert one archive row from a `listings` row.
--   p_became_delisted: deleted_at just went from empty to a date
--   p_became_relisted: deleted_at just went from a date back to empty
create or replace function public.listing_media_archive_upsert(
  l public.listings,
  p_became_delisted boolean,
  p_became_relisted boolean
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_agent text;
  v_paths text[];
begin
  if l.source_pg_listing_id is not null then
    select nullif(btrim(s.agent_slug), '')
      into v_agent
      from public.pg_listing_sources s
     where s.pg_listing_id = l.source_pg_listing_id
     limit 1;
  end if;

  v_paths := public.listing_media_archive_merge_paths(
    '{}'::text[],
    array[l.featured_image_url] || coalesce(l.image_urls, '{}'::text[])
  );

  insert into public.listing_media_archive as a (
    listing_id, source_pg_listing_id, source_pg_url, slug,
    title, address_line_1, flat_type, listed_as, rooms, bathrooms,
    area_sqft, tenure, is_freehold, condition, last_asking_price,
    agent_slug, photo_paths,
    first_seen_at, delisted_at, relisted_at, updated_at
  ) values (
    l.id, l.source_pg_listing_id, l.source_pg_url, l.slug,
    l.title, l.address_line_1, l.flat_type, l.listed_as, l.rooms, l.bathrooms,
    l.area_sqft, l.tenure, l.is_freehold, l.condition, l.price,
    v_agent, v_paths,
    coalesce(l.created_at, now()),
    l.deleted_at,
    case when p_became_relisted then now() end,
    now()
  )
  on conflict (listing_id) do update set
    source_pg_listing_id = coalesce(nullif(btrim(excluded.source_pg_listing_id), ''), a.source_pg_listing_id),
    source_pg_url        = coalesce(nullif(btrim(excluded.source_pg_url), ''), a.source_pg_url),
    slug                 = coalesce(nullif(btrim(excluded.slug), ''), a.slug),
    title                = coalesce(nullif(btrim(excluded.title), ''), a.title),
    address_line_1       = coalesce(nullif(btrim(excluded.address_line_1), ''), a.address_line_1),
    flat_type            = coalesce(excluded.flat_type, a.flat_type),
    listed_as            = coalesce(excluded.listed_as, a.listed_as),
    rooms                = coalesce(excluded.rooms, a.rooms),
    bathrooms            = coalesce(excluded.bathrooms, a.bathrooms),
    area_sqft            = coalesce(excluded.area_sqft, a.area_sqft),
    tenure               = coalesce(excluded.tenure, a.tenure),
    is_freehold          = coalesce(excluded.is_freehold, a.is_freehold),
    condition            = coalesce(excluded.condition, a.condition),
    last_asking_price    = coalesce(excluded.last_asking_price, a.last_asking_price),
    agent_slug           = coalesce(excluded.agent_slug, a.agent_slug),
    photo_paths          = public.listing_media_archive_merge_paths(a.photo_paths, excluded.photo_paths),
    delisted_at          = case when p_became_delisted then excluded.delisted_at else a.delisted_at end,
    relisted_at          = case when p_became_relisted then now() else a.relisted_at end,
    updated_at           = now();
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. Trigger functions. Both swallow any error as a WARNING, so a fault in
--    the archive can never block a listings insert, update or delete.
-- ---------------------------------------------------------------------------

create or replace function public.listing_media_archive_on_write()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  begin
    if tg_op = 'INSERT' then
      perform public.listing_media_archive_upsert(new, new.deleted_at is not null, false);
    else
      perform public.listing_media_archive_upsert(
        new,
        old.deleted_at is null and new.deleted_at is not null,
        old.deleted_at is not null and new.deleted_at is null
      );
    end if;
  exception when others then
    raise warning 'listing_media_archive: could not archive listing % on %: % (%)',
      new.id, tg_op, sqlerrm, sqlstate;
  end;
  return null; -- AFTER trigger: return value is ignored
end;
$$;

create or replace function public.listing_media_archive_on_delete()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  begin
    -- Make sure the row exists with the final details, then stamp it.
    perform public.listing_media_archive_upsert(old, false, false);
    update public.listing_media_archive
       set record_deleted_at = now(),
           updated_at = now()
     where listing_id = old.id;
  exception when others then
    raise warning 'listing_media_archive: could not mark listing % as deleted: % (%)',
      old.id, sqlerrm, sqlstate;
  end;
  return old; -- BEFORE DELETE: returning OLD lets the delete go through
end;
$$;

-- Nobody but the database owner may call these directly through the API.
revoke execute on function public.listing_media_archive_upsert(public.listings, boolean, boolean)
  from public, anon, authenticated;
revoke execute on function public.listing_media_archive_on_write() from public, anon, authenticated;
revoke execute on function public.listing_media_archive_on_delete() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. Triggers
-- ---------------------------------------------------------------------------

drop trigger if exists listing_media_archive_write on public.listings;
create trigger listing_media_archive_write
  after insert or update on public.listings
  for each row
  execute function public.listing_media_archive_on_write();

drop trigger if exists listing_media_archive_delete on public.listings;
create trigger listing_media_archive_delete
  before delete on public.listings
  for each row
  execute function public.listing_media_archive_on_delete();

commit;
