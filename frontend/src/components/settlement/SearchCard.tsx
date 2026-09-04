import { CalendarDays, Loader2, Search } from "lucide-react";
import { useState } from "react";

export function SearchCard({
  loading,
  onTrace,
  onTraceByDate,
}: {
  loading: boolean;
  onTrace: (transactionId: string) => void;
  onTraceByDate: (settlementDate: string) => void;
}) {
  const [transactionId, setTransactionId] = useState("");
  const [settlementDate, setSettlementDate] = useState("");
  const [dateOpen, setDateOpen] = useState(false);

  return (
    <section className="glass rounded-2xl border border-border p-6">
      <label htmlFor="transaction-id" className="text-sm font-semibold text-strong">
        Investigate a transaction
      </label>
      <p className="mt-1 text-xs text-faint">Enter transaction ID</p>

      <form
        className="mt-3 flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          if (transactionId.trim()) onTrace(transactionId.trim());
        }}
      >
        <div className="relative w-full">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-faint"
            aria-hidden
          />
          <input
            id="transaction-id"
            value={transactionId}
            onChange={(event) => setTransactionId(event.target.value)}
            placeholder="e.g. TXN1001"
            autoComplete="off"
            className="w-full rounded-xl border border-border bg-ink2/60 py-3 pl-11 pr-4 font-mono text-sm text-strong placeholder:text-faint focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !transactionId.trim()}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl gradient-brand px-6 py-3 text-sm font-semibold text-ink transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
          Trace Transaction
        </button>
      </form>

      <button
        type="button"
        onClick={() => setDateOpen((open) => !open)}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand/80 transition hover:text-brand"
      >
        <CalendarDays className="size-3.5" aria-hidden />
        Search by settlement date <span className="font-mono">→</span>
      </button>

      {dateOpen && (
        <form
          className="mt-3 flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            if (settlementDate) onTraceByDate(settlementDate);
          }}
        >
          <input
            type="date"
            aria-label="Settlement date"
            value={settlementDate}
            onChange={(event) => setSettlementDate(event.target.value)}
            className="w-full rounded-xl border border-border bg-ink2/60 px-4 py-3 font-mono text-sm text-strong focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-ring sm:max-w-56"
          />
          <button
            type="submit"
            disabled={loading || !settlementDate}
            className="shrink-0 rounded-xl border border-border bg-secondary px-6 py-3 text-sm font-semibold text-strong transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            Search date
          </button>
        </form>
      )}
    </section>
  );
}
