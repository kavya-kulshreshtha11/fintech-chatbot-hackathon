/**
 * Data contract for the settlement investigation service.
 *
 * The frontend expects a JSON payload shaped like the interfaces below from
 * an n8n webhook, e.g.:
 *
 *   POST /webhook/settlement-investigation
 *   { "transaction_id": "TXN1001" }
 *
 * Every field is treated as optional at runtime: any missing record is surfaced
 * in the "Exceptions & Missing Information" section instead of being faked.
 */

export type SettlementStatus =
  | "SETTLED"
  | "PROCESSING"
  | "SETTLEMENT_FAILED"
  | "PAYMENT_FAILED"
  | "UNKNOWN";

export type ConfidenceLevel = "High" | "Medium" | "Low";

/** One of the three financial systems traced during an investigation. */
export interface SystemRecord {
  status?: string | null;
  amount?: number | null;
  currency?: string | null;
  timestamp?: string | null;
  reference_id?: string | null;
  failure_reason?: string | null;
}

export interface TimelineEvent {
  label?: string | null;
  /** e.g. "gateway" | "bank" | "ledger" | "payment" */
  system?: string | null;
  status?: string | null;
  timestamp?: string | null;
  detail?: string | null;
}

export interface Reconciliation {
  gateway_amount?: number | null;
  bank_amount?: number | null;
  ledger_amount?: number | null;
  reconciled?: boolean | null;
  difference?: number | null;
}

export interface Analysis {
  what_happened?: string | null;
  likely_reason?: string | null;
  recommended_next_step?: string | null;
  root_cause?: string | null;
}

export interface SettlementException {
  code?: string | null;
  message?: string | null;
  severity?: "info" | "warning" | "critical" | string | null;
}

export interface SettlementInvestigation {
  transaction_id?: string | null;
  amount?: number | null;
  currency?: string | null;
  status?: SettlementStatus | string | null;
  /** 0–1 float, or 0–100 percentage — both are handled by the UI. */
  confidence?: number | null;
  confidence_level?: ConfidenceLevel | string | null;
  gateway?: SystemRecord | null;
  bank?: SystemRecord | null;
  ledger?: SystemRecord | null;
  reconciliation?: Reconciliation | null;
  timeline?: TimelineEvent[] | null;
  analysis?: Analysis | null;
  exceptions?: Array<SettlementException | string> | null;
  ai_explanation?: string | null;
}

export interface InvestigationRequest {
  transaction_id?: string;
  settlement_date?: string;
}

export type InvestigationErrorKind = "not_found" | "unreachable" | "invalid";

export class InvestigationError extends Error {
  kind: InvestigationErrorKind;
  constructor(kind: InvestigationErrorKind, message: string) {
    super(message);
    this.kind = kind;
    this.name = "InvestigationError";
  }
}
