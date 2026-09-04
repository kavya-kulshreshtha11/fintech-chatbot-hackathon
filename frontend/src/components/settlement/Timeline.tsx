import { formatTimestamp, statusTone } from "@/lib/settlement-format";
import type { TimelineEvent } from "@/types/settlement";

const DOT: Record<string, string> = {
  positive: "bg-mint ring-mint/15",
  pending: "bg-amber ring-amber/15",
  negative: "bg-rose ring-rose/15",
  neutral: "bg-brand ring-brand/15",
};

export function Timeline({ events }: { events?: TimelineEvent[] | null | undefined }) {
  const items = events ?? [];

  return (
    <div className="glass rounded-2xl border border-border p-6 lg:col-span-2">
      <p className="text-sm font-semibold text-strong">Transaction Timeline</p>

      {items.length === 0 ? (
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          No timeline events were returned for this transaction.
        </p>
      ) : (
        <ol className="mt-4 space-y-4 border-l border-border pl-5">
          {items.map((event, index) => (
            <li key={index} className="relative">
              <span
                className={`absolute -left-[27px] top-1 size-2.5 rounded-full ring-4 ${
                  DOT[statusTone(event.status)]
                }`}
              />
              <p className="text-sm text-foreground">{event.label ?? event.system ?? "Event"}</p>
              {event.detail && (
                <p className="text-xs leading-relaxed text-muted-foreground">{event.detail}</p>
              )}
              <p className="font-mono text-[10px] text-faint">{formatTimestamp(event.timestamp)}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
