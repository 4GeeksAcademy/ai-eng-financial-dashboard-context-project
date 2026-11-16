/**
 * View-model and component prop types referenced by `components.md`.
 *
 * Raw API types live in `api-types.ts` and keep the backend's `snake_case`. View-model types here are
 * `camelCase` (rule API-3). This file is a specification: it only exists so the props in `components.md`
 * compile against the API types. Nothing in `src/` imports it.
 */

import type {
  AlertsResponse,
  BusinessType,
  Category,
  FacetsResponse,
} from "./api-types";
import type { DateRangeFilter } from "./param-types";

/** Lifecycle of one request. `"ready"` includes an empty result. */
export type LoadStatus = "loading" | "ready" | "error";

/** The dataset's date window, taken from `FacetsResponse`. Both values are `YYYY-MM-DD`. */
export type AvailableDateRange = Pick<FacetsResponse, "min_date" | "max_date">;

/**
 * Why a `DateRangeFilter` must not be sent to the API.
 * - `"start_after_end"`: `start_date` is later than `end_date` (the API would answer 200 with an empty list).
 * - `"outside_available_range"`: a bound falls before `min_date` or after `max_date`.
 * `null` means the filter is valid (including both bounds empty, or only one set).
 */
export type DateRangeIssue = "start_after_end" | "outside_available_range" | null;

/** Which top-level screen is shown. There is no router in this project. */
export type AppView = "dashboard" | "comparison";

// ---------------------------------------------------------------- Feature 1

export interface DateRangeFilterBarProps {
  /** Current filter. Empty or missing bounds mean "no limit on that side". */
  value: DateRangeFilter;
  /** Called with the full next filter whenever either input changes. A cleared input becomes `undefined`. */
  onChange: (next: DateRangeFilter) => void;
  /** Dataset window for the reference text and the inputs' `min`/`max`. `null` while facets is loading or failed. */
  availableRange: AvailableDateRange | null;
  /** Current validation result computed by the parent. */
  issue: DateRangeIssue;
}

export interface DashboardHeaderProps {
  /**
   * Period text under the title, replacing the hardcoded `"2024 - Full Year"`.
   * Built from ISO date strings without `Date` parsing, for example `"2025-11-01 to 2026-10-28"`.
   */
  periodLabel: string;
}

// ---------------------------------------------------------------- Feature 2

export interface AnomalyAlertsSectionProps {
  /** The active home-dashboard filter. Already validated: the section is never given an invalid range. */
  dateRange: DateRangeFilter;
}

export interface ThresholdInputProps {
  /** The currently applied threshold, a ratio. Default `0.3`. */
  value: number;
  /** Called only with a valid ratio (`min <= next <= max`). */
  onChange: (next: number) => void;
  /** Smallest allowed ratio. `0.01`. */
  min: number;
  /** Largest allowed ratio. `1.0`. */
  max: number;
}

export interface AlertsTableProps {
  /** Rows exactly as returned by the API (chronological). */
  alerts: AlertsResponse;
  status: LoadStatus;
  /** The applied threshold, used in the empty-state message. */
  threshold: number;
  /** `true` when `start_date` or `end_date` is set, used in the empty-state message. */
  hasDateFilter: boolean;
  /** Shown when `status` is `"error"`. Should name the HTTP status when known. */
  errorMessage?: string;
}

// ---------------------------------------------------------------- Feature 3

/** One table row in a business-line panel, derived from a `CategoryEntry`. */
export interface CategoryIncomeRow {
  category: Category;
  /** `CategoryEntry.total_amount`, in dollars. */
  totalAmount: number;
  /** `totalAmount / BusinessLineIncome.totalIncome * 100`, unrounded. Display with one decimal. */
  percentOfGroup: number;
}

/** Everything one business-line panel and the chart need, derived from one `TopCategoriesResponse`. */
export interface BusinessLineIncome {
  businessType: BusinessType;
  /** Sum of `total_amount` over **all** entries of the response (requested with `limit=20`), in dollars. */
  totalIncome: number;
  /** At most 5 rows, highest `totalAmount` first. May be fewer than 5, or empty. */
  rows: CategoryIncomeRow[];
}

export interface ComparisonPageProps {
  /** The shared, validated date filter. */
  dateRange: DateRangeFilter;
  /** Source of the business lines to render (one panel each). `null` while loading or failed. */
  facets: FacetsResponse | null;
}

export interface BusinessLinePanelProps {
  businessType: BusinessType;
  status: LoadStatus;
  /** `null` until the request succeeds. */
  income: BusinessLineIncome | null;
  errorMessage?: string;
}

export interface CategoryIncomeTableProps {
  /** 1 to 5 rows. The table is never rendered with zero rows. */
  rows: CategoryIncomeRow[];
}

/** One bar in the comparison chart. */
export type BusinessLineTotalPoint = Pick<BusinessLineIncome, "businessType" | "totalIncome">;

export interface BusinessLineComparisonChartProps {
  /** Always two entries once both requests succeeded (B2B, B2C), in `facets.business_types` order. */
  points: BusinessLineTotalPoint[];
  status: LoadStatus;
}

export interface ViewNavProps {
  view: AppView;
  onChange: (next: AppView) => void;
}
