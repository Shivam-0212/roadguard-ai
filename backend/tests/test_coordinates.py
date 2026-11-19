from ml.inference.detector import compute_relative_position


def test_compute_relative_position():
    # Top-left quadrant
    x_pos, y_pos = compute_relative_position(0.15, 0.20)
    assert x_pos == "left"
    assert y_pos == "upper"

    # Center-center
    x_pos, y_pos = compute_relative_position(0.50, 0.50)
    assert x_pos == "center"
    assert y_pos == "middle"

    # Bottom-right quadrant
    x_pos, y_pos = compute_relative_position(0.85, 0.90)
    assert x_pos == "right"
    assert y_pos == "lower"

