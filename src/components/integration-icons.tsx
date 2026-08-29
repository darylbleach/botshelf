import type { Integration } from "@/lib/types";

const labels: Record<Integration, string> = {
  gmail: "Gmail",
  x: "X",
  browser: "Browser",
  slack: "Slack",
  notion: "Notion",
  calendar: "Calendar",
};

export function IntegrationIcons({ items }: { items: Integration[] }) {
  return (
    <div className="flex items-center gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          title={labels[item]}
          className="inline-grid h-6 w-6 place-items-center rounded-md border border-[var(--line-strong)] bg-white/[0.04] text-[10px] font-semibold uppercase tracking-wide text-[var(--fg-muted)]"
        >
          {item === "gmail" && "Gm"}
          {item === "x" && "X"}
          {item === "browser" && "Br"}
          {item === "slack" && "Sl"}
          {item === "notion" && "No"}
          {item === "calendar" && "Ca"}
        </span>
      ))}
    </div>
  );
}
