import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { KPICard } from './kpi-card'
import { type KPIMetrics } from '@/lib/financial-types'
import { formatCurrency, formatPercent } from '@/lib/financial-utils'
import { TrendingUp, TrendingDown, DollarSign, BarChart2 } from 'lucide-react'

interface KPIRowProps {
  metrics: KPIMetrics
}

export function KPIRow({ metrics }: KPIRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <KPICard
        label="Total Income"
        value={formatCurrency(metrics.totalIncome)}
        helperText="Cumulative revenue from all income movements"
        icon={TrendingUp}
        variant="income"
      />
      <KPICard
        label="Total Outcome"
        value={formatCurrency(metrics.totalOutcome)}
        helperText="Total expenditure across all categories"
        icon={TrendingDown}
        variant="outcome"
      />
      <KPICard
        label="Profit"
        value={formatCurrency(metrics.profit)}
        helperText="Net profit — income minus total outcome"
        icon={DollarSign}
        variant="profit"
      />
      <KPICard
        label="Profit Margin"
        value={formatPercent(metrics.profitPercent)}
        helperText="Profit as a percentage of total income"
        icon={BarChart2}
        variant="profitPercent"
      />
    </div>
  )
}

export function KPIRowSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-border/60">
          <CardContent className="p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-3 w-44" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
