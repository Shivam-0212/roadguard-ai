def test_export_detections_csv_empty(client):
    response = client.get("/api/reports/detections.csv")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/csv")
    assert "Detection_ID,Session_ID,File_Name" in response.text

