import { LayoutDashboard } from 'lucide-react'
import type { ReactNode } from 'react'

interface DashboardHeaderProps {
  period: string
  nav?: ReactNode
}

export function DashboardHeader({ period, nav }: DashboardHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <LayoutDashboard size={18} aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Financial Overview</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Executive metrics dashboard</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {nav}
        <span aria-label={`Selected period: ${period}`} className="inline-flex items-center rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          {period}
        </span>
      </div>
    </header>
  )
}
