-- ============================================================
-- 01_schema.sql
-- Run this FIRST in Supabase SQL Editor.
-- Creates 3 tables matching your uploaded CSVs column-for-column.
-- ============================================================

-- Clean slate (safe to re-run while you're iterating tonight)
drop table if exists ledger_entries cascade;
drop table if exists bank_settlement_records cascade;
drop table if exists gateway_logs cascade;

-- 1) GATEWAY LOGS — the payment attempt, as seen by the payment gateway
create table gateway_logs (
  gateway_transaction_id text primary key,   -- e.g. pay_Gz8x1001
  order_id               text,
  amount_in_cents        integer,            -- this is actually PAISE (INR cents)
  currency               text,
  status                 text,               -- 'captured' | 'failed'
  method                 text,               -- card | upi | netbanking | wallet
  email                  text,
  contact                text,
  error_code             text,               -- null unless status = 'failed'
  error_description      text,
  created_at_timestamp   bigint              -- unix epoch seconds
);

-- 2) BANK SETTLEMENT RECORDS — what the bank says happened to the money
-- NOTE: settled_at comes as text "DD-MM-YYYY HH:MI" from your CSV.
-- We store it as TEXT first, then convert to a real timestamp in step 02.
create table bank_settlement_records (
  settlement_id            text primary key,   -- e.g. set_Bnk9x2001
  gateway_transaction_id   text references gateway_logs(gateway_transaction_id),
  net_settled_amount       integer,
  bank_reference_number    text,
  settlement_status        text,               -- 'processed' | 'failed'
  settled_at_raw           text,               -- raw "DD-MM-YYYY HH:MI"
  settled_at               timestamp           -- filled in by 02_import step
);

-- 3) LEDGER ENTRIES — the merchant's internal books
create table ledger_entries (
  ledger_entry_id         text primary key,     -- e.g. led_Lgr1x3001
  gateway_transaction_id  text references gateway_logs(gateway_transaction_id),
  account_type            text,
  entry_type               text,                -- 'credit'
  amount                   integer,
  booked_at_raw            text,                -- raw "DD-MM-YYYY HH:MI"
  booked_at                timestamp
);

-- Helpful indexes for the agent's lookups (by order_id, email, date)
create index idx_gateway_order_id on gateway_logs(order_id);
create index idx_gateway_email on gateway_logs(email);
create index idx_gateway_created on gateway_logs(created_at_timestamp);
create index idx_bank_gw_id on bank_settlement_records(gateway_transaction_id);
create index idx_ledger_gw_id on ledger_entries(gateway_transaction_id);
