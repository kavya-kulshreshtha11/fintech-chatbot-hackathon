import { createFileRoute } from "@tanstack/react-router";
import { AppShell, ComingSoon } from "@/components/layout/AppShell";

export const Route = createFileRoute("/exceptions")({
  head: () => ({
    meta: [
      { title: "Exceptions — SettlementAI" },
      {
        name: "description",
        content: "A queue of unreconciled settlements, missing records and amount mismatches.",
      },
      { property: "og:title", content: "Exceptions — SettlementAI" },
      {
        property: "og:description",
        content: "A queue of unreconciled settlements, missing records and amount mismatches.",
      },
    ],
  }),
  component: ExceptionsPage,
});

function ExceptionsPage() {
  return (
    <AppShell eyebrow="Exceptions" title="Unresolved settlement exceptions">
      <ComingSoon
        name="Exceptions"
        description="A working queue of missing records, amount mismatches and conflicting system statuses across all transactions."
      />
    </AppShell>
  );
}
