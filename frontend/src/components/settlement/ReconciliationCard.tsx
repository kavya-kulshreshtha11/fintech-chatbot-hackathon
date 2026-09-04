import { Check, TriangleAlert } from "lucide-react";
import { formatAmount } from "@/lib/settlement-format";
import type { SettlementInvestigation } from "@/types/settlement";

export function ReconciliationCard({ data }: { data: SettlementInvestigation }) {
  const rec = data.reconciliation ?? {};
  const gateway = rec.gateway_amount ?? data.gateway?.amount ?? null;
  const bank = rec.bank_amount ?? data.bank?.amount ?? null;
  const ledger = rec.ledger_amount ?? data.ledger?.amount ?? null;

  const amounts = [gateway, bank, ledger].filter((v): v is number => typeof v === "number");
  const derivedMatch = amounts.length > 1 ? amounts.every((v) => v === amounts[0]) : null;
  const reconciled = typeof rec.reconciled === "boolean" ? rec.reconciled : derivedMatch;

  const cells = [
    { label: "Gateway", value: gateway },
    { label: "Bank", value: bank },
    { label: "Ledger", value: ledger },
  ];

  return (
    <div className="glass rounded-2xl border border-border p-6">
      <p className="text-sm font-semibold text-strong">Reconciliation</p>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {cells.map((cell) => (
          <div key={cell.label} className="rounded-xl bg-ink2/50 p-3">
            <p className="text-[10px] uppercase tracking-wider text-faint">{cell.label}</p>
            <p className="mt-1 font-mono text-sm font-semibold text-strong">
              {formatAmount(cell.value, data.currency)}
            </p>
          </div>
        ))}
      </div>

      {reconciled === true && (
        <p className="mt-4 flex items-center gap-2 text-sm font-medium text-mint">
          <Check className="size-4" aria-hidden /> Amounts reconciled
        </p>
      )}
      {reconciled === false && (
        <p className="mt-4 flex items-center gap-2 text-sm font-medium text-rose">
          <TriangleAlert className="size-4" aria-hidden /> Amount mismatch detected
          {typeof rec.difference === "number"
            ? ` · ${formatAmount(rec.difference, data.currency)}`
            : ""}
        </p>
      )}
      {reconciled == null && (
        <p className="mt-4 text-sm text-muted-foreground">
          Not enough amounts were returned to reconcile these systems.
        </p>
      )}
    </div>
  );
}
