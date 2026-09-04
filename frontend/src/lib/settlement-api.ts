import {
  InvestigationError,
  type InvestigationRequest,
  type SettlementInvestigation,
} from "@/types/settlement";

/**
 * Endpoint of the n8n webhook that performs the settlement investigation.
 * Override with VITE_SETTLEMENT_WEBHOOK_URL; defaults to the documented path.
 */
export const SETTLEMENT_WEBHOOK_URL =
  (import.meta.env["VITE_SETTLEMENT_WEBHOOK_URL"] as string | undefined) ??
  "/webhook/settlement-investigation";

/** POSTs the investigation request and returns the raw structured response. */
export async function investigateSettlement(
  body: InvestigationRequest,
  signal?: AbortSignal,
): Promise<SettlementInvestigation> {
  let response: Response;

  try {
    response = await fetch(SETTLEMENT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: signal ?? null,
    });
  } catch {
    throw new InvestigationError(
      "unreachable",
      "Unable to reach the settlement investigation service. Please try again.",
    );
  }

  if (response.status === 404) {
    throw new InvestigationError(
      "not_found",
      "Transaction not found. Please verify the transaction ID.",
    );
  }

  if (!response.ok) {
    throw new InvestigationError(
      "unreachable",
      "Unable to reach the settlement investigation service. Please try again.",
    );
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new InvestigationError(
      "invalid",
      "The settlement investigation service returned an unreadable response.",
    );
  }

  const result = normalizeInvestigation(data);

  if (!result) {
    throw new InvestigationError(
      "not_found",
      "Transaction not found. Please verify the transaction ID.",
    );
  }

  return result;
}

/**
 * n8n commonly wraps output in an array or a `data`/`json` envelope.
 * Unwrap it without inventing any values.
 */
function normalizeInvestigation(data: unknown): SettlementInvestigation | null {
  let payload = data;

  if (Array.isArray(payload)) payload = payload[0];
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (record["json"] && typeof record["json"] === "object") payload = record["json"];
    else if (record["data"] && typeof record["data"] === "object") payload = record["data"];
  }

  if (!payload || typeof payload !== "object") return null;

  const candidate = payload as SettlementInvestigation;
  const hasAnything =
    candidate.transaction_id != null ||
    candidate.status != null ||
    candidate.gateway != null ||
    candidate.bank != null ||
    candidate.ledger != null;

  return hasAnything ? candidate : null;
}
