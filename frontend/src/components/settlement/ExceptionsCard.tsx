import { Check, TriangleAlert } from "lucide-react";
import { exceptionSeverity, exceptionText, missingRecords } from "@/lib/settlement-format";
import type { SettlementInvestigation } from "@/types/settlement";

export function ExceptionsCard({ data }: { data: SettlementInvestigation }) {
  const reported = (data.exceptions ?? []).map((item) => ({
    text: exceptionText(item),
    severity: exceptionSeverity(item),
  }));
  const derived = missingRecords(data).map((text) => ({ text, severity: "warning" as const }));
  const items = [...reported, ...derived];
  const clean = items.length === 0;

  return (
    <div
      className={`glass rounded-2xl border p-6 ${clean ? "border-mint/20" : "border-amber/20"}`}
    >
      <p className="text-sm font-semibold text-strong">Exceptions &amp; Missing Information</p>

      {clean ? (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-mint/15 bg-mint/5 p-4">
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-mint/15 text-mint">
            <Check className="size-3.5" aria-hidden />
          </span>
          <p className="text-sm text-muted-foreground">
            No exceptions detected. All available records are consistent.
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {items.map((item, index) => (
            <li
              key={index}
              className={`flex items-start gap-3 rounded-xl border p-3 ${
                item.severity === "critical"
                  ? "border-rose/20 bg-rose/5"
                  : "border-amber/20 bg-amber/5"
              }`}
            >
              <TriangleAlert
                className={`mt-0.5 size-4 shrink-0 ${
                  item.severity === "critical" ? "text-rose" : "text-amber"
                }`}
                aria-hidden
              />
              <p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
