import type {
  AlertParams,
  AlertResponse,
  DateRangeFilter,
  FacetsResponse,
  FinancialMovement,
  TopCategoriesParams,
  TopCategoriesResponse,
} from "./financial-types";
import { parseISODate } from "./financial-utils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export function toQueryString(
  params: DateRangeFilter | AlertParams | TopCategoriesParams,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

async function getJson<T>(
  path: string,
  parse: (payload: unknown) => T,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { signal });
  if (!response.ok) {
    throw new Error(`Request to ${path} failed: ${response.status}`);
  }
  return parse(await response.json());
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isOperationType(value: unknown): value is FinancialMovement["operation_type"] {
  return value === "income" || value === "outcome";
}

function isBusinessType(value: unknown): value is FinancialMovement["business_type"] {
  return value === "B2B" || value === "B2C";
}

function isCategory(value: unknown): value is FinancialMovement["category"] {
  return value === "suppliers" || value === "sales" || value === "operational" ||
    value === "administrative" || value === "others";
}

function parseMovements(payload: unknown): FinancialMovement[] {
  if (!Array.isArray(payload)) throw new Error("Invalid metrics response");
  if (!payload.every((item) => isRecord(item) && typeof item.create_date === "string" &&
    typeof item.amount === "number" && isOperationType(item.operation_type) &&
    isCategory(item.category) && isBusinessType(item.business_type))) {
    throw new Error("Invalid movement in metrics response");
  }
  return payload;
}

function parseAlerts(payload: unknown): AlertResponse {
  if (!Array.isArray(payload)) throw new Error("Invalid alerts response");
  if (!payload.every((item) => isRecord(item) && typeof item.period === "string" &&
    typeof item.outcome_total === "number" && typeof item.baseline_average === "number" &&
    typeof item.increase_ratio === "number")) {
    throw new Error("Invalid alert in alerts response");
  }
  return payload;
}

function parseTopCategories(payload: unknown): TopCategoriesResponse {
  if (!Array.isArray(payload)) throw new Error("Invalid categories response");
  if (!payload.every((item) => isRecord(item) && isCategory(item.category) &&
    isOperationType(item.operation_type) && typeof item.total_amount === "number")) {
    throw new Error("Invalid category in categories response");
  }
  return payload;
}

function parseFacets(payload: unknown): FacetsResponse {
  if (!isRecord(payload) || !Array.isArray(payload.operation_types) ||
    !payload.operation_types.every(isOperationType) || !Array.isArray(payload.business_types) ||
    !payload.business_types.every(isBusinessType) || !Array.isArray(payload.categories) ||
    !payload.categories.every(isCategory) || !isRecord(payload.categories_by_business_type)) {
    throw new Error("Invalid facets response");
  }

  const minDate = typeof payload.min_date === "string" ? parseISODate(payload.min_date) : undefined;
  const maxDate = typeof payload.max_date === "string" ? parseISODate(payload.max_date) : undefined;
  if (!minDate || !maxDate) throw new Error("Invalid facets date range");

  const categoriesByBusinessType: FacetsResponse["categories_by_business_type"] = {};
  for (const businessType of ["B2B", "B2C"] as const) {
    const businessCategories = payload.categories_by_business_type[businessType];
    if (businessCategories === undefined) continue;
    if (!isRecord(businessCategories)) throw new Error("Invalid business category facets");

    const parsedCategories: NonNullable<FacetsResponse["categories_by_business_type"][typeof businessType]> = {};
    for (const operationType of ["income", "outcome"] as const) {
      const categories = businessCategories[operationType];
      if (categories === undefined) continue;
      if (!Array.isArray(categories) || !categories.every(isCategory)) {
        throw new Error("Invalid operation category facets");
      }
      parsedCategories[operationType] = categories;
    }
    categoriesByBusinessType[businessType] = parsedCategories;
  }

  return {
    operation_types: payload.operation_types,
    business_types: payload.business_types,
    categories: payload.categories,
    categories_by_business_type: categoriesByBusinessType,
    min_date: minDate,
    max_date: maxDate,
  };
}

export function fetchFacets(signal?: AbortSignal): Promise<FacetsResponse> {
  return getJson("/api/metrics/facets", parseFacets, signal);
}

export function fetchMovements(
  filter: DateRangeFilter,
  signal?: AbortSignal,
): Promise<FinancialMovement[]> {
  return getJson(
    `/api/metrics${toQueryString(filter)}`,
    parseMovements,
    signal,
  );
}

export function fetchAlerts(
  params: AlertParams,
  signal?: AbortSignal,
): Promise<AlertResponse> {
  return getJson(
    `/api/metrics/alerts${toQueryString(params)}`,
    parseAlerts,
    signal,
  );
}

export function fetchTopCategories(
  params: TopCategoriesParams,
  signal?: AbortSignal,
): Promise<TopCategoriesResponse> {
  return getJson(
    `/api/metrics/categories/top${toQueryString(params)}`,
    parseTopCategories,
    signal,
  );
}
