---
name: vercel-react-best-practices
description: React best practices aligned with Vercel patterns — component architecture, performance optimization, TypeScript patterns, and deployment considerations.
applyTo:
  - "frontend/src/**"
---

# Vercel React Best Practices Skill

## Component Architecture

### Component Organization
```
src/
├── components/
│   ├── ui/              # Reusable UI primitives (shadcn/ui)
│   │   ├── card.tsx
│   │   └── skeleton.tsx
│   └── dashboard/       # Feature-specific components
│       ├── kpi-card.tsx
│       ├── kpi-row.tsx
│       ├── income-outcome-chart.tsx
│       └── profit-percent-chart.tsx
├── lib/                 # Utilities, types, helpers
│   ├── financial-types.ts
│   ├── financial-utils.ts
│   └── utils.ts
└── App.tsx
```

### Component Patterns

#### 1. Single Responsibility
```tsx
// Good: One component, one job
export function KPICard({ label, value, icon }: KPICardProps) {
  return (
    <Card>
      <CardContent>
        <Icon name={icon} />
        <span>{label}</span>
        <span>{value}</span>
      </CardContent>
    </Card>
  );
}

// Bad: Multiple responsibilities
export function Dashboard() {
  // ❌ Fetching, transforming, AND rendering in one component
  const [data, setData] = useState();
  useEffect(() => { fetchData().then(setData); }, []);
  // ... 100+ lines of JSX
}
```

#### 2. Props Interface First
```tsx
// Always define props interface before component
interface KPICardProps {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function KPICard({ label, value, icon: Icon, trend, className }: KPICardProps) {
  // Implementation
}
```

#### 3. Composition Over Configuration
```tsx
// Good: Composable components
<Card>
  <CardHeader>Title</CardHeader>
  <CardContent>Body</CardContent>
  <CardFooter>Actions</CardFooter>
</Card>

// Bad: Too many props
<Card 
  title="Title"
  content="Body"
  footer="Actions"
  headerClassName="..."
  contentClassName="..."
  footerClassName="..."
/>
```

## Performance Patterns

### Memoization
```tsx
// Memoize expensive computations
const monthlyData = useMemo(() => {
  return computeMonthlyData.movements;
}, [movements]);

// Memoize callbacks passed to children
const handleClick = useCallback((id: string) => {
  setSelected(id);
}, []);
```

### Code Splitting
```tsx
// Lazy load heavy components
const ProfitChart = React.lazy(() => 
  import('./profit-percent-chart')
);

// Use with Suspense
<Suspense fallback={<ChartSkeleton />}>
  <ProfitChart data={data} />
</Suspense>
```

### Image Optimization
```tsx
// Use Next.js Image component or manual optimization
<img 
  src={src}
  alt={alt}
  loading="lazy"
  decoding="async"
  width={width}
  height={height}
/>
```

## TypeScript Best Practices

### Strict Type Safety
```tsx
// Use discriminated unions for variants
type ChartType = 
  | { kind: 'line'; smooth?: boolean }
  | { kind: 'bar'; stacked?: boolean }
  | { kind: 'pie'; donut?: boolean };

// Use branded types for IDs
type MovementId = string & { __brand: 'MovementId' };
```

### API Response Types
```tsx
// Match backend Pydantic models exactly
interface FinancialMovement {
  create_date: string;
  amount: number;
  operation_type: 'income' | 'outcome';
  category: string;
  business_type: 'B2B' | 'B2C';
}

// Use utility types for partial updates
type MovementUpdate = Partial<Pick<FinancialMovement, 'category' | 'business_type'>>;
```

### Error Handling
```tsx
// Use Result pattern for predictable errors
type Result<T, E = Error> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

async function fetchMetrics(): Promise<Result<KPIMetrics>> {
  try {
    const response = await fetch('/api/metrics');
    if (!response.ok) return { ok: false, error: new Error('Failed') };
    const data = await response.json();
    return { ok: true, value: data };
  } catch (error) {
    return { ok: false, error: error as Error };
  }
}
```

## Styling Patterns (Tailwind CSS 4)

### Use `cn()` Utility
```tsx
import { cn } from '@/lib/utils';

// Conditional classes
<button className={cn(
  "px-4 py-2 rounded",
  isActive && "bg-blue-500 text-white",
  isDisabled && "opacity-50 cursor-not-allowed"
)}>
```

### Design Tokens
```css
/* Use CSS variables for theming */
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
}

/* Reference in Tailwind */
.bg-primary { background-color: var(--primary); }
.text-foreground { color: var(--foreground); }
```

## Testing Patterns

### Unit Tests (Vitest)
```tsx
import { describe, it, expect } from 'vitest';
import { computeKPIs } from './financial-utils';

describe('computeKPIs', () => {
  it('calculates profit as income minus outcome', () => {
    const movements = [
      { amount: 100, operation_type: 'income' },
      { amount: 30, operation_type: 'outcome' },
    ];
    
    const kpis = computeKPIs(movements);
    
    expect(kpis.profit).toBe(70);
  });
});
```

### Component Tests
```tsx
import { render, screen } from '@testing-library/react';
import { KPICard } from './kpi-card';

describe('KPICard', () => {
  it('displays formatted currency value', () => {
    render(<KPICard label="Income" value={1234.56} icon={DollarSign} />);
    
    expect(screen.getByText('$1,234.56')).toBeInTheDocument();
  });
});
```

## Deployment Checklist

- [ ] No `console.log` in production builds
- [ ] Environment variables validated
- [ ] Bundle size analyzed (`npm run build -- --analyze`)
- [ ] Lighthouse score > 90 for all metrics
- [ ] Error boundaries wrap feature sections
- [ ] Loading states for all async operations
