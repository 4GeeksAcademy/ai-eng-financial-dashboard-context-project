from datetime import date

from fastapi.testclient import TestClient

from app.main import app
from app.routes import (
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


def test_date_filtered_endpoints_reject_inverted_ranges():
    date_range = {"start_date": "2025-03-31", "end_date": "2025-03-01"}
    endpoints = [
        "/api/metrics",
        "/api/metrics/summary",
        "/api/metrics/categories/top",
        "/api/metrics/comparison",
        "/api/metrics/alerts",
        "/api/metrics/b2b",
        "/api/metrics/b2c",
    ]

    for endpoint in endpoints:
        response = client.get(endpoint, params=date_range)
        assert response.status_code == 422


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
    movements = generate_mock_movements(seed=42)
    expected_categories_by_business_type = {
        business_type: sorted({
            item.category
            for item in movements
            if item.business_type == business_type
        })
        for business_type in ("B2B", "B2C")
    }
    assert payload["categories_by_business_type"] == expected_categories_by_business_type
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


def test_alerts_use_three_previous_periods_from_full_history():
    full_summary = [
        MetricsSummaryItem(period="2025-01", income=0, outcome=1000, net=-1000),
        MetricsSummaryItem(period="2025-02", income=0, outcome=100, net=-100),
        MetricsSummaryItem(period="2025-03", income=0, outcome=200, net=-200),
        MetricsSummaryItem(period="2025-04", income=0, outcome=300, net=-300),
        MetricsSummaryItem(period="2025-05", income=0, outcome=600, net=-600),
    ]

    alerts = detect_outcome_alerts(
        [full_summary[-1]],
        threshold=0.3,
        baseline_summary=full_summary,
    )

    assert len(alerts) == 1
    assert alerts[0].period == "2025-05"
    assert alerts[0].baseline_average == 200
    assert alerts[0].increase_ratio == 2


def test_alerts_skip_periods_without_three_months_of_history():
    summary = [
        MetricsSummaryItem(period="2025-01", income=0, outcome=100, net=-100),
        MetricsSummaryItem(period="2025-02", income=0, outcome=100, net=-100),
        MetricsSummaryItem(period="2025-03", income=0, outcome=1000, net=-1000),
    ]

    assert detect_outcome_alerts(summary, threshold=0.3) == []


def test_alerts_use_three_previous_weekly_periods_when_requested():
    summary = [
        MetricsSummaryItem(period="2025-W01", income=0, outcome=1000, net=-1000),
        MetricsSummaryItem(period="2025-W02", income=0, outcome=100, net=-100),
        MetricsSummaryItem(period="2025-W03", income=0, outcome=200, net=-200),
        MetricsSummaryItem(period="2025-W04", income=0, outcome=300, net=-300),
        MetricsSummaryItem(period="2025-W05", income=0, outcome=600, net=-600),
    ]

    alerts = detect_outcome_alerts(summary, threshold=0.3, group_by="week")

    assert alerts[-1].period == "2025-W05"
    assert alerts[-1].baseline_average == 200


def test_alert_threshold_is_limited_to_supported_range():
    for threshold in (0.01, 1.0):
        assert client.get("/api/metrics/alerts", params={"threshold": threshold}).status_code == 200

    for threshold in (0.009, 1.001):
        assert client.get("/api/metrics/alerts", params={"threshold": threshold}).status_code == 422
