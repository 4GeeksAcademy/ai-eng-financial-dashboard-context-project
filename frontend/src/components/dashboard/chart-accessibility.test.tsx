import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { ReactNode, SVGProps } from 'react'

vi.mock('recharts', async () => {
  const { createElement } = await import('react')
  const Container = ({ children }: { children?: ReactNode }) =>
    createElement('div', null, children)

  return {
    ResponsiveContainer: Container,
    LineChart: Container,
    CartesianGrid: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
    Legend: () => null,
    ReferenceLine: (props: SVGProps<SVGLineElement>) => createElement('line', props),
    Line: () => null,
  }
})

import { IncomeOutcomeChart } from './income-outcome-chart'
import { ProfitPercentChart } from './profit-percent-chart'
import type { MonthlyDataPoint } from '@/lib/financial-types'

const monthlyData: MonthlyDataPoint[] = [
  { month: 'Jan 2024', income: 1500, outcome: 250, profitPercent: 83.333 },
  { month: 'Feb 2024', income: 2000, outcome: 500, profitPercent: 75 },
]

describe('IncomeOutcomeChart accessibility table', () => {
  it('renders the chart title as a level-two heading', () => {
    const markup = renderToStaticMarkup(<IncomeOutcomeChart data={monthlyData} />)

    expect(markup).toContain('<h2 data-slot="card-title" class="leading-none text-base font-semibold">Income vs. Outcome</h2>')
  })

  it('renders monthly income and outcome values in a screen-reader-only table', () => {
    const markup = renderToStaticMarkup(<IncomeOutcomeChart data={monthlyData} />)

    expect(markup).toContain('class="sr-only"')
    expect(markup).toContain('<caption>Monthly income and outcome values</caption>')
    expect(markup).toContain('<th scope="col">Month</th>')
    expect(markup).toContain('<th scope="col">Income</th>')
    expect(markup).toContain('<th scope="col">Outcome</th>')
    expect(markup).toContain('<th scope="row">Jan 2024</th>')
    expect(markup).toContain('<td>$1,500</td><td>$250</td>')
    expect(markup).toContain('<th scope="row">Feb 2024</th>')
    expect(markup).toContain('<td>$2,000</td><td>$500</td>')
  })

  it('keeps the loading and empty states free of data tables', () => {
    const loadingMarkup = renderToStaticMarkup(<IncomeOutcomeChart data={monthlyData} loading />)
    const emptyMarkup = renderToStaticMarkup(<IncomeOutcomeChart data={[]} />)

    expect(loadingMarkup).not.toContain('<table>')
    expect(emptyMarkup).toContain('No data available to display')
    expect(emptyMarkup).not.toContain('<table>')
  })
})

describe('ProfitPercentChart accessibility table', () => {
  it('renders the zero reference line with half-opacity foreground contrast', () => {
    const markup = renderToStaticMarkup(<ProfitPercentChart data={monthlyData} />)

    expect(markup).toContain('stroke="var(--color-foreground)"')
    expect(markup).toContain('stroke-opacity="0.5"')
    expect(markup).toContain('stroke-dasharray="4 4"')
  })

  it('renders the chart title as a level-two heading', () => {
    const markup = renderToStaticMarkup(<ProfitPercentChart data={monthlyData} />)

    expect(markup).toContain('<h2 data-slot="card-title" class="leading-none text-base font-semibold">Profit Margin %</h2>')
  })

  it('renders monthly profit margins in a screen-reader-only table', () => {
    const markup = renderToStaticMarkup(<ProfitPercentChart data={monthlyData} />)

    expect(markup).toContain('class="sr-only"')
    expect(markup).toContain('<caption>Monthly profit margin percentages</caption>')
    expect(markup).toContain('<th scope="col">Month</th>')
    expect(markup).toContain('<th scope="col">Profit margin</th>')
    expect(markup).toContain('<th scope="row">Jan 2024</th><td>83.3%</td>')
    expect(markup).toContain('<th scope="row">Feb 2024</th><td>75.0%</td>')
  })

  it('keeps the loading and empty states free of data tables', () => {
    const loadingMarkup = renderToStaticMarkup(<ProfitPercentChart data={monthlyData} loading />)
    const emptyMarkup = renderToStaticMarkup(
      <ProfitPercentChart data={[{ ...monthlyData[0], profitPercent: 0 }]} />,
    )

    expect(loadingMarkup).not.toContain('<table>')
    expect(emptyMarkup).toContain('No data available to display')
    expect(emptyMarkup).not.toContain('<table>')
  })

  it('shows the empty state and exposes no monthly values for an empty data array', () => {
    const markup = renderToStaticMarkup(<ProfitPercentChart data={[]} />)

    expect(markup).toContain('No data available to display')
    expect(markup).not.toContain('<table>')
    expect(markup).not.toContain('Monthly profit margin percentages')
    expect(markup).not.toContain('Jan 2024')
    expect(markup).not.toContain('Feb 2024')
    expect(markup).not.toContain('83.3%')
    expect(markup).not.toContain('75.0%')
  })
})
