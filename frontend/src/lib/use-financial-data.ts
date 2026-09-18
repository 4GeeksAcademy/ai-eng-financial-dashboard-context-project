import { useEffect, useState } from "react";
import type {
  FinancialMovement,
  KPIMetrics,
  MonthlyDataPoint,
} from "./financial-types";
import { computeKPIs, computeMonthlyData } from "./financial-utils";
import { type Result, ok, err } from "./result";

export interface FinancialDataState {
  metrics: KPIMetrics | null;
  monthlyData: MonthlyDataPoint[];
  loading: boolean;
  error: string | null;
}

const ERROR_MESSAGE =
  "No se pudo cargar la informacion financiera. Revisa la API de backend.";

async function fetchFinancialData(): Promise<Result<FinancialMovement[]>> {
  try {
    const response = await fetch("/api/metrics");
    if (!response.ok) {
      return err(new Error(`Failed to fetch financial data: ${response.status}`));
    }
    return ok(await response.json());
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }
}

export function useFinancialData(): FinancialDataState {
  const [state, setState] = useState<FinancialDataState>({
    metrics: null,
    monthlyData: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    fetchFinancialData().then((result) => {
      if (cancelled) return;

      if (!result.success) {
        setState((prev) => ({ ...prev, loading: false, error: ERROR_MESSAGE }));
        return;
      }

      const movements = result.data;
      setState({
        metrics: computeKPIs(movements),
        monthlyData: computeMonthlyData(movements),
        loading: false,
        error: null,
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}