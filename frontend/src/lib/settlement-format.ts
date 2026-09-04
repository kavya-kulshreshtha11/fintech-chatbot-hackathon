import type {
  ConfidenceLevel,
  SettlementException,
  SettlementInvestigation,
  SettlementStatus,
} from "@/types/settlement";

const KNOWN_STATUSES: SettlementStatus[] = [
  "SETTLED",
  "PROCESSING",
  "SETTLEMENT_FAILED",
  "PAYMENT_FAILED",
  "UNKNOWN",
];

export function normalizeStatus(status?: string | null): SettlementStatus | string {
  if (!status) return "UNKNOWN";
  const upper = String(status).trim().toUpperCase().replace(/\s+/g, "_");
  return (KNOWN_STATUSES as string[]).includes(upper) ? upper : upper;
}

export type StatusTone = "positive" | "pending" | "negative" | "neutral";

export function statusTone(status?: string | null): StatusTone {
  const value = normalizeStatus(status);
  if (/SETTLED|SUCCESS|CREDITED|POSTED|COMPLETE|OK|MATCHED/.test(value)) return "positive";
  if (/PROCESS|PENDING|INITIATED|IN_PROGRESS|AWAIT/.test(value)) return "pending";
  if (/FAIL|DECLIN|REJECT|ERROR|MISMATCH|MISSING|REVERS/.test(value)) return "negative";
  return "neutral";
}

/** Accepts 0–1 floats or 0–100 percentages; returns a percentage or null. */
export function confidencePercent(confidence?: number | null): number | null {
  if (typeof confidence !== "number" || Number.isNaN(confidence)) return null;
  const pct = confidence <= 1 ? confidence * 100 : confidence;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

export function confidenceLevel(
  data: Pick<SettlementInvestigation, "confidence" | "confidence_level">,
): ConfidenceLevel | null {
  const explicit = data.confidence_level;
  if (typeof explicit === "string") {
    const normalized = explicit.trim().toLowerCase();
    if (normalized === "high") return "High";
    if (normalized === "medium") return "Medium";
    if (normalized === "low") return "Low";
  }
  const pct = confidencePercent(data.confidence);
  if (pct == null) return null;
  if (pct >= 80) return "High";
  if (pct >= 50) return "Medium";
  return "Low";
}

export function formatAmount(amount?: number | null, currency?: string | null): string {
  if (typeof amount !== "number" || Number.isNaN(amount)) return "—";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: currency ? "currency" : "decimal",
      currency: currency ?? undefined,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return amount.toFixed(2);
  }
}

export function formatTimestamp(timestamp?: string | null): string {
  if (!timestamp) return "—";
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) return timestamp;
  return parsed.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function exceptionText(item: SettlementException | string): string {
  if (typeof item === "string") return item;
  return item.message ?? item.code ?? "Unspecified exception";
}

export function exceptionSeverity(item: SettlementException | string): "warning" | "critical" {
  if (typeof item === "string") return "warning";
  return item.severity === "critical" ? "critical" : "warning";
}

/** Records the backend did not return at all — surfaced, never invented. */
export function missingRecords(data: SettlementInvestigation): string[] {
  const missing: string[] = [];
  if (!data.gateway || Object.keys(data.gateway).length === 0) missing.push("Gateway record missing");
  if (!data.bank || Object.keys(data.bank).length === 0) missing.push("Bank record missing");
  if (!data.ledger || Object.keys(data.ledger).length === 0) missing.push("Ledger record missing");
  return missing;
}
