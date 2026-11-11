import { Activity, BarChart3, LayoutDashboard } from 'lucide-react'

export type DashboardPage = 'dashboard' | 'telemetry' | 'reporting'

interface DashboardHeaderProps {
  page: DashboardPage
  onPageChange: (page: DashboardPage) => void
  period?: string
}

export function DashboardHeader({
  page,
  onPageChange,
  period = '2024 — Full Year',
}: DashboardHeaderProps) {
  const pageLabels: Record<DashboardPage, { title: string; subtitle: string }> = {
    dashboard: { title: 'Financial Overview', subtitle: 'Executive metrics dashboard' },
    telemetry: { title: 'Telemetry Report', subtitle: 'Operational metrics dashboard' },
    reporting: { title: 'Business KPI Report', subtitle: 'Clinic supply performance — HealthCore BRIEFING' },
  }
  const info = pageLabels[page]

  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {page === 'telemetry' ? <Activity size={18} /> : page === 'reporting' ? <BarChart3 size={18} /> : <LayoutDashboard size={18} />}
        </span>
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            {info.title}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {info.subtitle}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {page === 'dashboard' ? (
          <span className="inline-flex items-center rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            {period}
          </span>
        ) : null}
        <nav aria-label="Dashboard navigation" className="flex items-center gap-1 rounded-lg border border-border bg-secondary/60 p-1">
          <button
            type="button"
            aria-pressed={page === 'dashboard'}
            onClick={() => onPageChange('dashboard')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              page === 'dashboard'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Financial
          </button>
          <button
            type="button"
            aria-pressed={page === 'telemetry'}
            onClick={() => onPageChange('telemetry')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              page === 'telemetry'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Telemetry
          </button>
          <button
            type="button"
            aria-pressed={page === 'reporting'}
            onClick={() => onPageChange('reporting')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              page === 'reporting'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Reporting
          </button>
        </nav>
      </div>
    </header>
  )
}
