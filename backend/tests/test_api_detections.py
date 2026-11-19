import io
from PIL import Image
from backend.app.core.model_loader import model_manager


def test_image_detection_model_not_ready_returns_503(client, monkeypatch):
    """
    When no checkpoint is loaded, uploading an image must return 503
    with a clear explanation directing the user to run Colab training.
    """
    monkeypatch.setattr(model_manager, "is_ready", lambda: False)

    # Create a small valid test image in memory
    img = Image.new("RGB", (100, 100), color=(73, 109, 137))
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format="JPEG")
    img_byte_arr.seek(0)

    response = client.post(
        "/api/detections/image",
        files={"file": ("test_road.jpg", img_byte_arr, "image/jpeg")}
    )
    assert response.status_code == 503
    data = response.json()
    assert "detail" in data
    assert "Colab" in data["detail"] or "checkpoint" in data["detail"]


def test_image_detection_model_ready_returns_200(client):
    """
    When a checkpoint is loaded, uploading a valid image must return 200.
    """
    img = Image.new("RGB", (100, 100), color=(73, 109, 137))
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format="JPEG")
    img_byte_arr.seek(0)

    response = client.post(
        "/api/detections/image",
        files={"file": ("test_road_ready.jpg", img_byte_arr, "image/jpeg")}
    )
    if model_manager.is_ready():
        assert response.status_code == 200
        data = response.json()
        assert "detections" in data
        assert "annotated_image_url" in data
    else:
        assert response.status_code == 503


def test_unsupported_file_format_returns_400(client):
    fake_txt = io.BytesIO(b"not an image")
    response = client.post(
        "/api/detections/image",
        files={"file": ("document.pdf", fake_txt, "application/pdf")}
    )
    assert response.status_code == 400
    assert "Unsupported" in response.json()["detail"]

