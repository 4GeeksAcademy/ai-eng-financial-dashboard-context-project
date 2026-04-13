from __future__ import annotations

import random
from datetime import date
from typing import Literal

from fastapi import APIRouter, Query
from pydantic import BaseModel

OperationType = Literal["income", "outcome"]
Category = Literal["suppliers", "sales",
                   "operational", "administrative", "others"]
BusinessType = Literal["B2B", "B2C"]

OUTCOME_CATEGORIES = ["suppliers", "operational", "administrative", "others"]

router = APIRouter()


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
    min_date: date
    max_date: date


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
        min_date=ordered[0].create_date,
        max_date=ordered[-1].create_date,
    )


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
    movements = generate_mock_movements(seed=42)
    filtered = filter_movements(
        movements, start_date, end_date, category, operation_type
    )
    return ensure_chronological_order(filtered)


@router.get("/api/metrics/facets", response_model=MetricsFacets)
def get_metrics_facets() -> MetricsFacets:
    movements = generate_mock_movements(seed=42)
    return build_metrics_facets(movements)


@router.get("/api/metrics/b2b", response_model=list[FinancialMovement])
def get_b2b_metrics(
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    category: Category | None = Query(default=None),
    operation_type: OperationType | None = Query(default=None),
) -> list[FinancialMovement]:
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
    movements = [
        movement for movement in generate_mock_movements(seed=42) if movement.business_type == "B2C"
    ]
    filtered = filter_movements(
        movements, start_date, end_date, category, operation_type
    )
    return ensure_chronological_order(filtered)
