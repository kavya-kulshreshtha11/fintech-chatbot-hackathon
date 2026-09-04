import { createFileRoute } from "@tanstack/react-router";
import { AppShell, ComingSoon } from "@/components/layout/AppShell";

export const Route = createFileRoute("/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions — SettlementAI" },
      {
        name: "description",
        content:
          "Browse payment transactions across gateway, bank and ledger systems in SettlementAI.",
      },
      { property: "og:title", content: "Transactions — SettlementAI" },
      {
        property: "og:description",
        content:
          "Browse payment transactions across gateway, bank and ledger systems in SettlementAI.",
      },
    ],
  }),
  component: TransactionsPage,
});

function TransactionsPage() {
  return (
    <AppShell eyebrow="Transactions" title="Browse every payment record">
      <ComingSoon
        name="Transactions"
        description="A searchable register of gateway, bank and ledger records. Available once the transaction feed is connected."
      />
    </AppShell>
  );
}
