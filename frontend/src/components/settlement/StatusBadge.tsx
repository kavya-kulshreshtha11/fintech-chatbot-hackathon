import { normalizeStatus, statusTone } from "@/lib/settlement-format";

const TONE_CLASS: Record<string, string> = {
  positive: "border-mint/30 bg-mint/10 text-mint",
  pending: "border-amber/30 bg-amber/10 text-amber",
  negative: "border-rose/30 bg-rose/10 text-rose",
  neutral: "border-border bg-secondary text-muted-foreground",
};

export function StatusBadge({
  status,
  size = "md",
}: {
  status?: string | null | undefined;
  size?: "sm" | "md" | undefined;
}) {
  const label = normalizeStatus(status);
  const tone = statusTone(status);
  const sizing =
    size === "sm" ? "rounded-md px-2 py-0.5 text-[10px]" : "rounded-full px-3 py-1.5 text-xs";

  return (
    <span
      className={`inline-flex shrink-0 items-center border font-mono font-semibold tracking-wide ${sizing} ${TONE_CLASS[tone]}`}
    >
      {label}
    </span>
  );
}
