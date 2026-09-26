import type { DashboardView } from "@/lib/financial-types";

interface DashboardNavProps {
  current: DashboardView;
  onNavigate: (view: DashboardView) => void;
}

export function DashboardNav({ current, onNavigate }: DashboardNavProps) {
  return (
    <nav aria-label="Dashboard navigation" className="flex gap-2 text-sm">
      {([
        ["overview", "Overview", "#/"] as const,
        ["comparison", "B2B vs B2C", "#/comparison"] as const,
      ]).map(([view, label, href]) => (
        <a
          key={view}
          href={href}
          aria-current={current === view ? "page" : undefined}
          onClick={() => onNavigate(view)}
          className={`rounded-md px-3 py-1.5 ${current === view ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-accent"}`}
        >
          {label}
        </a>
      ))}
    </nav>
  );
}

