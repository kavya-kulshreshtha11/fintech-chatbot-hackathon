-- ============================================================
-- 02_import_and_fix_dates.sql
-- Run this AFTER you've imported the 3 CSVs (see README step 3).
-- Your CSV dates are "DD-MM-YYYY HH:MI" (e.g. 02-09-2026 12:00).
-- Supabase's importer will have put settled_at / booked_at into the
-- *_raw text columns if you mapped them correctly. This step converts
-- those text values into real timestamps so we can do date filtering
-- and "days late" math later.
-- ============================================================

update bank_settlement_records
set settled_at = to_timestamp(settled_at_raw, 'DD-MM-YYYY HH24:MI')
where settled_at_raw is not null;

update ledger_entries
set booked_at = to_timestamp(booked_at_raw, 'DD-MM-YYYY HH24:MI')
where booked_at_raw is not null;

-- Quick sanity checks — run these and eyeball the counts against your CSVs
select count(*) as gateway_rows from gateway_logs;
select count(*) as bank_rows from bank_settlement_records;
select count(*) as ledger_rows from ledger_entries;

select status, count(*) from gateway_logs group by status;
select settlement_status, count(*) from bank_settlement_records group by settlement_status;
