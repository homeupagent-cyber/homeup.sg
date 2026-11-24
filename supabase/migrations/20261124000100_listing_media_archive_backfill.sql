-- Backfill listing_media_archive from every current `listings` row,
-- including archived rows the purge has not deleted yet.
--
-- Run AFTER 20261124000000_listing_media_archive.sql.
--
-- Safe to run more than once: it uses the same upsert as the trigger, which
-- only fills gaps and appends new photo paths. It never removes anything.
--
-- Unlike the trigger, this calls the upsert with no error handler, so if
-- anything in the archive logic is wrong it fails loudly here (and the whole
-- file rolls back) instead of quietly logging warnings during syncs.

begin;

select public.listing_media_archive_upsert(l, l.deleted_at is not null, false)
from public.listings l;

commit;

-- Check: archive_rows should be >= listing_rows, and
-- listings_missing_from_archive should be 0.
select
  (select count(*) from public.listings)                                   as listing_rows,
  (select count(*) from public.listings where deleted_at is not null)      as archived_listing_rows,
  (select count(*) from public.listing_media_archive)                      as archive_rows,
  (select count(*) from public.listing_media_archive where delisted_at is not null) as archive_delisted,
  (select count(*) from public.listings l
     where not exists (select 1 from public.listing_media_archive a where a.listing_id = l.id))
                                                                           as listings_missing_from_archive,
  (select count(*) from public.listing_media_archive where cardinality(photo_paths) = 0)
                                                                           as archive_rows_without_photos;
