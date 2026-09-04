import { createFileRoute } from "@tanstack/react-router";
import { AppShell, ComingSoon } from "@/components/layout/AppShell";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — SettlementAI" },
      {
        name: "description",
        content: "Settlement success rates, failure patterns and reconciliation trends over time.",
      },
      { property: "og:title", content: "Analytics — SettlementAI" },
      {
        property: "og:description",
        content: "Settlement success rates, failure patterns and reconciliation trends over time.",
      },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return (
    <AppShell eyebrow="Analytics" title="Settlement trends and failure patterns">
      <ComingSoon
        name="Analytics"
        description="Settlement success rates, failure clusters and reconciliation drift. Available once historical data is connected."
      />
    </AppShell>
  );
}
