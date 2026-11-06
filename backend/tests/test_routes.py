from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.routes import filter_movements_by_date, generate_mock_movements


client = TestClient(app)


def _net(movements):
    return sum(
        item.amount if item.operation_type == "income" else -item.amount
        for item in movements
    )


def _in_range(movements, start, end):
    return [item for item in movements if start <= item.create_date <= end]


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


def test_metrics_summary_by_day_totals_each_date():
    movements = generate_mock_movements(seed=42)

    response = client.get("/api/metrics/summary", params={"group_by": "day"})

    assert response.status_code == 200
    payload = response.json()
    assert [item["period"] for item in payload] == sorted(
        {item.create_date.isoformat() for item in movements}
    )
    for item in payload:
        day = date.fromisoformat(item["period"])
        assert item["net"] == pytest.approx(
            _net(_in_range(movements, day, day)), abs=0.01
        )


def test_top_categories_honors_business_type_filter():
    b2c_outcomes = [
        item
        for item in generate_mock_movements(seed=42)
        if item.business_type == "B2C" and item.operation_type == "outcome"
    ]
    expected = {}
    for item in b2c_outcomes:
        expected[item.category] = expected.get(item.category, 0) + item.amount

    response = client.get(
        "/api/metrics/categories/top",
        params={"operation_type": "outcome", "business_type": "B2C"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert {item["category"] for item in payload} == set(expected)
    for item in payload:
        assert item["total_amount"] == pytest.approx(
            expected[item["category"]], abs=0.01
        )


def test_metrics_comparison_calculates_net_and_delta_for_business_type():
    b2b = [
        item
        for item in generate_mock_movements(seed=42)
        if item.business_type == "B2B"
    ]
    end = max(item.create_date for item in b2b)
    start = end - timedelta(days=59)
    previous_end = start - timedelta(days=1)
    previous_start = previous_end - timedelta(days=59)
    current = _net(_in_range(b2b, start, end))
    previous = _net(_in_range(b2b, previous_start, previous_end))
    assert previous != 0

    response = client.get(
        "/api/metrics/comparison",
        params={
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
            "business_type": "B2B",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["current_period"] == pytest.approx(current, abs=0.01)
    assert payload["previous_period"] == pytest.approx(previous, abs=0.01)
    assert payload["delta_abs"] == pytest.approx(current - previous, abs=0.01)
    assert payload["delta_pct"] == pytest.approx(
        (current - previous) / abs(previous) * 100, abs=0.01
    )


def test_metrics_alerts_honors_business_type_and_threshold():
    monthly_outcome = {}
    for item in generate_mock_movements(seed=42):
        key = item.create_date.strftime("%Y-%m")
        monthly_outcome.setdefault(key, 0)
        if item.business_type == "B2C" and item.operation_type == "outcome":
            monthly_outcome[key] += item.amount
    expected = []
    earlier = []
    for period in sorted(monthly_outcome):
        outcome = monthly_outcome[period]
        if earlier and outcome > (sum(earlier) / len(earlier)) * 1.1:
            expected.append(period)
        earlier.append(outcome)
    assert expected

    response = client.get(
        "/api/metrics/alerts",
        params={"threshold": 0.1, "business_type": "B2C"},
    )

    assert response.status_code == 200
    assert [item["period"] for item in response.json()] == expected


@pytest.mark.parametrize(
    ("path", "params"),
    [
        ("/api/metrics", {"category": "unknown"}),
        ("/api/metrics/summary", {"group_by": "year"}),
        ("/api/metrics/categories/top", {"limit": 0}),
        ("/api/metrics/categories/top", {"limit": 21}),
        ("/api/metrics/comparison", {}),
        ("/api/metrics/alerts", {"threshold": -1}),
    ],
)
def test_invalid_query_parameters_return_422(path, params):
    assert client.get(path, params=params).status_code == 422
