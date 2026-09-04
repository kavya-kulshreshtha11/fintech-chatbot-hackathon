-- ============================================================
-- 03_trace_function.sql
-- This is the brain of the agent. It is PURE SQL / deterministic —
-- the LLM never decides "what happened", it only explains what this
-- function already figured out. This is what makes the agent honest
-- instead of hallucinating a settlement status.
-- ============================================================

create or replace function trace_transaction(p_id text)
returns jsonb
language plpgsql
as $$
declare
  v_gateway   gateway_logs%rowtype;
  v_bank      bank_settlement_records%rowtype;
  v_ledger    ledger_entries%rowtype;
  v_status    text;
  v_reason    text;
  v_result    jsonb;
begin
  -- Step 1: find the gateway record. Accept either the gateway txn id
  -- OR the merchant's order_id, since support agents usually only have one.
  select * into v_gateway
  from gateway_logs
  where gateway_transaction_id = p_id or order_id = p_id
  limit 1;

  if not found then
    return jsonb_build_object(
      'found', false,
      'status_code', 'NOT_FOUND',
      'reason', 'No transaction matching this ID exists in gateway_logs. Double-check the transaction ID or order ID.'
    );
  end if;

  -- Step 2: gateway itself failed -> settlement was never possible
  if v_gateway.status = 'failed' then
    v_status := 'FAILED_AT_GATEWAY';
    v_reason := 'Payment was declined by the gateway before it ever reached settlement. Error: '
                || coalesce(v_gateway.error_code, 'unknown') || ' — '
                || coalesce(v_gateway.error_description, 'no description provided.');
    v_result := jsonb_build_object(
      'found', true, 'status_code', v_status, 'reason', v_reason,
      'gateway', to_jsonb(v_gateway), 'bank', null, 'ledger', null
    );
    return v_result;
  end if;

  -- Step 3: gateway captured -> look for a bank settlement record
  select * into v_bank
  from bank_settlement_records
  where gateway_transaction_id = v_gateway.gateway_transaction_id
  limit 1;

  if not found then
    v_status := 'PENDING_BANK_SETTLEMENT';
    v_reason := 'Payment was successfully captured by the gateway, but no settlement record from the bank exists yet. '
                || 'This usually means it is still inside the bank''s settlement batch cycle (commonly T+1/T+2), '
                || 'or the batch has not run yet. Not necessarily an error — but flag if older than 2 days.';
    v_result := jsonb_build_object(
      'found', true, 'status_code', v_status, 'reason', v_reason,
      'gateway', to_jsonb(v_gateway), 'bank', null, 'ledger', null
    );
    return v_result;
  end if;

  -- Step 4: bank settlement failed
  if v_bank.settlement_status = 'failed' then
    v_status := 'BANK_SETTLEMENT_FAILED';
    v_reason := 'The gateway captured the payment, but the bank rejected/failed the settlement leg. '
                || 'The mock data does not include a bank-side failure reason — this needs manual review '
                || 'with the banking partner. Do not assume a cause that is not in the data.';
    v_result := jsonb_build_object(
      'found', true, 'status_code', v_status, 'reason', v_reason,
      'gateway', to_jsonb(v_gateway), 'bank', to_jsonb(v_bank), 'ledger', null
    );
    return v_result;
  end if;

  -- Step 5: bank processed -> look for the ledger entry
  select * into v_ledger
  from ledger_entries
  where gateway_transaction_id = v_gateway.gateway_transaction_id
  limit 1;

  if not found then
    v_status := 'LEDGER_RECONCILIATION_PENDING';
    v_reason := 'The bank has processed and settled the funds, but this has not yet been booked into the '
                || 'internal ledger. This is a reconciliation gap — money has moved but the books have not '
                || 'caught up. Usually resolved by the next reconciliation job run.';
    v_result := jsonb_build_object(
      'found', true, 'status_code', v_status, 'reason', v_reason,
      'gateway', to_jsonb(v_gateway), 'bank', to_jsonb(v_bank), 'ledger', null
    );
    return v_result;
  end if;

  -- Step 6: everything lines up
  v_status := 'SETTLED';
  v_reason := 'Payment was captured by the gateway, settled by the bank, and booked in the ledger. No exceptions found.';
  v_result := jsonb_build_object(
    'found', true, 'status_code', v_status, 'reason', v_reason,
    'gateway', to_jsonb(v_gateway), 'bank', to_jsonb(v_bank), 'ledger', to_jsonb(v_ledger)
  );
  return v_result;
end;
$$;

-- ------------------------------------------------------------
-- A companion function: full exception list across ALL transactions.
-- This powers the "honest exception list" requirement from the brief —
-- a dashboard-style query of everything that isn't cleanly SETTLED.
-- ------------------------------------------------------------
create or replace function list_exceptions()
returns table(gateway_transaction_id text, status_code text, reason text)
language plpgsql
as $$
declare
  r record;
  t jsonb;
begin
  for r in select gl.gateway_transaction_id from gateway_logs gl loop
    t := trace_transaction(r.gateway_transaction_id);
    if t->>'status_code' <> 'SETTLED' then
      gateway_transaction_id := r.gateway_transaction_id;
      status_code := t->>'status_code';
      reason := t->>'reason';
      return next;
    end if;
  end loop;
end;
$$;

-- ------------------------------------------------------------
-- Search helper so the agent can accept a date, email, or partial ID
-- ------------------------------------------------------------
create or replace function search_transactions(p_query text)
returns table(gateway_transaction_id text, order_id text, email text, status text, created_at timestamptz)
language sql
as $$
  select gateway_transaction_id, order_id, email, status,
         to_timestamp(created_at_timestamp)
  from gateway_logs
  where gateway_transaction_id ilike '%' || p_query || '%'
     or order_id ilike '%' || p_query || '%'
     or email ilike '%' || p_query || '%'
  order by created_at_timestamp desc
  limit 20;
$$;

-- ------------------------------------------------------------
-- Test it right now (should return one of the 6 status codes above)
-- ------------------------------------------------------------
select trace_transaction('pay_Gz8x1000');   -- captured, no bank record yet -> PENDING_BANK_SETTLEMENT
select trace_transaction('pay_Gz8x1052');   -- gateway failed -> FAILED_AT_GATEWAY
select trace_transaction('pay_Gz8x1042');   -- bank failed -> BANK_SETTLEMENT_FAILED
select trace_transaction('pay_Gz8x1038');   -- ledger missing -> LEDGER_RECONCILIATION_PENDING
select trace_transaction('pay_Gz8x1001');   -- clean -> SETTLED
select * from list_exceptions();
