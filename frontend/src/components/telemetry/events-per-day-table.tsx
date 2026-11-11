import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card'
import type { EventsPerDayPoint } from '@/lib/telemetry-types'

interface EventsPerDayTableProps {
  data: EventsPerDayPoint[]
  loading: boolean
}

/**
 * Operational metric: volume of events per day and event type.
 * Answers: "Which events occur, and how often, per day?"
 */
export function EventsPerDayTable({ data, loading }: EventsPerDayTableProps) {
  if (loading) {
    return (
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold">Events per day</CardTitle>
          <CardDescription>Loading…</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-semibold">Events per day</CardTitle>
        <CardDescription>
          Which events occur, and how often, by day
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {data.length === 0 ? (
          <p className="text-xs text-muted-foreground">No events in period.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Date</th>
                  <th className="pb-2 pr-4 font-medium">Event type</th>
                  <th className="pb-2 text-right font-medium">Count</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={`${row.date}-${row.event_type}`} className="border-b border-border/50 last:border-0">
                    <td className="py-1.5 pr-4 text-muted-foreground">{row.date}</td>
                    <td className="py-1.5 pr-4 font-mono text-xs">{row.event_type}</td>
                    <td className="py-1.5 text-right font-medium">{row.event_count}</td>
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