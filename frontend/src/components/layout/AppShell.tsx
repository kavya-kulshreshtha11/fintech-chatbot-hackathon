import { Link } from "@tanstack/react-router";
import { Activity, BarChart3, ListTree, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Settlement Investigation", icon: Activity, ready: true },
  { to: "/transactions", label: "Transactions", icon: ListTree, ready: false },
  { to: "/analytics", label: "Analytics", icon: BarChart3, ready: false },
  { to: "/exceptions", label: "Exceptions", icon: TriangleAlert, ready: false },
] as const;

export function AppShell({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen text-foreground">
      <div className="fixed inset-0 bg-ink" />
      <div className="fixed inset-0 gridlines" />
      <div className="fixed inset-0 aurora" />

      <div className="relative flex min-h-screen">
        <aside className="glass hidden sm:flex w-64 shrink-0 flex-col border-r border-border p-5">
          <div className="flex items-center gap-2.5 px-2">
            <div className="grid size-9 place-items-center rounded-xl gradient-brand font-mono text-sm font-bold text-ink">
              SA
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-strong">SettlementAI</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand/70">
                Q&amp;A Agent
              </p>
            </div>
          </div>

          <nav className="mt-8 space-y-1.5">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{
                  className:
                    "flex items-center gap-3 rounded-lg bg-brand/15 px-3 py-2.5 text-sm font-semibold text-strong ring-1 ring-inset ring-brand/30 transition",
                }}
              >
                <item.icon className="size-4 shrink-0" aria-hidden />
                <span className="truncate">{item.label}</span>
                {!item.ready && (
                  <span className="ml-auto font-mono text-[9px] uppercase tracking-wider text-faint">
                    Soon
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="mt-auto rounded-xl border border-amber/20 bg-amber/5 p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber/80">MVP</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Transactions, Analytics &amp; Exceptions arrive in the next build.
            </p>
          </div>
        </aside>

        <main className="relative flex-1 overflow-x-hidden">
          <header className="glass sticky top-0 z-10 flex items-center justify-between border-b border-border px-6 py-4">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand/60">
                {eyebrow}
              </p>
              <h1 className="truncate text-lg font-bold tracking-tight text-strong">{title}</h1>
            </div>
            <span className="hidden md:inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs text-muted-foreground">
              <span className="size-1.5 animate-pulse rounded-full bg-mint" />
              n8n webhook · ready
            </span>
          </header>

          <div className="mx-auto max-w-6xl space-y-6 p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function ComingSoon({ name, description }: { name: string; description: string }) {
  return (
    <section className="glass rounded-2xl border border-border p-10 text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand/60">Coming soon</p>
      <h2 className="mt-2 text-xl font-bold tracking-tight text-strong">{name}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex rounded-xl gradient-brand px-5 py-2.5 text-sm font-semibold text-ink transition hover:opacity-90"
      >
        Go to Settlement Investigation
      </Link>
    </section>
  );
}
