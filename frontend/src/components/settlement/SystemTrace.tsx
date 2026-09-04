import { StatusBadge } from "@/components/settlement/StatusBadge";
import { formatAmount, formatTimestamp } from "@/lib/settlement-format";
import type { SettlementInvestigation, SystemRecord } from "@/types/settlement";

function SystemCard({
  title,
  record,
  fallbackCurrency,
}: {
  title: string;
  record?: SystemRecord | null | undefined;
  fallbackCurrency?: string | null | undefined;
}) {
  const hasRecord = !!record && Object.keys(record).length > 0;

  return (
    <div className="glass rounded-2xl border border-border p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-strong">{title}</p>
        {hasRecord ? (
          <StatusBadge status={record?.status} size="sm" />
        ) : (
          <span className="rounded-md border border-amber/30 bg-amber/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber">
            NO RECORD
          </span>
        )}
      </div>

      {hasRecord ? (
        <>
          <p className="mt-3 font-mono text-lg font-semibold text-strong">
            {formatAmount(record?.amount, record?.currency ?? fallbackCurrency)}
          </p>
          <p className="mt-1 font-mono text-[11px] text-faint">
            {record?.reference_id ? `${record.reference_id} · ` : ""}
            {formatTimestamp(record?.timestamp)}
          </p>
          {record?.failure_reason && (
            <p className="mt-3 rounded-lg border border-rose/20 bg-rose/5 px-3 py-2 text-xs leading-relaxed text-rose">
              {record.failure_reason}
            </p>
          )}
        </>
      ) : (
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          No record returned for this system. See the Exceptions section.
        </p>
      )}
    </div>
  );
}

export function SystemTrace({ data }: { data: SettlementInvestigation }) {
  return (
    <div>
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
        System Trace
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        <SystemCard title="Payment Gateway" record={data.gateway} fallbackCurrency={data.currency} />
        <SystemCard title="Bank Settlement" record={data.bank} fallbackCurrency={data.currency} />
        <SystemCard title="Internal Ledger" record={data.ledger} fallbackCurrency={data.currency} />
      </div>
    </div>
  );
}
