import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card'

interface RatePoint {
  date: string
}

interface RateCardProps {
  title: string
  description: string
  dataKey: string
  data: RatePoint[]
  loading: boolean
  /** Optional value formatter. Defaults to a percentage (rate 0..1). */
  formatValue?: (value: number) => string
}

/**
 * Generic daily metric card (error rate, auth failure rate, latency).
 * Rates are 0..1 and rendered as a percentage per day; latency is rendered
 * as ms via a custom formatter.
 */
export function RateCard({
  title,
  description,
  dataKey,
  data,
  loading,
  formatValue,
}: RateCardProps) {
  const defaultFormat = (value: number) => `${(value * 100).toFixed(1)}%`
  const renderValue = formatValue ?? defaultFormat

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {loading ? (
          <p className="text-xs text-muted-foreground">Loading…</p>
        ) : data.length === 0 ? (
          <p className="text-xs text-muted-foreground">No data in period.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Date</th>
                  <th className="pb-2 text-right font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.date} className="border-b border-border/50 last:border-0">
                    <td className="py-1.5 pr-4 text-muted-foreground">{row.date}</td>
                    <td className="py-1.5 text-right font-medium">
                      {renderValue(Number((row as unknown as Record<string, string | number>)[dataKey]))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}