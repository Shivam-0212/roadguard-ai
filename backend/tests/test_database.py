from backend.app.database.repository import InspectionRepository


def test_repository_crud(db_session):
    repo = InspectionRepository(db_session)

    # Create session
    session = repo.create_session(
        session_id="test-session-123",
        filename="road_sample_01.jpg",
        file_type="image",
        original_file_path="/uploads/images/road_sample_01.jpg",
        annotated_file_path="/outputs/images/annotated_road_sample_01.jpg",
        detection_count=2,
        highest_severity="high",
        pothole_count=1,
        crack_count=1,
        manhole_count=0,
        processing_time_ms=45.2
    )

    assert session.id == "test-session-123"
    assert session.filename == "road_sample_01.jpg"

    # Add detections
    detections_data = [
        {
            "class_id": 0,
            "class_name": "pothole",
            "confidence": 0.89,
            "bbox": [100.0, 150.0, 250.0, 220.0],
            "bbox_area": 10500.0,
            "area_percentage": 4.5,
            "center_x": 0.27,
            "center_y": 0.51,
            "relative_x": "left",
            "relative_y": "middle",
            "severity": "high",
            "severity_score": 75.0,
            "severity_rationale": "Critical cavity defect"
        },
        {
            "class_id": 1,
            "class_name": "crack",
            "confidence": 0.76,
            "bbox": [300.0, 200.0, 500.0, 230.0],
            "bbox_area": 6000.0,
            "area_percentage": 2.6,
            "center_x": 0.62,
            "center_y": 0.59,
            "relative_x": "center",
            "relative_y": "middle",
            "severity": "moderate",
            "severity_score": 45.0,
            "severity_rationale": "Moderate fissure"
        }
    ]
    repo.add_detections("test-session-123", detections_data)

    # Retrieve session
    retrieved = repo.get_session("test-session-123")
    assert retrieved is not None
    assert len(retrieved.detections) == 2
    assert retrieved.detections[0].class_name == "pothole"

    # Summary statistics
    stats = repo.get_summary_statistics()
    assert stats["total_sessions"] == 1
    assert stats["total_potholes"] == 1
    assert stats["total_cracks"] == 1
    assert stats["total_manholes"] == 0
    assert stats["high_severity_defects"] == 1

    # Filtered list
    sessions, total = repo.list_sessions(severity_filter="high")
    assert total == 1
    assert len(sessions) == 1

    sessions_low, total_low = repo.list_sessions(severity_filter="low")
    assert total_low == 0

    # Delete session
    deleted = repo.delete_session("test-session-123")
    assert deleted is True
    assert repo.get_session("test-session-123") is None

