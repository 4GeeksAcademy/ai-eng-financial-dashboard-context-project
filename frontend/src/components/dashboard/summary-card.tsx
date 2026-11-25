import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { type KPIMetrics } from '@/lib/financial-types'
import { formatCurrency } from '@/lib/financial-utils'

interface SummaryCardProps {
  metrics: KPIMetrics | null
  loading?: boolean
}

export function SummaryCard({ metrics, loading }: SummaryCardProps) {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Financial Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <>
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </>
        ) : (
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Income</dt>
              <dd className="font-semibold text-foreground">
                {metrics ? formatCurrency(metrics.totalIncome) : '—'}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Outcome</dt>
              <dd className="font-semibold text-foreground">
                {metrics ? formatCurrency(metrics.totalOutcome) : '—'}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Net Profit</dt>
              <dd className="font-semibold text-foreground">
                {metrics ? formatCurrency(metrics.profit) : '—'}
              </dd>
            </div>
          </dl>
        )}
      </CardContent>
    </Card>
  )
}

