import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/financial-utils'

interface RevenueSummaryProps {
  revenue: number
  loading?: boolean
  error?: string
}

export function RevenueSummary({ revenue, loading = false, error }: RevenueSummaryProps) {
  if (loading) {
    return (
      <Card className="border-border/60" data-slot="revenue-summary">
        <CardContent className="p-6 flex flex-col gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-48" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5" data-slot="revenue-summary">
        <CardContent className="p-6 flex flex-col gap-2">
          <p className="text-sm font-medium text-destructive">Error</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/60 hover:border-border transition-colors" data-slot="revenue-summary">
      <CardContent className="p-6 flex flex-col gap-4">
        <span className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
          Total Revenue
        </span>
        <p className="text-3xl font-semibold tracking-tight text-[var(--income-badge-fg)]">
          {formatCurrency(revenue)}
        </p>
      </CardContent>
    </Card>
  )
}
