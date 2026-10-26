import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KPIRow } from "@/components/dashboard/kpi-row";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  type FinancialMovement,
  type KPIMetrics,
  type MonthlyDataPoint,
} from "@/lib/financial-types";
import { computeKPIs, computeMonthlyData } from "@/lib/financial-utils";
import { track } from "@/services/telemetry";

const IncomeOutcomeChart = lazy(() => import("@/components/dashboard/income-outcome-chart").then((m) => ({ default: m.IncomeOutcomeChart })));
const ProfitPercentChart = lazy(() => import("@/components/dashboard/profit-percent-chart").then((m) => ({ default: m.ProfitPercentChart })));

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

/** Simple non-cryptographic hash for error messages (avoid PHI leaks). */
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16)
}

async function fetchFinancialData(): Promise<FinancialMovement[]> {
  const startTime = typeof performance !== 'undefined' ? performance.now() : 0;
  const response = await fetch(`${API_BASE_URL}/api/metrics`);
  const durationMs = typeof performance !== 'undefined' ? performance.now() - startTime : 0;
  if (!response.ok) {
    throw new Error(`Failed to fetch financial data: ${response.status}`);
  }
  // Track API latency for performance monitoring (sampled)
  track('api_latency_recorded', {
    endpoint: '/api/metrics',
    method: 'GET',
    http_status: response.status,
    duration_ms: Math.round(durationMs),
    sampling: true,
  });
  return response.json();
}

function ChartSkeleton() {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-4">
        <Skeleton className="h-5 w-52" />
        <Skeleton className="h-3 w-64 mt-1" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[280px] w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}

function App() {
  const [movements, setMovements] = useState<FinancialMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Track that the user viewed the main dashboard section
    track('section_viewed', {
      section: 'panel',
      entry_point: 'nav',
    });

    fetchFinancialData()
      .then((data) => {
        setMovements(data);

        // ── Eventos obligatorios del BRIEFING HealthCore ───────────────
        // Se disparan aquí como demostración del sistema de captura.
        // En producción estos eventos se emiten desde los controladores
        // de inventario (inbound/outbound orders) y jobs de monitoreo.

        // M1: Recepción de insumos de proveedor
        track('inbound_order_created', {
          orderId: 'ord_demo_1', clinic_id: 'clinic_01',
          country: 'US', product_id: 'prod_007',
          product_category: 'ppe', quantity: 500,
          supplier_id: 'sup_healthcorp',
        })

        // M2: Consumo de insumo en departamento clínico
        track('outbound_order_created', {
          orderId: 'ord_demo_2', clinic_id: 'clinic_01',
          country: 'US', product_id: 'prod_007',
          product_category: 'ppe', quantity: 24,
          department: 'emergency',
        })

        // M3: Alerta de stock por debajo del umbral
        track('stock_threshold_triggered', {
          clinic_id: 'clinic_01', country: 'US',
          product_id: 'prod_007', product_category: 'ppe',
          currentStock: 12, threshold: 50,
          trigger_source: 'outbound_order_created',
        })

        // M4: Intento de edición directa de stock rechazado
        track('direct_stock_edit_rejected', {
          clinic_id: 'clinic_01', country: 'US',
          product_id: 'prod_007', product_category: 'ppe',
          attempted_field: 'available_stock',
          reject_reason: 'stock_is_derived',
        })

        // M5: Lote próximo a vencer
        track('supply_expiry_flagged', {
          clinic_id: 'clinic_01', country: 'US',
          product_id: 'prod_007', product_category: 'ppe',
          lot_id: 'lot_abc', expiry_date: '2026-11-15',
          days_to_expiry: 21, quantity_on_lot: 200,
        })
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        setError(
          "No se pudo cargar la informacion financiera. Revisa la API de backend.",
        );
        // Track frontend errors for error monitoring
        track('frontend_error_caught', {
          page: 'panel',
          component: 'App',
          error_class: err instanceof Error ? err.constructor.name : 'Unknown',
          error_message_hash: simpleHash(message),
          api_endpoint: '/api/metrics',
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const metrics = useMemo<KPIMetrics | null>(
    () => (movements.length > 0 ? computeKPIs(movements) : null),
    [movements],
  );

  const monthlyData = useMemo<MonthlyDataPoint[]>(
    () => computeMonthlyData(movements),
    [movements],
  );

  return (
    <main className="dark min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <DashboardHeader period="2024 - Full Year" />

          {error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground">
              {error}
            </div>
          ) : null}

          <section aria-label="Key performance indicators">
            <KPIRow metrics={metrics} loading={loading} />
          </section>

          <section
            aria-label="Financial charts"
            className="grid grid-cols-1 gap-4 xl:grid-cols-2"
          >
            <Suspense fallback={<ChartSkeleton />}>
              <IncomeOutcomeChart data={monthlyData} loading={loading} />
            </Suspense>
            <Suspense fallback={<ChartSkeleton />}>
              <ProfitPercentChart data={monthlyData} loading={loading} />
            </Suspense>
          </section>
        </div>
      </div>
    </main>
  );
}

export default App;
