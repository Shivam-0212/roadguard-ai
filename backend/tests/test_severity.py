from ml.inference.detector import estimate_visual_severity


def test_manhole_severity():
    # Manholes (Class 2) should always be classified as infrastructure with zero damage score
    sev, score, rationale = estimate_visual_severity(
        class_id=2,
        area_percentage=4.5,
        box_width=100,
        box_height=100,
        center_y=0.5
    )
    assert sev == "infrastructure"
    assert score == 0.0
    assert "infrastructure" in rationale.lower()


def test_pothole_severity_critical():
    # Pothole (Class 0) with large area and close to vehicle (lower half)
    sev, score, rationale = estimate_visual_severity(
        class_id=0,
        area_percentage=3.2,
        box_width=150,
        box_height=120,
        center_y=0.75
    )
    assert sev == "high"
    assert score >= 65.0
    assert "critical" in rationale.lower()


def test_pothole_severity_minor():
    # Pothole (Class 0) with small area
    sev, score, rationale = estimate_visual_severity(
        class_id=0,
        area_percentage=0.4,
        box_width=30,
        box_height=25,
        center_y=0.4
    )
    assert sev == "low"
    assert score < 35.0


def test_crack_severity_high_aspect_ratio():
    # Elongated crack (Class 1)
    sev, score, rationale = estimate_visual_severity(
        class_id=1,
        area_percentage=2.2,
        box_width=250,
        box_height=20,
        center_y=0.5
    )
    assert sev == "high"
    assert score >= 60.0


def test_crack_severity_minor():
    # Small superficial hairline crack
    sev, score, rationale = estimate_visual_severity(
        class_id=1,
        area_percentage=0.3,
        box_width=40,
        box_height=30,
        center_y=0.3
    )
    assert sev == "low"
    assert score < 30.0

