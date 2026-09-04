# Settlement Q&A Agent — Build Guide (one night, zero-to-demo)

Your 3 CSVs are already internally consistent and even contain realistic exceptions:

| File | Rows | What's in it |
|---|---|---|
| `gateway_logs.csv` | 100 | 97 captured, 3 failed (with error codes) |
| `bank_settlement_records.csv` | 90 | 89 processed, 1 failed |
| `ledger_entries.csv` | 88 | all credits |

That gap between 97 → 90 → 88 is your exception logic, already built into the data:
- **11 payments** captured but never got a bank settlement record → "pending"
- **1 payment** the bank explicitly failed to settle
- **1 payment** the bank settled but it never hit the ledger → "reconciliation gap"
- **3 payments** failed at the gateway itself, before settlement was even possible

Everything below is built around these real cases so you can demo it live.

---

## Architecture (keep it this simple)

```
Browser (index.html)
   |  POST { query: "pay_Gz8x1000" }
   v
Supabase Edge Function (settlement-trace)
   |  1. calls Postgres RPC trace_transaction() -> deterministic facts
   |  2. sends those facts to Groq LLM -> plain-English rewrite only
   v
Supabase Postgres (gateway_logs, bank_settlement_records, ledger_entries)
```

**Key design decision:** the LLM never decides *what happened* — SQL does that,
deterministically, so it can't hallucinate a wrong settlement status. The LLM's only
job is turning verified facts into a friendly sentence. This is also exactly what "honest
exception list" means in the brief: some transaction states are hard-coded as
`needs_human_review = true`, not left to the model's judgment.

---

## Step 0 — Accounts you need (5 min)

1. **Supabase**: https://supabase.com → sign up free → "New Project". Note down:
   - Project URL (Settings → API)
   - `anon` public key (Settings → API)
   - `service_role` key (Settings → API — keep this secret, server-side only)
2. **Groq** (free, fast LLM API): https://console.groq.com → sign up → API Keys → create one.
   Groq is free and very fast (good for a live demo). Gemini's free tier works too if you'd
   rather use that — just swap the `explainWithLLM` fetch URL/payload in the edge function.
3. Install the Supabase CLI (needed to deploy the Edge Function):
   ```bash
   npm install -g supabase
   ```

---

## Step 1 — Create the database tables (10 min)

1. Open your Supabase project → **SQL Editor** → New query.
2. Paste the entire contents of **`01_schema.sql`** and run it.
   This creates `gateway_logs`, `bank_settlement_records`, `ledger_entries` with the
   exact columns your CSVs already have.

---

## Step 2 — Import your 3 CSVs (10 min)

1. Go to **Table Editor** in Supabase.
2. Click `gateway_logs` → **Insert** → **Import data from CSV** → upload `gateway_logs.csv`.
   Map columns 1:1 (they already match). `created_at_timestamp` should map to the bigint column.
3. Click `bank_settlement_records` → import `bank_settlement_records.csv`.
   ⚠️ Map the CSV's `settled_at` column to the table's **`settled_at_raw`** (text) column,
   NOT `settled_at` — the date format `DD-MM-YYYY HH:MI` will get misread by the timestamp
   parser otherwise (e.g. 02-09-2026 could be read as Feb 9 instead of Sep 2).
4. Click `ledger_entries` → import `ledger_entries.csv`, same trick: CSV's `booked_at` →
   table's `booked_at_raw`.
5. Back in **SQL Editor**, run **`02_import_and_fix_dates.sql`**. This converts the raw text
   dates into real timestamps and prints row counts so you can sanity-check against the
   table above (100 / 90 / 88).

---

## Step 3 — Create the tracing logic (10 min)

1. In **SQL Editor**, run **`03_trace_function.sql`**.
2. It ends with 6 test queries — run them and confirm you see:
   - `pay_Gz8x1000` → `PENDING_BANK_SETTLEMENT`
   - `pay_Gz8x1052` → `FAILED_AT_GATEWAY`
   - `pay_Gz8x1042` → `BANK_SETTLEMENT_FAILED`
   - `pay_Gz8x1038` → `LEDGER_RECONCILIATION_PENDING`
   - `pay_Gz8x1001` → `SETTLED`
   - `select * from list_exceptions();` → a table of every non-settled transaction —
     **this is your "honest exception list" deliverable straight out of the box.**

This function alone is already a working Q&A backend — you could stop here and just
return `reason` directly if you run out of time. Everything past this point is the
"plain English via LLM" polish layer.

---

## Step 4 — Deploy the Edge Function (15 min)

```bash
cd settlement-agent
supabase login
supabase link --project-ref YOUR-PROJECT-REF     # found in your project URL
supabase secrets set GROQ_API_KEY=your_groq_key_here
supabase functions deploy settlement-trace
```

The function is already written for you at
`supabase/functions/settlement-trace/index.ts`. It:
- Accepts `{ query: "pay_Gz8x1000" }` (gateway ID or order ID)
- Calls `trace_transaction()` in Postgres for the verified facts
- Sends those facts to Groq (`llama-3.3-70b-versatile`) with strict instructions not to
  invent anything not in the JSON
- Falls back to the raw deterministic `reason` if the LLM call fails, so a demo never
  breaks even if Groq is down or rate-limited

Test it directly from the terminal once deployed:
```bash
curl -X POST 'https://YOUR-PROJECT-REF.functions.supabase.co/settlement-trace' \
  -H 'Authorization: Bearer YOUR-ANON-KEY' \
  -H 'Content-Type: application/json' \
  -d '{"query":"pay_Gz8x1000"}'
```

---

## Step 5 — Frontend (5 min)

Open `frontend/index.html`, edit these two lines near the top of the `<script>`:
```js
const SUPABASE_FUNCTION_URL = "https://YOUR-PROJECT-REF.functions.supabase.co/settlement-trace";
const SUPABASE_ANON_KEY = "YOUR-ANON-KEY";
```
Then just double-click the file to open it in a browser. No build step, no npm install.
Type in any transaction ID and hit Ask.

---

## Step 6 — What to say in your demo (this matters for judging)

Walk through these 4 IDs live — each hits a different branch of the logic:
1. `pay_Gz8x1001` → clean settlement, all 3 systems agree.
2. `pay_Gz8x1000` → captured but still waiting on the bank (pending, not necessarily broken).
3. `pay_Gz8x1042` → bank explicitly failed the settlement — flagged for human review.
4. `pay_Gz8x1038` → bank settled, but ledger hasn't caught up — a real reconciliation bug.

Then run `select * from list_exceptions();` in SQL Editor live to show the full honest
exception list across all 100 mock transactions — that's the "isn't fully sure" deliverable
from the brief, and it's driven by SQL, not the LLM, so it's trustworthy.

---

## If you have extra time (stretch goals, roughly in priority order)

1. **Date-range / email search**: `search_transactions()` is already written in
   `03_trace_function.sql` — wire a second input field in the frontend to call
   `supabase.rpc('search_transactions', { p_query })` directly from the browser
   (via `@supabase/supabase-js`) so support staff can search by customer email too.
2. **Chat-style multi-turn**: instead of one query box, keep a message history and pass
   it to Groq so users can ask follow-ups like "why is it still pending?" without
   re-pasting the ID.
3. **Row Level Security**: right now the Edge Function uses the `service_role` key so RLS
   doesn't block it. If you expose the tables to the browser directly (for the search
   stretch goal above), turn on RLS and add a read-only policy — don't skip this if you
   demo publicly.
4. **"Days late" nuance**: `PENDING_BANK_SETTLEMENT` currently gets flagged for review
   only if older than 2 days (already coded in the Edge Function) — you could surface that
   threshold as a config value instead of a hardcoded `2`.

---

## Files in this folder

```
01_schema.sql                              — run 1st: creates tables
02_import_and_fix_dates.sql                — run 3rd: after CSV import, fixes dates
03_trace_function.sql                      — run 4th: the core agent logic (SQL)
supabase/functions/settlement-trace/       — Edge Function: SQL trace + LLM narration
frontend/index.html                        — the UI, no build step needed
```
