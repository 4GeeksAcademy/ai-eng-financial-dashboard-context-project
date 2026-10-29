from __future__ import annotations

import random
from collections import defaultdict
from datetime import date, timedelta
from typing import Literal

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

OperationType = Literal["income", "outcome"]
Category = Literal["suppliers", "sales",
                   "operational", "administrative", "others"]
BusinessType = Literal["B2B", "B2C"]
GroupBy = Literal["day", "week", "month"]

OUTCOME_CATEGORIES = ["suppliers", "operational", "administrative", "others"]

router = APIRouter()


def validate_date_range(start_date: date | None, end_date: date | None) -> None:
    if start_date is not None and end_date is not None and start_date > end_date:
        raise HTTPException(
            status_code=422,
            detail="start_date must be less than or equal to end_date",
        )


class FinancialMovement(BaseModel):
    create_date: date
    amount: float
    operation_type: OperationType
    category: Category
    business_type: BusinessType


class MetricsFacets(BaseModel):
    operation_types: list[OperationType]
    business_types: list[BusinessType]
    categories: list[Category]
    categories_by_business_type: dict[BusinessType, list[Category]]
    min_date: date
    max_date: date


class MetricsSummaryItem(BaseModel):
    period: str
    income: float
    outcome: float
    net: float


class TopCategoryItem(BaseModel):
    category: Category
    operation_type: OperationType
    total_amount: float


class MetricsComparison(BaseModel):
    current_period: float
    previous_period: float
    delta_abs: float
    delta_pct: float | None


class MetricsAlert(BaseModel):
    period: str
    outcome_total: float
    baseline_average: float
    increase_ratio: float


def _year_for_month(month: int, today: date) -> int:
    if month < today.month:
        return today.year
    return today.year - 1


def _build_movement(month: int, income_probability: float, today: date) -> FinancialMovement:
    operation_type: OperationType = "income" if random.random(
    ) < income_probability else "outcome"
    movement_day = random.randint(1, 28)
    movement_date = date(_year_for_month(month, today), month, movement_day)
    business_type: BusinessType = "B2B" if random.random() < 0.55 else "B2C"

    if operation_type == "income":
        category: Category = "sales" if random.random() < 0.9 else "others"
        amount = round(random.uniform(800, 12000), 2)
    else:
        category = random.choice(OUTCOME_CATEGORIES)
        amount = round(random.uniform(500, 9000), 2)

    return FinancialMovement(
        create_date=movement_date,
        amount=amount,
        operation_type=operation_type,
        category=category,
        business_type=business_type,
    )


def generate_mock_movements(seed: int | None = None) -> list[FinancialMovement]:
    if seed is not None:
        random.seed(seed)
    today = date.today()
    movements: list[FinancialMovement] = []
    for month in range(1, 13):
        income_probability = random.uniform(0.45, 0.7)
        for _ in range(30):
            movements.append(_build_movement(month, income_probability, today))
    movements.sort(key=lambda item: item.create_date)
    return movements


def filter_movements_by_date(
    movements: list[FinancialMovement],
    start_date: date | None,
    end_date: date | None,
) -> list[FinancialMovement]:
    if start_date is None and end_date is None:
        return movements

    filtered = movements
    if start_date is not None:
        filtered = [
            movement for movement in filtered if movement.create_date >= start_date]
    if end_date is not None:
        filtered = [
            movement for movement in filtered if movement.create_date <= end_date]
    return filtered


def filter_movements(
    movements: list[FinancialMovement],
    start_date: date | None,
    end_date: date | None,
    category: Category | None,
    operation_type: OperationType | None,
) -> list[FinancialMovement]:
    filtered = filter_movements_by_date(movements, start_date, end_date)
    if category is not None:
        filtered = [
            movement for movement in filtered if movement.category == category
        ]
    if operation_type is not None:
        filtered = [
            movement
            for movement in filtered
            if movement.operation_type == operation_type
        ]
    return filtered


def ensure_chronological_order(movements: list[FinancialMovement]) -> list[FinancialMovement]:
    return sorted(movements, key=lambda item: item.create_date)


def build_metrics_facets(movements: list[FinancialMovement]) -> MetricsFacets:
    ordered = ensure_chronological_order(movements)
    return MetricsFacets(
        operation_types=sorted({item.operation_type for item in ordered}),
        business_types=sorted({item.business_type for item in ordered}),
        categories=sorted({item.category for item in ordered}),
        categories_by_business_type={
            business_type: sorted({
                item.category
                for item in ordered
                if item.business_type == business_type
            })
            for business_type in ("B2B", "B2C")
        },
        min_date=ordered[0].create_date,
        max_date=ordered[-1].create_date,
    )


def summarize_movements(
    movements: list[FinancialMovement],
    group_by: GroupBy,
) -> list[MetricsSummaryItem]:
    summary_map: dict[str, dict[str, float]] = defaultdict(
        lambda: {"income": 0.0, "outcome": 0.0}
    )
    for movement in movements:
        if group_by == "day":
            key = movement.create_date.isoformat()
        elif group_by == "week":
            iso_year, iso_week, _ = movement.create_date.isocalendar()
            key = f"{iso_year}-W{iso_week:02d}"
        else:
            key = movement.create_date.strftime("%Y-%m")

        summary_map[key][movement.operation_type] += movement.amount

    return [
        MetricsSummaryItem(
            period=period,
            income=round(values["income"], 2),
            outcome=round(values["outcome"], 2),
            net=round(values["income"] - values["outcome"], 2),
        )
        for period, values in sorted(summary_map.items(), key=lambda item: item[0])
    ]


def build_top_categories(
    movements: list[FinancialMovement],
    operation_type: OperationType,
    limit: int,
) -> list[TopCategoryItem]:
    totals: dict[Category, float] = defaultdict(float)
    for movement in movements:
        if movement.operation_type == operation_type:
            totals[movement.category] += movement.amount

    ordered = sorted(totals.items(), key=lambda item: item[1], reverse=True)
    return [
        TopCategoryItem(
            category=category,
            operation_type=operation_type,
            total_amount=round(total_amount, 2),
        )
        for category, total_amount in ordered[:limit]
    ]


def calculate_net_value(movements: list[FinancialMovement]) -> float:
    income = sum(
        item.amount for item in movements if item.operation_type == "income")
    outcome = sum(
        item.amount for item in movements if item.operation_type == "outcome")
    return round(income - outcome, 2)


def _previous_period_keys(period: str, group_by: GroupBy) -> list[str]:
    if group_by == "day":
        current_date = date.fromisoformat(period)
        return [
            (current_date - timedelta(days=offset)).isoformat()
            for offset in range(3, 0, -1)
        ]

    if group_by == "week":
        iso_year, iso_week = period.split("-W")
        current_week = date.fromisocalendar(int(iso_year), int(iso_week), 1)
        return [
            f"{week.isocalendar().year}-W{week.isocalendar().week:02d}"
            for week in (
                current_week - timedelta(weeks=offset)
                for offset in range(3, 0, -1)
            )
        ]

    year_text, month_text = period.split("-")
    year = int(year_text)
    month = int(month_text)
    previous_months: list[str] = []
    for _ in range(3):
        month -= 1
        if month == 0:
            month = 12
            year -= 1
        previous_months.append(f"{year}-{month:02d}")
    return list(reversed(previous_months))


def detect_outcome_alerts(
    summary: list[MetricsSummaryItem],
    threshold: float,
    baseline_summary: list[MetricsSummaryItem] | None = None,
    group_by: GroupBy = "month",
) -> list[MetricsAlert]:
    baseline_items = baseline_summary if baseline_summary is not None else summary
    baseline_by_period = {item.period: item for item in baseline_items}
    available_periods = sorted(baseline_by_period)
    if not available_periods:
        return []

    alerts: list[MetricsAlert] = []
    for item in summary:
        previous_periods = _previous_period_keys(item.period, group_by)
        if previous_periods[0] < available_periods[0]:
            continue

        previous_outcomes = [
            baseline_by_period[period].outcome
            if period in baseline_by_period
            else 0.0
            for period in previous_periods
        ]
        baseline = sum(previous_outcomes) / 3
        if baseline <= 0:
            continue

        increase_ratio = (item.outcome - baseline) / baseline
        if increase_ratio > threshold:
            alerts.append(
                MetricsAlert(
                    period=item.period,
                    outcome_total=round(item.outcome, 2),
                    baseline_average=round(baseline, 2),
                    increase_ratio=round(increase_ratio, 4),
                )
            )
    return alerts


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/api/metrics", response_model=list[FinancialMovement])
def get_metrics(
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    category: Category | None = Query(default=None),
    operation_type: OperationType | None = Query(default=None),
) -> list[FinancialMovement]:
    validate_date_range(start_date, end_date)
    movements = generate_mock_movements(seed=42)
    filtered = filter_movements(
        movements, start_date, end_date, category, operation_type
    )
    return ensure_chronological_order(filtered)


@router.get("/api/metrics/facets", response_model=MetricsFacets)
def get_metrics_facets() -> MetricsFacets:
    movements = generate_mock_movements(seed=42)
    return build_metrics_facets(movements)


@router.get("/api/metrics/summary", response_model=list[MetricsSummaryItem])
def get_metrics_summary(
    group_by: GroupBy = Query(default="month"),
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    category: Category | None = Query(default=None),
    operation_type: OperationType | None = Query(default=None),
    business_type: BusinessType | None = Query(default=None),
) -> list[MetricsSummaryItem]:
    validate_date_range(start_date, end_date)
    movements = generate_mock_movements(seed=42)
    if business_type is not None:
        movements = [
            item for item in movements if item.business_type == business_type]
    filtered = filter_movements(
        movements, start_date, end_date, category, operation_type
    )
    return summarize_movements(filtered, group_by)


@router.get("/api/metrics/categories/top", response_model=list[TopCategoryItem])
def get_top_categories(
    operation_type: OperationType = Query(default="outcome"),
    limit: int = Query(default=5, ge=1, le=20),
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    business_type: BusinessType | None = Query(default=None),
) -> list[TopCategoryItem]:
    validate_date_range(start_date, end_date)
    movements = generate_mock_movements(seed=42)
    if business_type is not None:
        movements = [
            item for item in movements if item.business_type == business_type]
    filtered = filter_movements(
        movements, start_date, end_date, category=None, operation_type=operation_type
    )
    return build_top_categories(filtered, operation_type, limit)


@router.get("/api/metrics/comparison", response_model=MetricsComparison)
def get_metrics_comparison(
    start_date: date = Query(...),
    end_date: date = Query(...),
    business_type: BusinessType | None = Query(default=None),
) -> MetricsComparison:
    validate_date_range(start_date, end_date)
    movements = generate_mock_movements(seed=42)
    if business_type is not None:
        movements = [
            item for item in movements if item.business_type == business_type]

    current_movements = filter_movements(
        movements, start_date, end_date, category=None, operation_type=None
    )
    current_net = calculate_net_value(current_movements)

    duration = end_date - start_date
    previous_end = start_date - timedelta(days=1)
    previous_start = previous_end - duration
    previous_movements = filter_movements(
        movements, previous_start, previous_end, category=None, operation_type=None
    )
    previous_net = calculate_net_value(previous_movements)

    delta_abs = round(current_net - previous_net, 2)
    delta_pct = None
    if previous_net != 0:
        delta_pct = round((delta_abs / abs(previous_net)) * 100, 2)

    return MetricsComparison(
        current_period=current_net,
        previous_period=previous_net,
        delta_abs=delta_abs,
        delta_pct=delta_pct,
    )


@router.get("/api/metrics/alerts", response_model=list[MetricsAlert])
def get_metrics_alerts(
    threshold: float = Query(default=0.3, ge=0.01, le=1.0),
    group_by: GroupBy = Query(default="month"),
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    business_type: BusinessType | None = Query(default=None),
) -> list[MetricsAlert]:
    validate_date_range(start_date, end_date)
    movements = generate_mock_movements(seed=42)
    if business_type is not None:
        movements = [
            item for item in movements if item.business_type == business_type]

    baseline_summary = summarize_movements(movements, group_by)
    filtered = filter_movements(
        movements, start_date, end_date, category=None, operation_type=None
    )
    summary = summarize_movements(filtered, group_by)
    return detect_outcome_alerts(
        summary, threshold, baseline_summary=baseline_summary, group_by=group_by
    )


@router.get("/api/metrics/b2b", response_model=list[FinancialMovement])
def get_b2b_metrics(
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    category: Category | None = Query(default=None),
    operation_type: OperationType | None = Query(default=None),
) -> list[FinancialMovement]:
    validate_date_range(start_date, end_date)
    movements = [
        movement for movement in generate_mock_movements(seed=42) if movement.business_type == "B2B"
    ]
    filtered = filter_movements(
        movements, start_date, end_date, category, operation_type
    )
    return ensure_chronological_order(filtered)


@router.get("/api/metrics/b2c", response_model=list[FinancialMovement])
def get_b2c_metrics(
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    category: Category | None = Query(default=None),
    operation_type: OperationType | None = Query(default=None),
) -> list[FinancialMovement]:
    validate_date_range(start_date, end_date)
    movements = [
        movement for movement in generate_mock_movements(seed=42) if movement.business_type == "B2C"
    ]
    filtered = filter_movements(
        movements, start_date, end_date, category, operation_type
    )
    return ensure_chronological_order(filtered)
