import { createFileRoute } from "@tanstack/react-router";
import { Loader2, SearchX, ServerCrash } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { AiExplanation } from "@/components/settlement/AiExplanation";
import { ExceptionsCard } from "@/components/settlement/ExceptionsCard";
import { ReconciliationCard } from "@/components/settlement/ReconciliationCard";
import { ResultHeader } from "@/components/settlement/ResultHeader";
import { SearchCard } from "@/components/settlement/SearchCard";
import { SystemTrace } from "@/components/settlement/SystemTrace";
import { Timeline } from "@/components/settlement/Timeline";
import { investigateSettlement } from "@/lib/settlement-api";
import { missingRecords } from "@/lib/settlement-format";
import {
  InvestigationError,
  type InvestigationRequest,
  type SettlementInvestigation,
} from "@/types/settlement";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Settlement Investigation — SettlementAI" },
      {
        name: "description",
        content:
          "Trace a payment across gateway, bank and ledger systems and get an AI explanation of why it settled or failed.",
      },
      { property: "og:title", content: "Settlement Investigation — SettlementAI" },
      {
        property: "og:description",
        content:
          "Trace a payment across gateway, bank and ledger systems and get an AI explanation of why it settled or failed.",
      },
    ],
  }),
  component: InvestigationPage,
});

function InvestigationPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<InvestigationError | null>(null);
  const [result, setResult] = useState<SettlementInvestigation | null>(null);

  async function run(body: InvestigationRequest) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await investigateSettlement(body));
    } catch (caught) {
      setError(
        caught instanceof InvestigationError
          ? caught
          : new InvestigationError(
              "unreachable",
              "Unable to reach the settlement investigation service. Please try again.",
            ),
      );
    } finally {
      setLoading(false);
    }
  }

  const incomplete = result ? missingRecords(result).length > 0 : false;

  return (
    <AppShell eyebrow="Settlement Investigation" title="Trace a payment across every system">
      <SearchCard
        loading={loading}
        onTrace={(transaction_id) => void run({ transaction_id })}
        onTraceByDate={(settlement_date) => void run({ settlement_date })}
      />

      {loading && (
        <section className="glass flex items-center gap-3 rounded-2xl border border-border p-6">
          <Loader2 className="size-5 shrink-0 animate-spin text-brand" aria-hidden />
          <p className="text-sm text-muted-foreground">
            Tracing transaction across financial systems...
          </p>
        </section>
      )}

      {error && (
        <section className="glass flex items-start gap-3 rounded-2xl border border-rose/25 p-6">
          {error.kind === "not_found" ? (
            <SearchX className="mt-0.5 size-5 shrink-0 text-rose" aria-hidden />
          ) : (
            <ServerCrash className="mt-0.5 size-5 shrink-0 text-rose" aria-hidden />
          )}
          <div>
            <p className="text-sm font-semibold text-strong">Investigation could not complete</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{error.message}</p>
          </div>
        </section>
      )}

      {result && (
        <>
          {incomplete && (
            <p className="rounded-xl border border-amber/25 bg-amber/5 px-4 py-3 text-sm text-amber">
              Some financial records are unavailable. See the Exceptions section.
            </p>
          )}

          <ResultHeader data={result} />
          <SystemTrace data={result} />

          <div className="grid gap-4 lg:grid-cols-5">
            <Timeline events={result.timeline} />
            <AiExplanation data={result} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ExceptionsCard data={result} />
            <ReconciliationCard data={result} />
          </div>
        </>
      )}
    </AppShell>
  );
}
