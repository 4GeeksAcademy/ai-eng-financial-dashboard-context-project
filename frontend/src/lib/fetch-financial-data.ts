import type { FinancialMovement } from "./financial-types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export async function fetchFinancialData(): Promise<FinancialMovement[]> {
  const maxAttempts = 5;

  let lastError: unknown = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/metrics`);
      if (!response.ok) {
        throw new Error(`Failed to fetch financial data: ${response.status}`);
      }

      return (await response.json()) as FinancialMovement[];
    } catch (error) {
      lastError = error;

      if (attempt === maxAttempts) {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Failed to fetch financial data");
}
