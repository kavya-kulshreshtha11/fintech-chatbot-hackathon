import { confidenceLevel, confidencePercent } from "@/lib/settlement-format";
import type { SettlementInvestigation } from "@/types/settlement";

export function AiExplanation({ data }: { data: SettlementInvestigation }) {
  const analysis = data.analysis ?? {};
  const level = confidenceLevel(data);
  const percent = confidencePercent(data.confidence);
  const lowConfidence = level === "Low" || level === "Medium" || level == null;

  const rows = [
    { label: "What happened", value: analysis.what_happened },
    { label: "Likely reason", value: analysis.likely_reason ?? analysis.root_cause },
    { label: "Recommended next step", value: analysis.recommended_next_step },
  ].filter((row) => !!row.value);

  const hasContent = rows.length > 0 || !!data.ai_explanation;

  return (
    <div className="glass rounded-2xl border border-border p-6 lg:col-span-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-strong">AI Settlement Explanation</p>
        <span className="rounded-full border border-brand/25 bg-brand/10 px-2.5 py-1 font-mono text-[10px] text-brand">
          {percent != null ? `${percent}% confidence` : "confidence not reported"}
          {level ? ` · ${level}` : ""}
        </span>
      </div>

      {lowConfidence && hasContent && (
        <p className="mt-3 rounded-lg border border-amber/20 bg-amber/5 px-3 py-2 text-xs leading-relaxed text-amber">
          This explanation is not conclusive. Verify against the raw system records before acting on
          it.
        </p>
      )}

      {hasContent ? (
        <div className="mt-4 space-y-3 text-sm leading-relaxed">
          {rows.map((row) => (
            <p key={row.label} className="text-muted-foreground">
              <span className="font-semibold text-strong">{row.label}:</span> {row.value}
            </p>
          ))}
          {data.ai_explanation && (
            <p className="border-t border-border pt-3 text-muted-foreground">
              {data.ai_explanation}
            </p>
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          No explanation was returned for this transaction.
        </p>
      )}
    </div>
  );
}
