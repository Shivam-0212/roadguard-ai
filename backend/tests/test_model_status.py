def test_model_status_endpoint(client):
    response = client.get("/api/model/status")
    assert response.status_code == 200
    data = response.json()
    assert "model_ready" in data
    assert "model_name" in data
    assert "classes" in data
    # Classes should have 0, 1, 2
    assert "0" in data["classes"] or 0 in data["classes"]


def test_model_metrics_endpoint(client):
    response = client.get("/api/model/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "metrics" in data
    assert "per_class" in data
    assert "pothole" in data["per_class"]
    assert "crack" in data["per_class"]
    assert "manhole" in data["per_class"]

