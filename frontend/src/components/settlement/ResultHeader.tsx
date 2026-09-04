import { StatusBadge } from "@/components/settlement/StatusBadge";
import { confidenceLevel, confidencePercent, formatAmount } from "@/lib/settlement-format";
import type { SettlementInvestigation } from "@/types/settlement";

const LEVEL_CLASS: Record<string, string> = {
  High: "bg-mint text-mint",
  Medium: "bg-amber text-amber",
  Low: "bg-rose text-rose",
};

export function ResultHeader({ data }: { data: SettlementInvestigation }) {
  const level = confidenceLevel(data);
  const percent = confidencePercent(data.confidence);
  const tone = level ? LEVEL_CLASS[level] : "bg-faint text-faint";
  const [barClass, textClass] = (tone ?? "").split(" ");

  return (
    <section className="glass rounded-2xl border border-border p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">Transaction</p>
          <p className="font-mono text-2xl font-semibold text-strong">
            {data.transaction_id ?? "—"}
          </p>
        </div>
        <StatusBadge status={data.status} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-5 md:grid-cols-4">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-faint">Amount</p>
          <p className="mt-1 font-mono text-lg font-semibold text-strong">
            {formatAmount(data.amount)}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-faint">Currency</p>
          <p className="mt-1 font-mono text-lg font-semibold text-strong">{data.currency ?? "—"}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-faint">Confidence</p>
          <p className="mt-1 font-mono text-lg font-semibold text-brand">
            {percent != null ? `${percent}%` : "Not reported"}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-faint">Level</p>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="h-1.5 w-10 overflow-hidden rounded-full bg-muted">
              <span
                className={`block h-full rounded-full ${barClass}`}
                style={{ width: `${percent ?? 0}%` }}
              />
            </span>
            <span className={`text-xs font-semibold ${textClass}`}>{level ?? "Unknown"}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
