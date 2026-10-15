from datetime import date

import pytest
from fastapi.testclient import TestClient

from app import routes
from app.main import app
from app.routes import (
    FinancialMovement,
    MetricsSummaryItem,
    detect_outcome_alerts,
    filter_movements_by_date,
    generate_mock_movements,
)


client = TestClient(app)


def test_generate_mock_movements_returns_full_year_sorted_data():
    movements = generate_mock_movements(seed=42)

    assert len(movements) == 360
    assert movements == sorted(movements, key=lambda item: item.create_date)


def test_filter_movements_by_date_includes_range_edges():
    movements = generate_mock_movements(seed=42)
    target_date = movements[0].create_date

    filtered = filter_movements_by_date(movements, target_date, target_date)

    assert filtered
    assert all(movement.create_date == target_date for movement in filtered)


def test_health_endpoint_returns_ok():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_metrics_endpoint_respects_date_filters():
    base_response = client.get("/api/metrics")
    assert base_response.status_code == 200
    first_date = base_response.json()[0]["create_date"]

    response = client.get(
        "/api/metrics",
        params={"start_date": first_date, "end_date": first_date},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload
    assert all(item["create_date"] == first_date for item in payload)


def test_metrics_endpoint_returns_financial_movement_contract():
    response = client.get("/api/metrics")

    assert response.status_code == 200
    payload = response.json()
    assert payload
    movement = payload[0]
    assert set(movement) == {
        "create_date",
        "amount",
        "operation_type",
        "category",
        "business_type",
    }
    assert isinstance(movement["create_date"], str)
    assert isinstance(movement["amount"], (int, float))
    assert movement["operation_type"] in {"income", "outcome"}
    assert movement["category"] in {
        "suppliers",
        "sales",
        "operational",
        "administrative",
        "others",
    }
    assert movement["business_type"] in {"B2B", "B2C"}


def test_b2b_endpoint_only_returns_b2b_records():
    response = client.get("/api/metrics/b2b")

    assert response.status_code == 200
    payload = response.json()
    assert payload
    assert all(item["business_type"] == "B2B" for item in payload)
    assert payload == sorted(payload, key=lambda item: item["create_date"])


def test_b2c_endpoint_only_returns_b2c_records():
    response = client.get("/api/metrics/b2c")

    assert response.status_code == 200
    payload = response.json()
    assert payload
    assert all(item["business_type"] == "B2C" for item in payload)
    assert payload == sorted(payload, key=lambda item: item["create_date"])


def test_metrics_endpoint_filters_by_category():
    response = client.get("/api/metrics", params={"category": "sales"})

    assert response.status_code == 200
    payload = response.json()
    assert payload
    assert all(item["category"] == "sales" for item in payload)


def test_metrics_endpoint_filters_by_operation_type():
    response = client.get("/api/metrics", params={"operation_type": "income"})

    assert response.status_code == 200
    payload = response.json()
    assert payload
    assert all(item["operation_type"] == "income" for item in payload)


def test_b2b_endpoint_combines_new_filters():
    response = client.get(
        "/api/metrics/b2b",
        params={"operation_type": "outcome", "category": "suppliers"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload
    assert all(item["business_type"] == "B2B" for item in payload)
    assert all(item["operation_type"] == "outcome" for item in payload)
    assert all(item["category"] == "suppliers" for item in payload)


def test_metrics_facets_returns_filter_options_and_date_range():
    response = client.get("/api/metrics/facets")

    assert response.status_code == 200
    payload = response.json()
    assert sorted(payload["operation_types"]) == ["income", "outcome"]
    assert payload["business_types"] == ["B2B", "B2C"]
    assert payload["categories"] == [
        "administrative",
        "operational",
        "others",
        "sales",
        "suppliers",
    ]
    assert payload["min_date"] <= payload["max_date"]


def test_metrics_summary_by_month_returns_balances():
    response = client.get("/api/metrics/summary", params={"group_by": "month"})

    assert response.status_code == 200
    payload = response.json()
    assert payload
    first = payload[0]
    assert set(first.keys()) == {"period", "income", "outcome", "net"}
    assert all(item["income"] >= 0 for item in payload)
    assert all(item["outcome"] >= 0 for item in payload)


def test_metrics_summary_by_week_honors_business_type_filter():
    response = client.get(
        "/api/metrics/summary",
        params={"group_by": "week", "business_type": "B2C"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload


def test_top_categories_returns_limited_sorted_categories():
    response = client.get(
        "/api/metrics/categories/top",
        params={"operation_type": "outcome", "limit": 3},
    )

    assert response.status_code == 200
    payload = response.json()
    assert len(payload) == 3
    assert payload[0]["total_amount"] >= payload[1]["total_amount"]
    assert all(item["operation_type"] == "outcome" for item in payload)


def test_metrics_comparison_returns_delta_fields():
    response = client.get(
        "/api/metrics/comparison",
        params={"start_date": "2025-03-01", "end_date": "2025-03-31"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert set(payload.keys()) == {
        "current_period",
        "previous_period",
        "delta_abs",
        "delta_pct",
    }


def test_metrics_alerts_returns_anomaly_candidates():
    response = client.get(
        "/api/metrics/alerts",
        params={"threshold": 0.2, "group_by": "month"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert isinstance(payload, list)
    if payload:
        first = payload[0]
        assert set(first.keys()) == {
            "period",
            "outcome_total",
            "baseline_average",
            "increase_ratio",
        }


def test_outcome_alerts_use_all_previous_periods_for_baseline():
    """Protect the cumulative historical baseline and alert ratio (routes.py:219-239)."""
    summary = [
        MetricsSummaryItem(period="2025-01", income=0, outcome=100, net=-100),
        MetricsSummaryItem(period="2025-02", income=0, outcome=200, net=-200),
        MetricsSummaryItem(period="2025-03", income=0, outcome=600, net=-600),
    ]

    alerts = detect_outcome_alerts(summary, threshold=2.5)

    assert len(alerts) == 1
    assert alerts[0].period == "2025-03"
    assert alerts[0].outcome_total == pytest.approx(600.0)
    assert alerts[0].baseline_average == pytest.approx(150.0)
    assert alerts[0].increase_ratio == pytest.approx(3.0)


@pytest.mark.parametrize(
    ("threshold", "expected_alert"),
    [(0.25, False), (0.249, True)],
    ids=["equal-to-threshold-is-not-an-alert", "above-threshold-alerts"],
)
def test_outcome_alerts_require_increase_to_exceed_threshold(
    threshold, expected_alert
):
    """Protect the strict greater-than threshold rule (routes.py:229-230)."""
    summary = [
        MetricsSummaryItem(period="2025-01", income=0, outcome=100, net=-100),
        MetricsSummaryItem(period="2025-02", income=0, outcome=125, net=-125),
    ]

    alerts = detect_outcome_alerts(summary, threshold)

    assert bool(alerts) is expected_alert
    if alerts:
        assert alerts[0].increase_ratio == pytest.approx(0.25)


def test_income_top_categories_only_returns_sales_and_others_and_honors_limit(
    monkeypatch,
):
    """Protect income category scope, aggregation, and limit (routes.py:75-80, 190-207, 288-300)."""
    movements = [
        FinancialMovement(
            create_date=date(2025, 1, 1),
            amount=40,
            operation_type="income",
            category="sales",
            business_type="B2B",
        ),
        FinancialMovement(
            create_date=date(2025, 1, 2),
            amount=60,
            operation_type="income",
            category="sales",
            business_type="B2C",
        ),
        FinancialMovement(
            create_date=date(2025, 1, 3),
            amount=30,
            operation_type="income",
            category="others",
            business_type="B2B",
        ),
        FinancialMovement(
            create_date=date(2025, 1, 4),
            amount=500,
            operation_type="outcome",
            category="suppliers",
            business_type="B2B",
        ),
    ]
    monkeypatch.setattr(
        routes, "generate_mock_movements", lambda seed: movements
    )

    response = client.get(
        "/api/metrics/categories/top",
        params={"operation_type": "income", "limit": 20},
    )

    assert response.status_code == 200
    payload = response.json()
    assert {item["category"] for item in payload} == {"sales", "others"}
    assert all(item["operation_type"] == "income" for item in payload)
    assert [item["total_amount"] for item in payload] == pytest.approx(
        [100.0, 30.0]
    )

    limited_response = client.get(
        "/api/metrics/categories/top",
        params={"operation_type": "income", "limit": 1},
    )

    assert limited_response.status_code == 200
    assert [item["category"] for item in limited_response.json()] == ["sales"]


@pytest.mark.parametrize(
    ("path", "params"),
    [
        ("/api/metrics", {"start_date": "not-a-date"}),
        ("/api/metrics", {"operation_type": "transfer"}),
        ("/api/metrics/summary", {"group_by": "quarter"}),
        ("/api/metrics/categories/top", {"limit": 0}),
        ("/api/metrics/categories/top", {"limit": 21}),
        ("/api/metrics/alerts", {"threshold": -0.01}),
    ],
    ids=[
        "invalid-date",
        "invalid-operation-type",
        "invalid-group-by",
        "limit-below-minimum",
        "limit-above-maximum",
        "negative-threshold",
    ],
)
def test_metrics_endpoints_return_422_for_invalid_query_parameters(path, params):
    """Protect FastAPI query constraints and Literal validation (routes.py:11-15, 244-300, 343-345)."""
    response = client.get(path, params=params)

    assert response.status_code == 422


@pytest.mark.parametrize(
    ("previous_income", "current_income", "expected_delta", "expected_delta_pct"),
    [
        (0, 100, 100, None),
        (80, 160, 80, 100),
    ],
    ids=["zero-previous-net-has-no-percent", "nonzero-previous-net-percent"],
)
def test_metrics_comparison_calculates_deltas_and_zero_previous_percentage(
    monkeypatch, previous_income, current_income, expected_delta, expected_delta_pct
):
    """Protect period selection, net deltas, and zero-denominator handling (routes.py:306-335)."""
    movements = [
        FinancialMovement(
            create_date=date(2025, 1, 31),
            amount=previous_income,
            operation_type="income",
            category="sales",
            business_type="B2B",
        ),
        FinancialMovement(
            create_date=date(2025, 2, 2),
            amount=current_income,
            operation_type="income",
            category="sales",
            business_type="B2B",
        ),
    ]
    monkeypatch.setattr(
        routes, "generate_mock_movements", lambda seed: movements
    )

    response = client.get(
        "/api/metrics/comparison",
        params={"start_date": "2025-02-02", "end_date": "2025-02-03"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["current_period"] == pytest.approx(current_income)
    assert payload["previous_period"] == pytest.approx(previous_income)
    assert payload["delta_abs"] == pytest.approx(expected_delta)
    if expected_delta_pct is None:
        assert payload["delta_pct"] is None
    else:
        assert payload["delta_pct"] == pytest.approx(expected_delta_pct)
