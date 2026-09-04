// supabase/functions/settlement-trace/index.ts
//
// POST { "query": "pay_Gz8x1000" }   (accepts gateway_transaction_id or order_id)
// -> { status_code, explanation, raw_trace, needs_human_review }
//
// Flow:
// 1. Call the deterministic SQL function trace_transaction() via RPC.
//    This is the SOURCE OF TRUTH — it decides the status, not the LLM.
// 2. Hand that structured JSON to an LLM (Groq, free tier) and ask it
//    ONLY to translate it into a plain-English support answer.
// 3. If the SQL trace itself is an exception type, we flag
//    needs_human_review = true regardless of what the LLM says.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY")!; // free key from console.groq.com

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Status codes that mean "something is genuinely wrong / uncertain"
const EXCEPTION_CODES = new Set([
  "NOT_FOUND",
  "BANK_SETTLEMENT_FAILED",
  "LEDGER_RECONCILIATION_PENDING",
]);
// PENDING_BANK_SETTLEMENT is only an exception if it's been a while —
// handled below by checking age.

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return json({ error: "Provide { query: '<transaction_id or order_id>' }" }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: trace, error } = await supabase.rpc("trace_transaction", { p_id: query.trim() });
    if (error) throw error;

    if (!trace.found) {
      return json({
        status_code: "NOT_FOUND",
        explanation: `I couldn't find any transaction matching "${query}" in the gateway logs. Please double check the transaction ID or order ID and try again.`,
        needs_human_review: true,
        raw_trace: trace,
      });
    }

    // Determine if PENDING_BANK_SETTLEMENT is stale (> 2 days old) -> real exception
    let needsReview = EXCEPTION_CODES.has(trace.status_code);
    if (trace.status_code === "PENDING_BANK_SETTLEMENT") {
      const createdAt = trace.gateway.created_at_timestamp * 1000;
      const ageDays = (Date.now() - createdAt) / (1000 * 60 * 60 * 24);
      if (ageDays > 2) needsReview = true;
    }

    const explanation = await explainWithLLM(trace, query);

    return json({
      status_code: trace.status_code,
      explanation,
      needs_human_review: needsReview,
      raw_trace: trace,
    });
  } catch (e) {
    console.error(e);
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function explainWithLLM(trace: Record<string, unknown>, originalQuery: string): Promise<string> {
  const systemPrompt = `You are a settlement support agent for a payment platform.
You will be given a JSON "trace" object that already contains the VERIFIED facts about a
transaction's journey through gateway -> bank -> ledger, plus a status_code and a reason
that a deterministic system already computed.

Your ONLY job is to turn that into a short, clear, plain-English answer a non-technical
merchant support agent can read to a customer. Rules:
- Never invent facts that are not in the JSON (no made-up dates, amounts, or causes).
- If a field is null (e.g. bank record missing), say so plainly — do not guess why beyond
  what the "reason" field already states.
- Keep it to 3-5 sentences.
- End with one line starting "Next step:" giving a concrete, honest next action
  (e.g. "wait 1-2 more business days", "escalate to banking ops team", "no action needed").
- Do not use the word "settlement" more than twice.`;

  const userPrompt = `Customer/support query was: "${originalQuery}"\n\nTrace JSON:\n${JSON.stringify(trace, null, 2)}`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 400,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Groq error:", errText);
    // Fail gracefully: fall back to the deterministic reason so the
    // agent still works even if the LLM call fails
    return `${trace.reason} (Note: plain-English rewrite unavailable right now — showing raw system reason.)`;
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? String(trace.reason);
}
